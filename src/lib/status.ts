import { ShipmentStatus, EventSource } from "@prisma/client";

export type { ShipmentStatus, EventSource };

export interface StatusMeta {
  label: string;
  description: string;
  order: number;
  /** tailwind-friendly color key */
  color: "gray" | "blue" | "indigo" | "amber" | "green" | "red" | "violet";
}

/**
 * Canonical status registry — single source of truth.
 * Order follows the logistics workflow (spec §15, §179).
 */
export const STATUSES: Record<ShipmentStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    description: "Shipment is being prepared and has not been finalized.",
    order: 0,
    color: "gray",
  },
  CREATED: {
    label: "Created",
    description: "Shipment created.",
    order: 1,
    color: "gray",
  },
  RECEIVED: {
    label: "Package received",
    description: "Package received at origin facility.",
    order: 2,
    color: "blue",
  },
  PROCESSING: {
    label: "Processing",
    description: "Package is being processed.",
    order: 3,
    color: "blue",
  },
  READY_FOR_DISPATCH: {
    label: "Ready for dispatch",
    description: "Package is ready for international dispatch.",
    order: 4,
    color: "indigo",
  },
  DISPATCHED: {
    label: "Dispatched",
    description: "Shipment departed origin facility in China.",
    order: 5,
    color: "indigo",
  },
  IN_TRANSIT: {
    label: "In transit",
    description: "Shipment departed origin.",
    order: 6,
    color: "indigo",
  },
  ARRIVED_DESTINATION: {
    label: "Arrived destination",
    description: "Shipment arrived in destination country.",
    order: 7,
    color: "indigo",
  },
  CUSTOMS: {
    label: "Customs",
    description: "Shipment under customs processing.",
    order: 8,
    color: "amber",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    description: "Shipment is out for delivery.",
    order: 9,
    color: "amber",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Shipment successfully delivered.",
    order: 10,
    color: "green",
  },
  EXCEPTION: {
    label: "Exception",
    description: "An issue occurred. Awaiting resolution.",
    order: 90,
    color: "red",
  },
  RETURNED: {
    label: "Returned",
    description: "Shipment was returned to origin.",
    order: 91,
    color: "red",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Shipment was cancelled.",
    order: 92,
    color: "gray",
  },
};

export const STATUS_FLOW: ShipmentStatus[] = [
  ShipmentStatus.DRAFT,
  ShipmentStatus.CREATED,
  ShipmentStatus.RECEIVED,
  ShipmentStatus.PROCESSING,
  ShipmentStatus.READY_FOR_DISPATCH,
  ShipmentStatus.DISPATCHED,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.ARRIVED_DESTINATION,
  ShipmentStatus.CUSTOMS,
  ShipmentStatus.OUT_FOR_DELIVERY,
  ShipmentStatus.DELIVERED,
];

export const TERMINAL_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.DELIVERED,
  ShipmentStatus.RETURNED,
  ShipmentStatus.CANCELLED,
];

