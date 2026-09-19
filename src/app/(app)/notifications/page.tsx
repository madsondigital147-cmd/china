import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkAllRead } from "./mark-all-read";
import { Bell } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { NotificationType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!user.id) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { shipment: { select: { shipmentNumber: true, trackingNumber: true, id: true } } },
  });

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread} unread</p>
        </div>
        {unread > 0 && <MarkAllRead />}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You'll be notified here about tracking events, exceptions and system updates."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.shipment ? `/shipments/${n.shipment.id}` : "/notifications"}
              className={[
                "card-surface flex items-start gap-3 p-4 transition-colors",
                n.readAt ? "" : "border-primary/40 bg-primary/[0.03]",
                n.shipment ? "hover:bg-muted/40" : "",
              ].join(" ")}
            >
              <span
                className={["mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-muted" : "bg-primary"].join(" ")}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt, undefined, user.language)}</span>
                </div>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                {n.shipment && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {n.shipment.shipmentNumber}
                    {n.shipment.trackingNumber ? ` · ${n.shipment.trackingNumber}` : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}