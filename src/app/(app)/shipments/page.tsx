import Link from "next/link";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { listShipments } from "@/services/shipments-list";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Search } from "lucide-react";
import { STATUSES } from "@/lib/status";
import { countryName } from "@/lib/constants";
import { formatWeight, formatDate } from "@/lib/utils";
import { ShipmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shipments" };

type SearchParams = Promise<{
  page?: string;
  search?: string;
  status?: string;
  country?: string;
}>;

export default async function ShipmentsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const q = await searchParams;
  const page = parseInt(q.page ?? "1", 10) || 1;
  const canCreate = hasPermission(user, "shipment_create");

  const { rows, total, totalPages } = await listShipments(user.organizationId, {
    page,
    search: q.search,
    status: (q.status as ShipmentStatus) || "ALL",
    country: q.country,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">{total} total</p>
        </div>
        {canCreate && (
          <Link href="/shipments/new" className="btn btn-primary btn-md">
            <PlusCircle className="h-4 w-4" aria-hidden />
            New shipment
          </Link>
        )}
      </div>

      {/* filters */}
      <form action="/shipments" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field>
          <Input name="search" placeholder="Search tracking, ID, customer..." defaultValue={q.search} className="pl-9" />
        </Field>
        <Select name="status" defaultValue={q.status ?? "ALL"}>
          <option value="ALL">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUSES[s].label}
            </option>
          ))}
        </Select>
        <Select name="country" defaultValue={q.country ?? ""}>
          <option value="">All countries</option>
          {["CN", "BR", "US", "CA", "FR", "DE", "JP", "AU", "GB", "IT", "ES", "MX"].map((c) => (
            <option key={c} value={c}>
              {countryName(c)}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" size="md">
          <Search className="h-4 w-4" aria-hidden />
          Filter
        </Button>
      </form>

      {/* list */}
      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No shipments found"
          description="Adjust your filters or create your first shipment to get started."
        />
      ) : (
        <>
          {/* desktop table */}
          <Card className="hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Shipment</th>
                    <th className="px-4 py-3 font-medium">Tracking</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Destination</th>
                    <th className="px-4 py-3 font-medium">Carrier</th>
                    <th className="px-4 py-3 font-medium">Weight</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{s.shipmentNumber}</td>
                      <td className="px-4 py-3">
                        {s.trackingNumber ? (
                          <span className="font-mono text-xs">{s.trackingNumber}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{s.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        {s.recipientAddress?.city ? `${s.recipientAddress.city}, ${countryName(s.recipientAddress.countryCode)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.carrier?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.packageData ? formatWeight(Number(s.packageData.weightKg)) : "—"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(s.createdAt, user.timezone)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/shipments/${s.id}`} className="text-xs font-medium text-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {rows.map((s) => (
              <Link key={s.id} href={`/shipments/${s.id}`} className="card-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{s.shipmentNumber}</p>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {s.trackingNumber ?? "No tracking yet"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="truncate text-right">{s.recipientAddress?.city}, {countryName(s.recipientAddress?.countryCode)}</span>
                  <span className="text-muted-foreground">Carrier</span>
                  <span className="truncate text-right">{s.carrier?.name ?? "—"}</span>
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-right">{formatDate(s.createdAt, user.timezone)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={{ pathname: "/shipments", query: { ...(q.search ? { search: q.search } : {}), page: p } }}
                  className={
                    p === page
                      ? "flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"
                      : "flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
                  }
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const STATUS_OPTIONS = Object.values(ShipmentStatus);