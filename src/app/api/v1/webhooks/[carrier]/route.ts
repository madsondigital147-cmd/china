import { NextRequest } from "next/server";
import { handleInboundWebhook } from "@/lib/api/webhook-route";
import { handleCarrierWebhook, CARRIER_HANDLERS } from "@/lib/api/carrier-webhooks";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ carrier: string }> }) => {
  const { carrier } = await ctx.params;
  const handler = CARRIER_HANDLERS[carrier];
  if (handler) {
    return handleCarrierWebhook(req, carrier, handler);
  }
  return handleInboundWebhook(req, carrier);
};