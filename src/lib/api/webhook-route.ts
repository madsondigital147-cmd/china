import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { processCarrierWebhook, WebhookError } from "@/services/webhook";
import { badRequest, jsonError, jsonOk, unauthorized } from "@/lib/api/json";
import { logApiRequest } from "@/lib/api/auth";

/**
 * Shared inbound webhook handler for both endpoints (spec §29-31, §97):
 *   POST /api/webhooks/:carrier        — carrier passthrough (HMAC verified by service)
 *   POST /api/v1/webhooks/:carrier     — same pipeline, API-key option
 *
 * The carrier is resolved by `code`; the signature is validated inside
 * `processCarrierWebhook` when the carrier has a webhookSecret configured.
 */
export async function handleInboundWebhook(req: NextRequest, carrierCode: string) {
  const started = Date.now();
  const rawBody = await req.text();

  const carrier = carrierCode
    ? await prisma.carrier.findFirst({
        where: { code: carrierCode.toUpperCase() },
        select: { id: true, organizationId: true, webhookSecret: true },
      })
    : null;

  const input = {
    organizationId: carrier?.organizationId ?? "",
    carrierCode,
    signature: req.headers.get("x-webhook-signature") ?? req.headers.get("x-signature"),
    body: rawBody,
  };

  try {
    const results = await processCarrierWebhook(input);
    await logApiRequest({
      organizationId: input.organizationId,
      apiKeyId: null,
      method: "POST",
      path: req.nextUrl.pathname,
      statusCode: 200,
      latencyMs: Date.now() - started,
      ip: req.headers.get("x-forwarded-for") ?? null,
      requestJson: { carrier: carrierCode },
      responseJson: { results },
    });
    return jsonOk({ ok: true, results });
  } catch (err) {
    if (err instanceof WebhookError) {
      const codeByError = {
        NO_SHIPMENT: 404,
        VALIDATION: 422,
        INVALID_BODY: 400,
        INVALID_SIGNATURE: 401,
      } as const;
      return jsonError(err.code, err.message, codeByError[err.code] ?? 400);
    }
    return jsonError("INTERNAL_ERROR", "Failed to process webhook", 500);
  }
}