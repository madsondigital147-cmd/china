import { STATUSES, type ShipmentStatus } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  Package,
  PackageCheck,
  PackageSearch,
  Send,
  Plane,
  MapPin,
  FileSearch,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

const STATUS_ICONS: Partial<Record<ShipmentStatus, LucideIcon>> = {
  DRAFT: FileText,
  CREATED: FileText,
  RECEIVED: PackageCheck,
  PROCESSING: PackageSearch,
  READY_FOR_DISPATCH: Package,
  DISPATCHED: Send,
  IN_TRANSIT: Plane,
  ARRIVED_DESTINATION: MapPin,
  CUSTOMS: FileSearch,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
  EXCEPTION: AlertTriangle,
  RETURNED: RotateCcw,
  CANCELLED: XCircle,
};

export function StatusIcon({ status, className }: { status: ShipmentStatus; className?: string }) {
  const Icon = STATUS_ICONS[status] ?? Package;
  return <Icon className={className} aria-hidden />;
}

export function StatusDot({ status, className }: { status: ShipmentStatus; className?: string }) {
  const color = STATUSES[status]?.color ?? "gray";
  const colors: Record<string, string> = {
    gray: "bg-gray-400",
    blue: "bg-techblue-600",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    red: "bg-red-500",
    violet: "bg-violet-500",
  };
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", colors[color], className)} aria-hidden />;
}

interface TimelineEventItem {
  status: ShipmentStatus;
  description?: string | null;
  location?: string | null;
  occurredAt: Date;
  isCurrent?: boolean;
}

/**
 * Vertical tracking timeline — spec §14, §106.
 */
export function TrackingTimeline({
  events,
  timezone = "Asia/Shanghai",
  locale = "en",
}: {
  events: TimelineEventItem[];
  timezone?: string;
  locale?: string;
}) {
  // newest first
  const sorted = [...events].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  const currentIndex = sorted.findIndex((e) => e.isCurrent);

  return (
    <ol className="relative flex flex-col">
      {sorted.map((event, idx) => {
        const meta = STATUSES[event.status];
        const isCurrent = idx === currentIndex || event.isCurrent;
        const Icon = STATUS_ICONS[event.status] ?? Package;
        return (
          <li key={`${event.status}-${event.occurredAt.getTime()}-${idx}`} className="relative flex gap-4 pb-8 last:pb-0">
            {/* connector */}
            {idx < sorted.length - 1 && (
              <span className="absolute left-[15px] top-9 bottom-0 w-px bg-border" aria-hidden />
            )}
            {/* node */}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                isCurrent
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {/* content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className={cn("text-sm font-semibold", isCurrent ? "text-primary" : "text-foreground")}>
                  {meta.label}
                </p>
                <time className="text-xs tabular-nums text-muted-foreground">
                  {formatDate(event.occurredAt, timezone, locale)}
                </time>
              </div>
              {event.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
              )}
              {event.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {event.location}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}