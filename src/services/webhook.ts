import { prisma } from "@/lib/db";
import { WebhookStatus, EventSource, Prisma } from "@prisma/client";
import { webhookEventSchema } from "@/lib/validation/schemas";
import { hmacWebhookVerifier, getAdapter } from "@/integrations/carriers";
import { applyTrackingEvent } from "./shipment";
import { createHash } from "crypto";
import type { CarrierTrackingEvent } from "@/integrations/carriers";

export interface ProcessWebhookInput {
  organizationId: string;
  carrierCode: string | null;
  signature?: string | null;
  body: unknown;
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public code: "NO_SHIPMENT" | "INVALID_SIGNATURE" | "VALIDATION" | "INVALID_BODY",
  ) {
    super(message);
  }
}

/**
 * Route for POST /api/webhooks/:carrier and /api/v1/webhooks/:carrier (spec §29-31, §97).
 * 1. validate signature       4. identify shipment by tracking
 * 2. log raw payload          5. normalize status
 * 3. check idempotency        6. create tracking event + update shipment
 */
export async function processCarrierWebhook(input: ProcessWebhookInput) {
  const carrier = input.carrierCode
    ? await prisma.carrier.findFirst({
        where: { organizationId: input.organizationId, code: input.carrierCode },
      })
    : null;

  const rawBody = Buffer.isBuffer(input.body) ? input.body.toString("utf8") : JSON.stringify(input.body ?? {});

  // Signature verification
  if (carrier?.webhookSecret) {
    const ok = hmacWebhookVerifier.verify(rawBody, input.signature ?? null, carrier.webhookSecret);
    if (!ok) {
      await createWebhookLog(input.organizationId, carrier?.id ?? null, null, input.body, WebhookStatus.FAILED, "Invalid HMAC signature", null);
      throw new WebhookError("Invalid webhook signature", "INVALID_SIGNATURE");
    }
  }

  let parsed: unknown;
  try {
    parsed = typeof input.body === "string" ? JSON.parse(input.body) : input.body;
  } catch {
    await createWebhookLog(input.organizationId, carrier?.id ?? null, null, input.body, WebhookStatus.FAILED, "Invalid JSON payload", null);
    throw new WebhookError("Request body is not valid JSON", "INVALID_BODY");
  }

  // Support both single-event and batched array payloads
  const events: unknown[] = Array.isArray(parsed) ? parsed : [parsed];

  const results: Array<{ ok: boolean; trackingNumber?: string; status?: string; error?: string }> = [];

  for (const rawEvent of events) {
    const parsedEvent = webhookEventSchema.safeParse(rawEvent);
    if (!parsedEvent.success) {
      await createWebhookLog(input.organizationId, carrier?.id ?? null, null, rawEvent, WebhookStatus.FAILED, "Schema validation failed", parsedEvent.error.message);
      results.push({ ok: false, error: "Schema validation failed" });
      continue;
    }

    const ev = parsedEvent.data;
    const normalizedTracking = ev.tracking_number.trim().toUpperCase();

    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber: normalizedTracking, deletedAt: null },
    });

    if (!shipment) {
      await createWebhookLog(input.organizationId, carrier?.id ?? null, null, rawEvent, WebhookStatus.FAILED, "Unknown tracking number", null);
      results.push({ ok: false, error: "Unknown tracking number" });
      continue;
    }

    // Idempotency check on the logged event (spec §30)
    const externalEventId = ev.event_id ?? (ev.external_shipment_id ? `${ev.external_shipment_id}:${ev.status}` : null);
    if (externalEventId) {
      const existingEvent = await prisma.trackingEvent.findFirst({
        where: { shipmentId: shipment.id, externalEventId },
      });
      if (existingEvent) {
        await createWebhookLog(input.organizationId, carrier?.id ?? null, shipment.id, rawEvent, WebhookStatus.SKIPPED, "Duplicate event (already processed)", null);
        results.push({ ok: true, trackingNumber: normalizedTracking, status: existingEvent.status, error: undefined });
        continue;
      }
    }

    const eventHash = eventHashFor(shipment.id, ev.status, ev.timestamp ?? null, ev.location ?? null);

    const occurredAt = ev.timestamp ? new Date(ev.timestamp) : null;

    const applied = await applyTrackingEvent(
      shipment.id,
      await statusHintToCanonical(ev.status, carrier?.id ?? null),
      {
        providerStatus: ev.status,
        description: ev.description ?? null,
        location: ev.location ?? null,
        city: ev.city ?? null,
        countryCode: ev.country_code ?? null,
        occurredAt,
        source: EventSource.CARRIER_WEBHOOK,
        externalEventId,
        eventHash,
        metadata: ev.meta ?? null,
      },
    );

    await createWebhookLog(
      input.organizationId,
      carrier?.id ?? null,
      shipment.id,
      rawEvent,
      WebhookStatus.PROCESSED,
      null,
      applied.event.id,
    );

    results.push({
      ok: true,
      trackingNumber: normalizedTracking,
      status: applied.shipment.status,
    });
  }

  return results;
}

