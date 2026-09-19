import Link from "next/link";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Exceptions" };

export default async function ExceptionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "exceptions_manage")) return null;

  const exceptions = await prisma.exception.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      shipment: { select: { shipmentNumber: true, trackingNumber: true, status: true } },
    },
  });

  const open = exceptions.filter((e) => e.status === "OPEN").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Exceptions</h1>
        <p className="page-subtitle">
          {open} open · {exceptions.length} total
        </p>
      </div>

      {exceptions.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No exceptions"
          description="Exceptions surface here when a shipment hits an issue (delivery failure, address problem, customs hold)."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {exceptions.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{e.type}</p>
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted-foreground">{formatDate(e.createdAt, user.timezone)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                    {e.shipment && (
                      <p className="mt-1 text-xs">
                        <Link
                          href={`/shipments/${e.shipmentId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {e.shipment.shipmentNumber}
                        </Link>
                        {e.shipment.trackingNumber && (
                          <span className="text-muted-foreground"> · {e.shipment.trackingNumber}</span>
                        )}
                      </p>
                    )}
                  </div>
                  {e.status !== "OPEN" && (
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <p>
                        Resolved at {e.resolvedAt ? formatDate(e.resolvedAt, user.timezone) : "—"}
                      </p>
                      {e.resolutionNote && <p className="mt-0.5">{e.resolutionNote}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}