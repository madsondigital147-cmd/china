import { NextRequest, NextResponse } from "next/server";
import { getShipmentByTracking } from "@/services/shipment";
import { normalizeTrackingInput } from "@/lib/utils";
import { notFound, serverError } from "@/lib/api/json";
import { STATUSES } from "@/lib/status";

export const dynamic = "force-dynamic";

export const GET = async (_req: NextRequest, ctx: { params: Promise<{ trackingNumber: string }> }) => {
  const { trackingNumber } = await ctx.params;
  const normalized = normalizeTrackingInput(trackingNumber);

  try {
    const shipment = await getShipmentByTracking(normalized);
    if (!shipment || shipment.trackingNumber === null) return notFound("Tracking number not found");

    const lastEvent = shipment.events.at(-1);
    const events = shipment.events.map((e) => ({
      id: e.id,
      status: e.status,
      statusLabel: STATUSES[e.status].label,
      providerStatus: e.providerStatus,
      description: e.description,
      location: e.location,
      city: e.city,
      countryCode: e.countryCode,
      occurredAt: e.occurredAt?.toISOString() ?? null,
      source: e.source,
    }));

    return NextResponse.json({
      ok: true,
      tracking: {
        trackingNumber: shipment.trackingNumber,
        shipmentNumber: shipment.shipmentNumber,
        status: shipment.status,
        statusLabel: STATUSES[shipment.status].label,
        carrier: shipment.carrier?.name ?? null,
        service: shipment.service?.name ?? null,
        origin: {
          city: shipment.senderAddress?.city ?? null,
          countryCode: shipment.senderAddress?.countryCode ?? null,
        },
        destination: {
          city: shipment.recipientAddress?.city ?? null,
          countryCode: shipment.recipientAddress?.countryCode ?? null,
        },
        estimatedDeliveryEnd: shipment.estimatedDeliveryEnd?.toISOString() ?? null,
        updatedAt: shipment.updatedAt.toISOString(),
        isDemo: shipment.isDemo,
        firstEventAt: events[0]?.occurredAt ?? null,
        lastEventAt: lastEvent?.occurredAt?.toISOString() ?? null,
        lastEventDescription: lastEvent?.description ?? null,
        events,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "NotFoundError") return notFound("Tracking number not found");
    return serverError();
  }
};