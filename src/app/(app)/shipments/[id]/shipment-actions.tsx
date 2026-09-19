"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import {
  attachDemoTrackingAction,
  updateShipmentStatusAction,
  cancelShipmentAction,
} from "@/app/actions/shipments";
import { Radar, XCircle } from "lucide-react";

interface Props {
  shipmentId: string;
  currentStatus: string;
  statusOptions: Array<{ value: string; label: string }>;
  canUpdate: boolean;
  canCancel: boolean;
  hasTracking: boolean;
  isDemo: boolean;
}

export function ShipmentActions({
  shipmentId,
  currentStatus,
  statusOptions,
  canUpdate,
  canCancel,
  hasTracking,
  isDemo,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState(currentStatus);

  const run = async (key: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(key);
    try {
      const res = await fn();
      if (res.ok) {
        toast("Shipment updated.");
        router.refresh();
      } else {
        toast(res.error ?? "Something went wrong.", "error");
      }
    } catch {
      toast("Something went wrong.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
      {isDemo && !hasTracking ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() =>
            run("tracking", () => attachDemoTrackingAction(shipmentId))
          }
        >
          <Radar className="h-4 w-4" aria-hidden />
          {busy === "tracking" ? "Assigning…" : "Assign demo tracking"}
        </Button>
      ) : null}

      {canUpdate && statusOptions.length > 0 ? (
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-44 text-sm"
            aria-label="Update status"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null || status === currentStatus}
            onClick={() =>
              run("status", () => updateShipmentStatusAction(shipmentId, status as never))
            }
          >
            {busy === "status" ? "Saving…" : "Update status"}
          </Button>
        </div>
      ) : null}

      {canCancel && (
        <Button
          size="sm"
          variant="destructive"
          disabled={busy !== null}
          onClick={() => {
            if (confirm("Cancel this shipment? This cannot be undone.")) {
              run("cancel", () => cancelShipmentAction(shipmentId));
            }
          }}
        >
          <XCircle className="h-4 w-4" aria-hidden />
          {busy === "cancel" ? "Cancelling…" : "Cancel shipment"}
        </Button>
      )}
    </div>
  );
}