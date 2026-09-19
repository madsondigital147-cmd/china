import { randomInt } from "crypto";
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

const SUFFIX_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/**
 * Non-sequential shipment number: SHP-20260919-K7M2Q (date + random suffix).
 * It does not expose how many shipments exist.
 */
export function generateShipmentNumber(date: Date = new Date()): string {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += SUFFIX_ALPHABET[randomInt(SUFFIX_ALPHABET.length)];
  }
  return `SHP-${ymd}-${suffix}`;
}

/**
 * Acquire a unique shipment number for an organization (random, retried on the
 * unlikely event of a collision).
 */
export async function nextShipmentNumber(_organizationId: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateShipmentNumber();
    const taken = await prisma.shipment.findUnique({ where: { shipmentNumber: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  throw new Error("Could not allocate a unique shipment number");
}

/**
 * Generate a DEMO tracking number. These are clearly marked as demo and must
 * never be presented as real carrier tracking. Real integrations replace this.
 */
export function generateDemoTracking(organizationId: string): string {
  return `${DEMO_TRACKING_PREFIX}${randomToken(6).toUpperCase()}`;
}