import { prisma } from "@/lib/db";
import { createShipmentSchema, type CreateShipmentInput } from "@/lib/validation/schemas";
import { nextShipmentNumber, generateDemoTracking } from "./shipment-number";
import { ShipmentStatus, EventSource, Prisma } from "@prisma/client";
import { normalizeStatus, isStatusAfter, isTerminalStatus } from "@/lib/status";
import { createHash, randomBytes } from "crypto";

export interface CreateShipmentContext {
  organizationId: string;
  userId: string | null;
  customerId?: string | null;
  isDemo?: boolean;
}

/** Estimated delivery is always this many days after the shipment is created. */
export const ESTIMATED_DELIVERY_DAYS = 10;

export class ShipmentError extends Error {
  constructor(
    message: string,
    public code: "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "FORBIDDEN",
  ) {
    super(message);
  }
}

/**
 * Create a shipment. Registers sender/recipient addresses, package data and
 * optionally a carrier service. When no carrier is configured the shipment is
 * created in CREATED state without a fake tracking number.
 */
export async function createShipment(input: CreateShipmentInput, ctx: CreateShipmentContext) {
  const parsed = createShipmentSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    throw new ShipmentError(first?.message ?? "Invalid shipment data", "VALIDATION");
  }

  const data = parsed.data;

  let carrier = null;
  let service = null;
  let trackingNumber: string | null = null;
  let externalShipmentId: string | null = null;

  if (data.service) {
    carrier = await prisma.carrier.findFirst({
      where: {
        id: data.service.carrierId,
        organizationId: ctx.organizationId,
      },
    });
    if (!carrier) throw new ShipmentError("Carrier not found", "NOT_FOUND");

    service = await prisma.carrierService.findFirst({
      where: { id: data.service.serviceId, carrierId: carrier.id },
    });
    if (!service) throw new ShipmentError("Service not found", "NOT_FOUND");

    // Only create a tracking number when the carrier is a DEMO/sandbox carrier.
    // Real carrier tracking numbers are always obtained via createShipment()
    // integration call (see carrier adapter) — never faked.
    if (carrier.isDemo) {
      trackingNumber = generateDemoTracking(ctx.organizationId);
    }
  }

  const shipmentNumber = await nextShipmentNumber(ctx.organizationId);

  const shipment = await prisma.$transaction(async (tx) => {
    const senderAddress = await tx.address.create({
      data: { ...data.sender, customerId: ctx.customerId ?? null },
    });
    const recipientAddress = await tx.address.create({
      data: { ...data.recipient, customerId: ctx.customerId ?? null },
    });
    const packageData = await tx.package.create({
      data: { ...data.package },
    });

    const created = await tx.shipment.create({
      data: {
        organizationId: ctx.organizationId,
        shipmentNumber,
        trackingNumber,
        externalShipmentId,
        status: ShipmentStatus.CREATED,
        createdById: ctx.userId,
        customerId: ctx.customerId ?? null,
        senderAddressId: senderAddress.id,
        recipientAddressId: recipientAddress.id,
        packageId: packageData.id,
        carrierId: carrier?.id ?? null,
        serviceId: service?.id ?? null,
        shippingMethod: data.service?.shippingMethod ?? null,
        isPriority: data.service?.isPriority ?? false,
        estimatedDeliveryEnd: new Date(Date.now() + ESTIMATED_DELIVERY_DAYS * 24 * 60 * 60 * 1000),
        reference: data.reference ?? null,
        customerOrderId: data.customerOrderId ?? null,
        isDemo: ctx.isDemo ?? carrier?.isDemo ?? false,
      },
    });

    // Initial tracking event — source SYSTEM, marks creation in the timeline.
    await tx.trackingEvent.create({
      data: {
        shipmentId: created.id,
        status: ShipmentStatus.CREATED,
        description: "Shipment created",
        source: EventSource.SYSTEM,
        receivedAt: new Date(),
        occurredAt: new Date(),
      },
    });

    return created;
  });

  return shipment;
}

export async function getShipmentByNumber(shipmentNumber: string, organizationId: string) {
  return prisma.shipment.findFirst({
    where: { shipmentNumber, organizationId, deletedAt: null },
    include: {
      senderAddress: true,
      recipientAddress: true,
      packageData: true,
      carrier: true,
      service: true,
      customer: true,
      items: true,
    },
  });
}

export async function getShipmentByTracking(trackingNumber: string) {
  return prisma.shipment.findFirst({
    where: { trackingNumber, deletedAt: null },
    include: {
      senderAddress: true,
      recipientAddress: true,
      packageData: true,
      carrier: true,
      service: true,
      customer: true,
      items: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { occurredAt: "asc" } },
    },
  });
}

export async function getShipmentById(id: string, organizationId: string) {
  return prisma.shipment.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: {
      senderAddress: true,
      recipientAddress: true,
      packageData: true,
      carrier: true,
      service: true,
      customer: true,
      createdBy: { select: { name: true } },
      items: true,
      events: { orderBy: { occurredAt: "asc" } },
      labels: true,
      documents: true,
      exceptions: true,
    },
  });
}

