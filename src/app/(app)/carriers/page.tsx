import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";
import { countryName } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Carriers" };

const STATUS_COLOR: Record<string, "green" | "gray" | "amber"> = {
  ACTIVE: "green",
  CONNECTED: "green",
  INACTIVE: "gray",
  PENDING: "amber",
};

const ENV_LABEL: Record<string, string> = {
  DEVELOPMENT: "Sandbox",
  SANDBOX: "Sandbox",
  PRODUCTION: "Production",
};

export default async function CarriersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "carrier_read")) return null;

  const carriers = await prisma.carrier.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { services: true, shipments: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Carriers</h1>
        <p className="page-subtitle">Connected logistics providers and integration adapters</p>
      </div>

      {carriers.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No carriers connected"
          description="Connect your first carrier to enable real tracking numbers and automated status updates."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carriers.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{c.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{c.code}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge color={STATUS_COLOR[c.status] ?? "gray"}>{c.status}</Badge>
                    {c.isDemo && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Demo</span>}
                  </div>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <Row label="Adapter" value={c.adapterKey} mono />
                  <Row label="Environment" value={ENV_LABEL[c.environment] ?? c.environment} />
                  <Row label="Country" value={countryName(c.countryCode)} />
                  <Row label="Services" value={String(c._count.services)} />
                  <Row label="Shipments" value={String(c._count.shipments)} />
                  <Row label="Last sync" value={c.lastSyncAt ? formatDate(c.lastSyncAt, user.timezone) : "never"} />
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={["truncate text-right text-sm", mono ? "font-mono text-xs" : "font-medium"].join(" ")}>{value}</dd>
    </div>
  );
}