import Link from "next/link";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { listAuditLogs } from "@/services/audit";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit logs" };

type SearchParams = Promise<{ page?: string; action?: string }>;

export default async function AuditLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user, "audit_read")) return null;

  const q = await searchParams;
  const page = parseInt(q.page ?? "1", 10) || 1;
  const pageSize = 30;
  const { rows, total } = await listAuditLogs({
    organizationId: user.organizationId,
    page,
    pageSize,
    action: q.action,
  });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Audit logs</h1>
        <p className="page-subtitle">Immutable record of system activity · {total} entries</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Shield} title="No audit entries" description="Actions performed in the platform will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.action}</code>
                    </td>
                    <td className="px-4 py-3">{row.user ? row.user.name : <span className="text-muted-foreground">system</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.entityType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.entityId ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(row.createdAt, user.timezone)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/audit-logs", query: { page: p } }}
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
    </div>
  );
}