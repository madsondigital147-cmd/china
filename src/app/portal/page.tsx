import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus, Radar, Globe2, Bell } from "lucide-react";
import { countryName } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My shipments" };

export default async function PortalPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const shipments = await prisma.shipment.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      customer: { user: { id: user.id } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      carrier: { select: { name: true } },
      recipientAddress: { select: { city: true, countryCode: true } },
    },
  });

  const hasTracking = shipments.some((s) => s.trackingNumber);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My shipments</h1>
          <p className="text-sm text-muted-foreground">Track your international shipments.</p>
        </div>
        <Link href="/shipments/new" className="btn btn-primary btn-md">
          <Plus className="h-4 w-4" aria-hidden />
          New shipment
        </Link>
      </header>

      {shipments.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No shipments yet"
          description="Track any shipment using its tracking number, or create a new shipment to get started."
        />
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-2xl font-bold tracking-tight">{shipments.length}</p>
              <p className="text-xs text-muted-foreground">Total shipments</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold tracking-tight">
                {shipments.filter((s) => s.status === "DELIVERED").length}
              </p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </Card>
            <Card className="p-4">
              <p className="text-2xl font-bold tracking-tight">
                {shipments.filter((s) => ["IN_TRANSIT", "OUT_FOR_DELIVERY", "CUSTOMS", "PROCESSING", "RECEIVED", "READY_FOR_DISPATCH", "DISPATCHED", "ARRIVED_DESTINATION"].includes(s.status)).length}
              </p>
              <p className="text-xs text-muted-foreground">In transit</p>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            {shipments.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/tracking/${s.trackingNumber ?? ""}`} className="text-sm font-semibold hover:text-primary">
                        {s.shipmentNumber}
                      </Link>
                      <StatusBadge status={s.status} />
                      {s.isDemo && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Demo</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.trackingNumber ? (
                        <Link href={`/tracking/${s.trackingNumber}`} className="font-mono hover:text-primary">
                          {s.trackingNumber}
                        </Link>
                      ) : (
                        "Tracking number pending"
                      )}{" "}
                      · {s.recipientAddress?.city}, {countryName(s.recipientAddress?.countryCode)} · {s.carrier?.name ?? "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {s.trackingNumber ? (
                      <Link href={`/tracking/${s.trackingNumber}`} className="btn btn-outline btn-sm">
                        <Radar className="h-3.5 w-3.5" aria-hidden />
                        Track
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {!hasTracking && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={Globe2}
                title="Where is my tracking number?"
                body="Tracking numbers are assigned once a carrier is connected to your shipment. Contact our operations team in China for status updates."
              />
              <InfoCard
                icon={Bell}
                title="Notifications"
                body="Sign up for notifications to receive status updates by email the moment your shipment moves."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Globe2;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}