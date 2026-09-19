import { NextRequest } from "next/server";
import { handleInboundWebhook } from "@/lib/api/webhook-route";

export const dynamic = "force-dynamic";

export const POST = async (req: NextRequest, ctx: { params: Promise<{ carrier: string }> }) => {
  const { carrier } = await ctx.params;
  return handleInboundWebhook(req, carrier);
};