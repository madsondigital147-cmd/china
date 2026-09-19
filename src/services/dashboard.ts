import { prisma } from "@/lib/db";
import { Prisma, ShipmentStatus } from "@prisma/client";

const shipmentListInclude = {
  recipientAddress: { select: { city: true, countryCode: true } },
  carrier: { select: { name: true } },
} as const;

const trackingEventInclude = {
  shipment: { select: { shipmentNumber: true, trackingNumber: true } },
} as const;

type ShipmentRow = Prisma.ShipmentGetPayload<{ include: typeof shipmentListInclude }>;
type TrackingEventRow = Prisma.TrackingEventGetPayload<{ include: typeof trackingEventInclude }>;

export interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  exceptions: number;
  processing: number;
  pending: number;
  shipmentsOverTime: Array<{ date: string; label: string; count: number }>;
  recentShipments: ShipmentRow[];
  recentEvents: TrackingEventRow[];
  recentCustomers: Prisma.CustomerGetPayload<{}>[];
  webhookErrors: number;
  apiErrors: number;
}

const IN_TRANSIT: ShipmentStatus[] = [
  ShipmentStatus.RECEIVED,
  ShipmentStatus.PROCESSING,
  ShipmentStatus.READY_FOR_DISPATCH,
  ShipmentStatus.DISPATCHED,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.ARRIVED_DESTINATION,
  ShipmentStatus.CUSTOMS,
  ShipmentStatus.OUT_FOR_DELIVERY,
];

const PENDING: ShipmentStatus[] = [ShipmentStatus.DRAFT, ShipmentStatus.CREATED];

export async function getDashboardStats(organizationId: string, days = 30): Promise<DashboardStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalShipments, inTransit, delivered, exceptions, processing, webhookErrors, apiErrors, recentShipments, recentEvents, recentCustomers, pending, recentSeries] =
    await Promise.all([
      prisma.shipment.count({ where: { organizationId, deletedAt: null } }),
      prisma.shipment.count({ where: { organizationId, deletedAt: null, status: { in: IN_TRANSIT } } }),
      prisma.shipment.count({ where: { organizationId, deletedAt: null, status: ShipmentStatus.DELIVERED } }),
      prisma.shipment.count({ where: { organizationId, deletedAt: null, status: ShipmentStatus.EXCEPTION } }),
      prisma.shipment.count({ where: { organizationId, deletedAt: null, status: ShipmentStatus.PROCESSING } }),
      prisma.webhookEvent.count({ where: { organizationId, status: "FAILED" } }),
      prisma.apiLog.count({ where: { organizationId, statusCode: { gte: 500 } } }),
      prisma.shipment.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: shipmentListInclude,
      }),
      prisma.trackingEvent.findMany({
        where: { shipment: { organizationId } },
        orderBy: { occurredAt: "desc" },
        take: 5,
        include: trackingEventInclude,
      }),
      prisma.customer.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.shipment.count({ where: { organizationId, deletedAt: null, status: { in: PENDING } } }),
      prisma.shipment.groupBy({
        by: ["createdAt"],
        where: {
          organizationId,
          deletedAt: null,
          createdAt: { gte: since },
        },
        _count: { _all: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  // Group the raw series by day (UTC) for the "shipments over time" chart
  const dayBuckets = new Map<string, { date: string; label: string; count: number }>();
  for (const row of recentSeries) {
    const d = row.createdAt as Date;
    const key = d.toISOString().slice(0, 10);
    const existing = dayBuckets.get(key);
    if (existing) existing.count += row._count._all;
    else {
      dayBuckets.set(key, {
        date: key,
        label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(d),
        count: row._count._all,
      });
    }
  }

  return {
    totalShipments,
    inTransit,
    delivered,
    exceptions,
    processing,
    pending,
    shipmentsOverTime: Array.from(dayBuckets.values()),
    recentShipments,
    recentEvents,
    recentCustomers,
    webhookErrors,
    apiErrors,
  };
}

export async function getRecentShipmentStatusCounts(organizationId: string) {
  return prisma.shipment.groupBy({
    by: ["status"],
    where: { organizationId, deletedAt: null },
    _count: { _all: true },
  });
}