export function isTerminalStatus(status: ShipmentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function statusLabel(status: ShipmentStatus): string {
  return STATUSES[status].label;
}

export function statusOrder(status: ShipmentStatus): number {
  return STATUSES[status].order;
}

/**
 * Determine if fromStatus is "after" toStatus in the logistics flow.
 * Exception/Returned/Cancelled are considered later than any delivery step.
 */
export function isStatusAfter(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return statusOrder(from) > statusOrder(to);
}

/**
 * Status normalization — spec §16.
 * Multiple carriers send different codes; we map them to the internal canonical
 * status. Mappings come from the carrier_status_mappings table, with sensible
 * defaults for well-known codes kept here.
 */
const DEFAULT_CARRIER_MAPPINGS: Record<string, ShipmentStatus> = {
  CREATED: ShipmentStatus.CREATED,
  SHIPMENT_CREATED: ShipmentStatus.CREATED,
  SHIPMENT_CREATE: ShipmentStatus.CREATED,
  REGISTERED: ShipmentStatus.CREATED,
  INFO_RECEIVED: ShipmentStatus.CREATED,
  RECEIVED: ShipmentStatus.RECEIVED,
  PACKAGE_RECEIVED: ShipmentStatus.RECEIVED,
  ACQUIRED: ShipmentStatus.RECEIVED,
  COLLECTED: ShipmentStatus.RECEIVED,
  ACCEPTED: ShipmentStatus.RECEIVED,
  ARRIVED_AT_SORTING_CENTER: ShipmentStatus.PROCESSING,
  ARRIVED_AT_FACILITY: ShipmentStatus.PROCESSING,
  SORTING: ShipmentStatus.PROCESSING,
  PROCESSING: ShipmentStatus.PROCESSING,
  PROCESSED: ShipmentStatus.PROCESSING,
  DEPARTED_ORIGIN: ShipmentStatus.DISPATCHED,
  DEPARTED_ORIGIN_FACILITY: ShipmentStatus.DISPATCHED,
  DISPATCHED: ShipmentStatus.DISPATCHED,
  READY_FOR_DISPATCH: ShipmentStatus.READY_FOR_DISPATCH,
  IN_TRANSIT: ShipmentStatus.IN_TRANSIT,
  DEPARTED: ShipmentStatus.IN_TRANSIT,
  ON_THE_WAY: ShipmentStatus.IN_TRANSIT,
  TRANSPORTING: ShipmentStatus.IN_TRANSIT,
  EN_ROUTE: ShipmentStatus.IN_TRANSIT,
  FLIGHT_DEPARTED: ShipmentStatus.IN_TRANSIT,
  FLIGHT_ARRIVED: ShipmentStatus.IN_TRANSIT,
  ARRIVED_DESTINATION: ShipmentStatus.ARRIVED_DESTINATION,
  ARRIVED: ShipmentStatus.ARRIVED_DESTINATION,
  ARRIVED_DESTINATION_COUNTRY: ShipmentStatus.ARRIVED_DESTINATION,
  AT_DESTINATION: ShipmentStatus.ARRIVED_DESTINATION,
  CUSTOMS: ShipmentStatus.CUSTOMS,
  UNDER_CUSTOMS: ShipmentStatus.CUSTOMS,
  CUSTOMS_PROCESSING: ShipmentStatus.CUSTOMS,
  CUSTOMS_CLEARANCE: ShipmentStatus.CUSTOMS,
  CUSTOMS_CLEARED: ShipmentStatus.CUSTOMS,
  RELEASED_FROM_CUSTOMS: ShipmentStatus.CUSTOMS,
  OUT_FOR_DELIVERY: ShipmentStatus.OUT_FOR_DELIVERY,
  WITH_DELIVERY_COURIER: ShipmentStatus.OUT_FOR_DELIVERY,
  DELIVERED: ShipmentStatus.DELIVERED,
  DELIVERY_COMPLETED: ShipmentStatus.DELIVERED,
  SIGNED_FOR: ShipmentStatus.DELIVERED,
  DELIVERY_ATTEMPT: ShipmentStatus.EXCEPTION,
  DELIVERY_FAILED: ShipmentStatus.EXCEPTION,
  ADDRESS_ISSUE: ShipmentStatus.EXCEPTION,
  EXCEPTION: ShipmentStatus.EXCEPTION,
  EXCEPTION_ON_DELIVERY: ShipmentStatus.EXCEPTION,
  RETURNED: ShipmentStatus.RETURNED,
  RETURNED_TO_SENDER: ShipmentStatus.RETURNED,
  CANCELLED: ShipmentStatus.CANCELLED,
  CANCELLED_BY_CUSTOMER: ShipmentStatus.CANCELLED,
};

/**
 * Normalize an external carrier status to the internal canonical status.
 * dbMappings take priority over the default table.
 */
export function normalizeStatus(
  externalStatus: string | null | undefined,
  dbMappings?: Record<string, ShipmentStatus> | null,
): ShipmentStatus {
  const raw = externalStatus?.trim().toUpperCase();
  if (!raw) return ShipmentStatus.CREATED;

  // Exact match against DB-configured mappings (spec §16 table)
  const dbKey = raw.replace(/[^A-Z0-9_]/g, "_");
  if (dbMappings && dbMappings[raw] !== undefined) return dbMappings[raw];
  if (dbMappings && dbMappings[dbKey] !== undefined) return dbMappings[dbKey];

  // Exact match against defaults (also via normalized key so spaced codes work)
  if (DEFAULT_CARRIER_MAPPINGS[raw] !== undefined) return DEFAULT_CARRIER_MAPPINGS[raw];
  if (DEFAULT_CARRIER_MAPPINGS[dbKey] !== undefined) return DEFAULT_CARRIER_MAPPINGS[dbKey];

  // Fuzzy fallback: contains-based matching
  if (raw.includes("DELIVERED") || raw.includes("SIGNED") || raw.includes("RECEIVED_BY")) {
    return ShipmentStatus.DELIVERED;
  }
  if (raw.includes("CUSTOMS")) return ShipmentStatus.CUSTOMS;
  if (raw.includes("OUT_FOR_DELIVERY") || dbKey.includes("OUT_FOR_DELIVERY")) {
    return ShipmentStatus.OUT_FOR_DELIVERY;
  }
  if (raw.includes("TRANSIT") || dbKey.includes("TRANSIT") || raw.includes("DEPARTED") || raw.includes("FLIGHT")) {
    return ShipmentStatus.IN_TRANSIT;
  }
  if (raw.includes("DESTINATION") || dbKey.includes("DESTINATION")) return ShipmentStatus.ARRIVED_DESTINATION;
  if (raw.includes("CANCEL") || dbKey.includes("CANCEL")) return ShipmentStatus.CANCELLED;
  if (raw.includes("RETURN") || dbKey.includes("RETURN")) return ShipmentStatus.RETURNED;
  if (raw.includes("EXCEPTION") || raw.includes("FAILED") || raw.includes("ATTEMPT")) {
    return ShipmentStatus.EXCEPTION;
  }
  if (raw.includes("SORT") || dbKey.includes("SORT") || raw.includes("PROCESS") || dbKey.includes("PROCESS")) {
    return ShipmentStatus.PROCESSING;
  }
  if (raw.includes("RECEIVED") || raw.includes("ACCEPTED") || raw.includes("COLLECTED")) {
    return ShipmentStatus.RECEIVED;
  }

  return ShipmentStatus.CREATED;
}

export function eventSourceLabel(source: EventSource): string {
  switch (source) {
    case EventSource.CARRIER_API:
      return "Carrier API";
    case EventSource.CARRIER_WEBHOOK:
      return "Carrier webhook";
    case EventSource.OPERATOR:
      return "Operator";
    case EventSource.SYSTEM:
      return "System";
    case EventSource.IMPORT:
      return "Import";
    default:
      return source;
  }
}