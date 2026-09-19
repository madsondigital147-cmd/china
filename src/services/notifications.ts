import { prisma } from "@/lib/db";
import { NotificationType, Prisma } from "@prisma/client";

export interface CreateNotificationInput {
  organizationId: string;
  userId?: string | null;
  shipmentId?: string | null;
  type: NotificationType;
  title: string;
  body?: string | null;
  channel?: "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";
}

/**
 * Create an in-app notification. Email/SMS/WhatsApp channels are prepared for
 * future integration (spec §43) — the record is created with the channel flag
 * so a worker can dispatch it later.
 */
export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId ?? null,
      shipmentId: input.shipmentId ?? null,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      channel: input.channel ?? "IN_APP",
    },
  });
}

export async function notifyShipmentUpdate(opts: {
  organizationId: string;
  shipmentId: string;
  type: NotificationType;
  title: string;
  body?: string;
  customerId?: string | null;
}) {
  const customer = opts.customerId
    ? await prisma.customer.findUnique({ where: { id: opts.customerId } })
    : null;

  const upsertPayload = {
    organizationId: opts.organizationId,
    shipmentId: opts.shipmentId,
    userId: customer?.userId ?? null,
    type: opts.type,
    title: opts.title,
    body: opts.body ?? null,
  } satisfies Prisma.NotificationUncheckedCreateInput;

  return prisma.notification.create({ data: upsertPayload });
}

export async function listNotifications(opts: {
  organizationId: string;
  userId?: string | null;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const where: Prisma.NotificationWhereInput = {
    organizationId: opts.organizationId,
    ...(opts.userId ? { userId: opts.userId } : {}),
    ...(opts.unreadOnly ? { readAt: null } : {}),
  };
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(opts.limit ?? 50, 100),
    include: { shipment: { select: { shipmentNumber: true, trackingNumber: true } } },
  });
}

export async function markNotificationsRead(organizationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { organizationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function countUnreadNotifications(organizationId: string) {
  return prisma.notification.count({
    where: { organizationId, readAt: null },
  });
}

/**
 * Derived from type — maps shipment status to a notification type.
 */
export function notificationTypeForStatus(
  status: string,
): NotificationType {
  switch (status) {
    case "CREATED":
      return NotificationType.SHIPMENT_CREATED;
    case "DISPATCHED":
      return NotificationType.SHIPMENT_DISPATCHED;
    case "IN_TRANSIT":
      return NotificationType.IN_TRANSIT;
    case "ARRIVED_DESTINATION":
      return NotificationType.ARRIVED_DESTINATION;
    case "OUT_FOR_DELIVERY":
      return NotificationType.OUT_FOR_DELIVERY;
    case "DELIVERED":
      return NotificationType.DELIVERED;
    case "EXCEPTION":
    case "RETURNED":
    case "CANCELLED":
      return NotificationType.EXCEPTION;
    default:
      return NotificationType.IN_TRANSIT;
  }
}