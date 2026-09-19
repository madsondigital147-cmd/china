import { prisma } from "@/lib/db";
import { randomToken } from "@/lib/utils";

export const DEMO_TRACKING_PREFIX = "DEMO-CN-";

/**
 * Shipment number generator: SHP-2026-000001
 * The format is stored in a system setting ("shipmentNumberFormat") and is
 * configurable from the admin panel. Default format: SHP-{YYYY}-{000000}.
 */
export function buildShipmentNumber(value: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  return `SHP-${y}-${String(value).padStart(6, "0")}`;
}

/**
 * Atomically acquire the next shipment number for an organization.
 * Uses a row lock on a Counter row so concurrent creates do not collide.
 */
export async function nextShipmentNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const counterName = `shipment-${year}`;

  const counter = await prisma.counter.upsert({
    where: { organizationId_name: { organizationId, name: counterName } },
    update: { value: { increment: 1 } },
    create: { organizationId, name: counterName, value: 1 },
  });

  return buildShipmentNumber(counter.value, year);
}

/**
 * Generate a DEMO tracking number. These are clearly marked as demo and must
 * never be presented as real carrier tracking. Real integrations replace this.
 */
export function generateDemoTracking(organizationId: string): string {
  return `${DEMO_TRACKING_PREFIX}${randomToken(6).toUpperCase()}`;
}