import Link from "next/link";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { countryName } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "customer_read")) return null;

  const customers = await prisma.customer.findMany({
    where: { organizationId: user.organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { shipments: true, addresses: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">{customers.length} registered customers</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers appear here when they register through the public site."
        />
      ) : (
        <Card className="hidden overflow-hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Shipments</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.company ?? "—"}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{countryName(c.countryCode)}</td>
                    <td className="px-4 py-3">{c._count.shipments}</td>
                    <td className="px-4 py-3">
                      <Badge color={c.isActive ? "green" : "gray"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.createdAt, user.timezone)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {customers.length > 0 && (
        <div className="flex flex-col gap-3 lg:hidden">
          {customers.map((c) => (
            <div key={c.id} className="card-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{c.name}</p>
                <Badge color={c.isActive ? "green" : "gray"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.email}</p>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-muted-foreground">Company</span>
                <span className="truncate text-right">{c.company ?? "—"}</span>
                <span className="text-muted-foreground">Country</span>
                <span className="text-right">{countryName(c.countryCode)}</span>
                <span className="text-muted-foreground">Shipments</span>
                <span className="text-right">{c._count.shipments}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Need a customer detail page? <Link href="/" className="text-primary hover:underline">Contact us</Link> — the customer workspace is available in the portal.
      </p>
    </div>
  );
}