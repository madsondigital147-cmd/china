import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { processCarrierWebhook, WebhookError } from "@/services/webhook";
import { jsonError, jsonOk } from "@/lib/api/json";

export interface CarrierWebhookHandler {
  carrierCode: string;
  validateSignature: (req: NextRequest, secret: string) => Promise<boolean>;
}

const CORREIOS_SECRET = process.env.CORREIOS_WEBHOOK_SECRET;
const JADLOG_SECRET = process.env.JADLOG_WEBHOOK_SECRET;

function hmacSha256(secret: string, payload: string): string {
  const { createHmac } = require("crypto");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

async function validateCorreios(req: NextRequest, secret: string): Promise<boolean> {
  const signature = req.headers.get("x-correios-signature");
  if (!signature || !secret) return false;
  const body = await req.text();
  const expected = hmacSha256(secret, body);
  const { timingSafeEqual } = require("crypto");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

async function validateJadlog(req: NextRequest, secret: string): Promise<boolean> {
  const signature = req.headers.get("x-jadlog-signature");
  if (!signature || !secret) return false;
  const body = await req.text();
  const expected = hmacSha256(secret, body);
  const { timingSafeEqual } = require("crypto");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const CARRIER_HANDLERS: Record<string, CarrierWebhookHandler> = {
  correios: {
    carrierCode: "correios",
    validateSignature: validateCorreios,
  },
  jadlog: {
    carrierCode: "jadlog",
    validateSignature: validateJadlog,
  },
};

export async function handleCarrierWebhook(
  req: NextRequest,
  carrierCode: string,
  handler: CarrierWebhookHandler,
) {
  const secret = carrierCode === "correios" ? CORREIOS_SECRET : JADLOG_SECRET;
  if (!secret) {
    return jsonError("CONFIG_ERROR", "Webhook secret not configured for carrier", 500);
  }

  const valid = await handler.validateSignature(req, secret);
  if (!valid) {
    return jsonError("INVALID_SIGNATURE", "Invalid webhook signature", 401);
  }

  // Let processCarrierWebhook handle the rest (it will parse JSON body, find org, etc.)
  const rawBody = await req.text();
  try {
    const carrier = await prisma.carrier.findFirst({
      where: { code: carrierCode.toUpperCase() },
      select: { id: true, organizationId: true, webhookSecret: true },
    });

    if (!carrier) {
      return jsonError("NOT_FOUND", "Carrier not found", 404);
    }

    const input = {
      organizationId: carrier.organizationId,
      carrierCode,
      signature: req.headers.get("x-correios-signature") ?? req.headers.get("x-jadlog-signature") ?? undefined,
      body: rawBody,
    };

    await processCarrierWebhook(input);
    return jsonOk({ received: true });
  } catch (e) {
    if (e instanceof WebhookError) {
      const codeByError = {
        NO_SHIPMENT: 404,
        VALIDATION: 400,
        INVALID_BODY: 400,
        INVALID_SIGNATURE: 401,
      } as const;
      return jsonError(e.code, e.message, codeByError[e.code] ?? 400);
    }
    console.error("Carrier webhook error:", e);
    return jsonError("INTERNAL_ERROR", "Internal error processing webhook", 500);
  }
}