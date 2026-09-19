import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, extractBearerToken, logApiRequest } from "@/lib/api/auth";
import { jsonOk, notFound, serverError, unauthorized } from "@/lib/api/json";
import { STATUSES } from "@/lib/status";

export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const started = Date.now();
  const auth = await authenticateApiKey(extractBearerToken(req.headers.get("authorization")));
  if (!auth) {
    await logApiRequest({
      organizationId: "unknown",
      apiKeyId: null,
      method: "GET",
      path: req.nextUrl.pathname,
      statusCode: 401,
      latencyMs: Date.now() - started,
      ip: req.headers.get("x-forwarded-for") ?? null,
    });
    return unauthorized();
  }

  const { id } = await ctx.params;

  try {
    const shipment = await prisma.shipment.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
      include: {
        senderAddress: true,
        recipientAddress: true,
        packageData: true,
        carrier: { select: { name: true, code: true } },
        service: { select: { name: true, code: true } },
        createdBy: { select: { name: true } },
        events: { orderBy: { occurredAt: "desc" }, take: 50 },
      },
    });

    if (!shipment) return notFound("Shipment not found");

    const response = {
      ok: true,
      data: {
        id: shipment.id,
        shipmentNumber: shipment.shipmentNumber,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        statusLabel: STATUSES[shipment.status].label,
        isDemo: shipment.isDemo,
        isPriority: shipment.isPriority,
        reference: shipment.reference,
        customerOrderId: shipment.customerOrderId,
        shippingMethod: shipment.shippingMethod,
        carrier: shipment.carrier?.name ?? null,
        carrierCode: shipment.carrier?.code ?? null,
        service: shipment.service?.name ?? null,
        serviceCode: shipment.service?.code ?? null,
        sender: shipment.senderAddress,
        recipient: shipment.recipientAddress,
        package: shipment.packageData
          ? {
              ...shipment.packageData,
              weightKg: Number(shipment.packageData.weightKg),
              lengthCm: Number(shipment.packageData.lengthCm),
              widthCm: Number(shipment.packageData.widthCm),
              heightCm: Number(shipment.packageData.heightCm),
              declaredValue: Number(shipment.packageData.declaredValue),
            }
          : null,
        createdBy: shipment.createdBy?.name ?? null,
        createdAt: shipment.createdAt.toISOString(),
        updatedAt: shipment.updatedAt.toISOString(),
        estDeliveryStart: shipment.estimatedDeliveryStart?.toISOString() ?? null,
        estDeliveryEnd: shipment.estimatedDeliveryEnd?.toISOString() ?? null,
        events: shipment.events.map((e) => ({
          id: e.id,
          status: e.status,
          providerStatus: e.providerStatus,
          description: e.description,
          location: e.location,
          city: e.city,
          countryCode: e.countryCode,
          occurredAt: e.occurredAt?.toISOString() ?? null,
        })),
      },
    };

    await logApiRequest({
      organizationId: auth.organizationId,
      apiKeyId: auth.apiKeyId,
      method: "GET",
      path: req.nextUrl.pathname,
      statusCode: 200,
      latencyMs: Date.now() - started,
      ip: req.headers.get("x-forwarded-for") ?? null,
      responseJson: { shipmentNumber: shipment.shipmentNumber },
    });

    return jsonOk(response);
  } catch (err) {
    return serverError();
  }
};