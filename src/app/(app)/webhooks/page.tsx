import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Webhook as WebhookIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Webhooks" };

export default async function WebhooksPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "api_manage")) return null;

  const events = await prisma.webhookEvent.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { receivedAt: "desc" },
    take: 50,
    include: {
      carrier: { select: { name: true, code: true } },
      shipment: { select: { shipmentNumber: true } },
    },
  });

  const failed = events.filter((e) => e.status === "FAILED").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Webhooks</h1>
        <p className="page-subtitle">Incoming carrier events · {failed} failed in the last 50</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={WebhookIcon}
          title="No webhook events"
          description="Carrier webhook events will appear here for signature and idempotency monitoring."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <StatusBadge status={e.status} />
                    <span className="text-sm font-medium">{e.carrier?.name ?? "Unknown carrier"}</span>
                    {e.shipment && (
                      <span className="font-mono text-xs text-muted-foreground">{e.shipment.shipmentNumber}</span>
                    )}
                    {e.externalEventId && (
                      <span className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">{e.externalEventId}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(e.receivedAt, user.timezone)}</span>
                </div>
                {e.error && (
                  <p className="mt-1.5 truncate text-xs text-red-600" title={e.error}>
                    {e.error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}