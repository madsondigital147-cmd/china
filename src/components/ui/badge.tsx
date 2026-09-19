import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { color?: "gray" | "blue" | "green" | "amber" | "red" | "indigo" | "violet" }) {
  const { color = "gray", ...rest } = props;
  const colors: Record<string, string> = {
    gray: "border-border bg-muted text-muted-foreground",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };
  return <span className={cn("badge", colors[color], className)} {...rest} />;
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const colorMap: Record<string, "gray" | "blue" | "green" | "amber" | "red" | "indigo" | "violet"> = {
    DRAFT: "gray",
    CREATED: "gray",
    RECEIVED: "blue",
    PROCESSING: "blue",
    READY_FOR_DISPATCH: "indigo",
    DISPATCHED: "indigo",
    IN_TRANSIT: "indigo",
    ARRIVED_DESTINATION: "indigo",
    CUSTOMS: "amber",
    OUT_FOR_DELIVERY: "amber",
    DELIVERED: "green",
    EXCEPTION: "red",
    RETURNED: "red",
    CANCELLED: "gray",
    OPEN: "amber",
    RESOLVED: "green",
    CLOSED: "gray",
    ACTIVE: "green",
    CONNECTED: "green",
    INACTIVE: "gray",
    PENDING: "amber",
    PROCESSED: "green",
    FAILED: "red",
    SKIPPED: "gray",
  };
  return <Badge className={className} color={colorMap[status] ?? "gray"}>{label ?? status}</Badge>;
}