/**
 * Apply a normalized status transition to a shipment.
 * - Never regresses the canonical status (only EXCEPTION/RETURNED can follow any).
 * - Events are deduplicated by (status, providerStatus) unless externalEventId is given.
 */
export async function applyTrackingEvent(
  shipmentId: string,
  normalized: ShipmentStatus,
  opts: {
    providerStatus?: string | null;
    description?: string | null;
    location?: string | null;
    city?: string | null;
    countryCode?: string | null;
    occurredAt?: Date | null;
    source?: EventSource;
    externalEventId?: string | null;
    eventHash?: string | null;
    metadata?: Record<string, unknown> | null;
  },
) {
  const source = opts.source ?? EventSource.CARRIER_API;
  const occurredAt = opts.occurredAt ?? new Date();

  return prisma.$transaction(async (tx) => {
    // Idempotency (spec §30): skip when externalEventId already exists.
    if (opts.externalEventId) {
      const existing = await tx.trackingEvent.findFirst({
        where: { shipmentId, externalEventId: opts.externalEventId },
      });
      if (existing) return { shipment: await tx.shipment.findUniqueOrThrow({ where: { id: shipmentId } }), event: existing, duplicated: true };
    }

    // Fallback idempotency: same event hash within the shipment.
    if (opts.eventHash) {
      const existing = await tx.trackingEvent.findFirst({
        where: { shipmentId, eventHash: opts.eventHash },
      });
      if (existing) return { shipment: await tx.shipment.findUniqueOrThrow({ where: { id: shipmentId } }), event: existing, duplicated: true };
    }

    const shipment = await tx.shipment.findUniqueOrThrow({ where: { id: shipmentId } });

    // Regression guard: only move forward in the canonical flow.
    // EXCEPTION/RETURNED/CANCELLED may be applied at any time.
    const jumpsAllowed =
      isStatusAfter(normalized, shipment.status) ||
      normalized === ShipmentStatus.EXCEPTION ||
      normalized === ShipmentStatus.RETURNED ||
      normalized === ShipmentStatus.CANCELLED;

    const nextStatus = jumpsAllowed ? normalized : shipment.status;

    const event = await tx.trackingEvent.create({
      data: {
        shipmentId,
        status: nextStatus,
        providerStatus: opts.providerStatus ?? null,
        description: opts.description ?? null,
        location: opts.location ?? null,
        city: opts.city ?? null,
        countryCode: opts.countryCode ?? null,
        occurredAt,
        receivedAt: new Date(),
        source,
        externalEventId: opts.externalEventId ?? null,
        eventHash: opts.eventHash ?? null,
        metadata: (opts.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });

    const deliveredAt = nextStatus === ShipmentStatus.DELIVERED ? new Date() : null;
    const updated = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        status: nextStatus,
        deliveredAt: deliveredAt ?? undefined,
      },
    });

    return { shipment: updated, event, duplicated: false };
  });
}

/**
 * Internal status transitions performed by operators (spec §69).
 * Operators may move the shipment through the internal workflow; these events
 * are recorded with source=OPERATOR and are NOT presented as carrier events.
 */
export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  opts: {
    organizationId: string;
    description?: string;
    source?: EventSource;
  },
) {
  const shipment = await prisma.shipment.findFirst({ where: { id: shipmentId, organizationId: opts.organizationId } });
  if (!shipment) throw new ShipmentError("Shipment not found", "NOT_FOUND");
  if (isTerminalStatus(shipment.status)) {
    throw new ShipmentError(`Shipment is already in terminal status ${shipment.status}`, "CONFLICT");
  }

  return applyTrackingEvent(shipmentId, status, {
    description: opts.description,
    source: opts.source ?? EventSource.OPERATOR,
    eventHash: `manual-${randomBytes(8).toString("hex")}`,
  });
}

/**
 * Normalize + apply a raw carrier status string.
 * Resolves carrier DB mappings then falls back to the default normalization table.
 */
export async function applyCarrierStatus(
  shipmentId: string,
  carrierId: string | null,
  providerStatus: string,
  opts: Omit<Parameters<typeof applyTrackingEvent>[2], "providerStatus">,
) {
  let dbMappings: Record<string, ShipmentStatus> | null = null;
  if (carrierId) {
    const rows = await prisma.carrierStatusMapping.findMany({ where: { carrierId } });
    if (rows.length) {
      dbMappings = Object.fromEntries(rows.map((r) => [r.externalStatus, r.internalStatus]));
    }
  }
  const normalized = normalizeStatus(providerStatus, dbMappings);
  const eventHash = createHash("sha256")
    .update(`${shipmentId}:${providerStatus}:${opts.occurredAt ?? ""}`)
    .digest("hex");
  return applyTrackingEvent(shipmentId, normalized, {
    ...opts,
    providerStatus,
    eventHash,
  });
}