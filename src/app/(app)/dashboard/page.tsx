import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDashboardStats } from "@/services/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ShipmentsAreaChart } from "@/components/dashboard/shipments-chart";
import { countryName } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { PlusCircle, Radar, PackageCheck, AlertTriangle, ArrowRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

type SearchParams = Promise<{ range?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { range } = await searchParams;
  const days = range === "90" ? 90 : range === "7" ? 7 : range === "30" ? 30 : 30;

  const stats = await getDashboardStats(user.organizationId, days);

  const kpis = [
    { label: "Total shipments", value: stats.totalShipments, icon: Package, className: "text-techblue-600 bg-techblue-50" },
    { label: "In transit", value: stats.inTransit, icon: Radar, className: "text-indigo-600 bg-indigo-50" },
    { label: "Delivered", value: stats.delivered, icon: PackageCheck, className: "text-green-600 bg-green-50" },
    { label: "Exceptions", value: stats.exceptions, icon: AlertTriangle, className: "text-red-600 bg-red-50" },
    { label: "Processing", value: stats.processing, icon: Package, className: "text-amber-600 bg-amber-50" },
    { label: "Pending", value: stats.pending, icon: Package, className: "text-muted-foreground bg-muted" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Operational overview</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <FilterLink label="Today" href="1" />
          <FilterLink label="7 days" href="7" />
          <FilterLink label="30 days" href="30" />
          <FilterLink label="90 days" href="90" />
        </div>
      </div>

      {/* quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/shipments/new" className="btn btn-primary btn-sm">
          <PlusCircle className="h-4 w-4" aria-hidden />
          Create shipment
        </Link>
        <Link href="/tracking" className="btn btn-outline btn-sm">
          <Radar className="h-4 w-4" aria-hidden />
          Track shipment
        </Link>
        <Link href="/exceptions" className="btn btn-outline btn-sm">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          View exceptions
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${kpi.className}`}>
              <kpi.icon className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Shipments over time</CardTitle>
          <span className="text-xs text-muted-foreground">Last {days} days</span>
        </CardHeader>
        <CardContent>
          {stats.shipmentsOverTime.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No data available yet.</p>
          ) : (
            <ShipmentsAreaChart data={stats.shipmentsOverTime} />
          )}
        </CardContent>
      </Card>

      {/* activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* recent shipments */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent shipments</CardTitle>
            <Link href="/shipments" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentShipments.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No shipments yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentShipments.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/shipments/${s.id}`}
                      className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.shipmentNumber}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.trackingNumber ?? "No tracking yet"} · {s.recipientAddress?.city}, {countryName(s.recipientAddress?.countryCode)}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* recent events */}
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent tracking events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentEvents.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No tracking events yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentEvents.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-6 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="font-medium">{e.shipment.shipmentNumber}</span>
                        <span className="text-muted-foreground"> · {e.description ?? "Event"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(e.occurredAt)}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* webhook errors */}
      {(stats.webhookErrors > 0 || stats.apiErrors > 0) && (
        <Card className="border-red-200 bg-red-50/40 dark:border-red-700/40">
          <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">
                <AlertTriangle className="mr-1.5 inline h-4 w-4" aria-hidden />
                Integration alerts
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.webhookErrors} webhook error{stats.webhookErrors === 1 ? "" : "s"} · {stats.apiErrors} API error{stats.apiErrors === 1 ? "" : "s"}
              </p>
            </div>
            <Link href="/webhooks" className="btn btn-outline btn-sm">
              Inspect error logs
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FilterLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={{ pathname: "/dashboard", query: { range: href } }}
      className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </Link>
  );
}