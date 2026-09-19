"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/services/audit";
import { generateDemoTracking } from "@/services/shipment-number";
import {
  createShipment,
  applyCarrierStatus,
  updateShipmentStatus,
  getShipmentById,
  ShipmentError,
} from "@/services/shipment";
import type { CreateShipmentInput } from "@/lib/validation/schemas";
import { EventSource, ShipmentStatus } from "@prisma/client";

export interface ShipmentResult {
  ok: boolean;
  shipmentId?: string;
  error?: string;
}

const TERMINAL: ShipmentStatus[] = [ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED, ShipmentStatus.RETURNED];

export async function createShipmentAction(input: CreateShipmentInput): Promise<ShipmentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  if (!hasPermission(user, "shipment_create")) return { ok: false, error: "FORBIDDEN" };

  try {
    const shipment = await createShipment(input, {
      organizationId: user.organizationId,
      userId: user.id,
      customerId: user.roleCode === "CUSTOMER" ? user.customerId : null,
      isDemo: true,
    });

    await writeAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: "shipment.create",
      entityType: "shipment",
      entityId: shipment.id,
      after: {
        shipmentNumber: shipment.shipmentNumber,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
      },
    });

    revalidatePath("/shipments");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true, shipmentId: shipment.id };
  } catch (err) {
    if (err instanceof ShipmentError) return { ok: false, error: err.message };
    return { ok: false, error: "Unable to create shipment." };
  }
}

export async function attachDemoTrackingAction(shipmentId: string): Promise<ShipmentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  if (!hasPermission(user, "shipment_update")) return { ok: false, error: "FORBIDDEN" };

  try {
    const shipment = await getShipmentById(shipmentId, user.organizationId);
    if (!shipment) return { ok: false, error: "Shipment not found." };
    if (TERMINAL.includes(shipment.status)) {
      return { ok: false, error: `Shipment is already ${shipment.status}.` };
    }
    if (shipment.trackingNumber) {
      return { ok: false, error: "Tracking number already assigned." };
    }

    const tracking = generateDemoTracking(user.organizationId);
    await prisma.shipment.update({ where: { id: shipmentId }, data: { trackingNumber: tracking } });

    await applyCarrierStatus(shipmentId, null, "PACKAGE_RECEIVED", {
      description: "Package received at origin facility (demo)",
      source: EventSource.SYSTEM,
    });

    await writeAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: "shipment.attach_tracking",
      entityType: "shipment",
      entityId: shipmentId,
      after: { trackingNumber: tracking },
    });

    revalidatePath("/shipments");
    revalidatePath(`/shipments/${shipmentId}`);
    return { ok: true, shipmentId };
  } catch {
    return { ok: false, error: "Unable to attach tracking." };
  }
}

export async function updateShipmentStatusAction(
  shipmentId: string,
  status: ShipmentStatus,
): Promise<ShipmentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  if (!hasPermission(user, "shipment_update")) return { ok: false, error: "FORBIDDEN" };

  try {
    await updateShipmentStatus(shipmentId, status, {
      organizationId: user.organizationId,
      description: `Status updated to ${status} by operator`,
    });

    await writeAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: "shipment.status_update",
      entityType: "shipment",
      entityId: shipmentId,
      after: { status },
    });

    revalidatePath("/shipments");
    revalidatePath(`/shipments/${shipmentId}`);
    return { ok: true, shipmentId };
  } catch (err) {
    if (err instanceof ShipmentError) return { ok: false, error: err.message };
    return { ok: false, error: "Unable to update shipment." };
  }
}

export async function cancelShipmentAction(shipmentId: string): Promise<ShipmentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "AUTH_REQUIRED" };
  if (!hasPermission(user, "shipment_cancel")) return { ok: false, error: "FORBIDDEN" };

  try {
    const shipment = await getShipmentById(shipmentId, user.organizationId);
    if (!shipment) return { ok: false, error: "Shipment not found." };
    if (TERMINAL.includes(shipment.status)) {
      return { ok: false, error: `Shipment is already ${shipment.status}.` };
    }

    await updateShipmentStatus(shipmentId, ShipmentStatus.CANCELLED, {
      organizationId: user.organizationId,
      description: "Shipment cancelled",
    });

    await prisma.shipment.update({
      where: { id: shipmentId },
      data: { cancelledAt: new Date(), cancelledById: user.id },
    });

    await writeAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: "shipment.cancel",
      entityType: "shipment",
      entityId: shipmentId,
      after: { status: "CANCELLED" },
    });

    revalidatePath("/shipments");
    revalidatePath(`/shipments/${shipmentId}`);
    return { ok: true, shipmentId };
  } catch (err) {
    if (err instanceof ShipmentError) return { ok: false, error: err.message };
    return { ok: false, error: "Unable to cancel shipment." };
  }
}