/**
 * Resolve canonical status: carrier status mappings take priority, fallback defaults.
 */
async function statusHintToCanonical(providerStatus: string, carrierId: string | null): Promise<import("@prisma/client").ShipmentStatus> {
  const { normalizeStatus } = await import("@/lib/status");
  let dbMappings: Record<string, import("@prisma/client").ShipmentStatus> | null = null;
  if (carrierId) {
    const rows = await prisma.carrierStatusMapping.findMany({ where: { carrierId } });
    if (rows.length) dbMappings = Object.fromEntries(rows.map((r) => [r.externalStatus, r.internalStatus]));
  }
  return normalizeStatus(providerStatus, dbMappings);
}

function eventHashFor(shipmentId: string, providerStatus: string, timestamp: string | null, location: string | null) {
  return createHash("sha256").update(`${shipmentId}|${providerStatus}|${timestamp ?? ""}|${location ?? ""}`).digest("hex");
}

async function createWebhookLog(
  organizationId: string,
  carrierId: string | null,
  shipmentId: string | null,
  payload: unknown,
  status: WebhookStatus,
  error: string | null,
  eventId: string | null,
) {
  return prisma.webhookEvent.create({
    data: {
      organizationId,
      carrierId,
      shipmentId,
      externalEventId: (payload as { event_id?: string })?.event_id,
      payload: payload as Prisma.InputJsonValue,
      status,
      error,
      processedAt: status === WebhookStatus.PROCESSED ? new Date() : null,
      attempts: 1,
    },
  });
}

/**
 * Pull tracking events from carrier APIs (polling sync, spec §33).
 * Called by a scheduled job per configured polling interval.
 */
export async function syncCarrierShipments(organizationId: string, carrierIds?: string[]) {
  const carriers = await prisma.carrier.findMany({
    where: {
      organizationId,
      ...(carrierIds?.length ? { id: { in: carrierIds } } : {}),
      status: { in: ["ACTIVE", "CONNECTED"] },
    },
    include: { shipments: { where: { deletedAt: null } } },
  });

  const synced: string[] = [];

  for (const carrier of carriers) {
    const adapter = getAdapter(carrier.adapterKey);
    if (!adapter) continue;
    const credentials = {
      apiBaseUrl: carrier.apiBaseUrl,
      apiKey: carrier.apiKeyEncrypted,
      apiSecret: carrier.apiSecretEnc,
      accountId: carrier.accountId,
    };

    for (const shipment of carrier.shipments) {
      if (!shipment.trackingNumber) continue;
      try {
        const result = await adapter.getTracking(shipment.trackingNumber, credentials);
        if (!result) continue;

        for (const ev of result.events as CarrierTrackingEvent[]) {
          const eventHash = eventHashFor(shipment.id, ev.providerStatus, ev.timestamp ?? null, ev.location ?? null);
          const existing = await prisma.trackingEvent.findFirst({ where: { shipmentId: shipment.id, eventHash } });
          if (existing) continue;

          await applyTrackingEvent(
            shipment.id,
            await statusHintToCanonical(ev.providerStatus, carrier.id),
            {
              providerStatus: ev.providerStatus,
              description: ev.description ?? null,
              location: ev.location ?? null,
              city: ev.city ?? null,
              countryCode: ev.countryCode ?? null,
              occurredAt: ev.timestamp ? new Date(ev.timestamp) : null,
              source: EventSource.CARRIER_API,
              externalEventId: ev.externalEventId ?? null,
              eventHash,
              metadata: null,
            },
          );
        }

        await prisma.carrier.update({ where: { id: carrier.id }, data: { lastSyncAt: new Date() } });
        synced.push(shipment.trackingNumber);
      } catch (err) {
        // Carrier offline → mark sync pending, retry later (spec §117)
        const message = err instanceof Error ? err.message : "Unknown sync error";
        await prisma.webhookEvent.create({
          data: {
            organizationId,
            carrierId: carrier.id,
            shipmentId: shipment.id,
            payload: { syncError: message } as Prisma.InputJsonValue,
            status: WebhookStatus.FAILED,
            error: `Sync failed: ${message}`,
            attempts: 1,
          },
        });
      }
    }
  }

  return synced;
}