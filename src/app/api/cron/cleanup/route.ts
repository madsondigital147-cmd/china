import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCronSecret } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const results = await prisma.$transaction([
    // Clean old webhook logs (keep 90 days)
    prisma.apiLog.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } },
    }),
    // Clean old read notifications (keep 30 days)
    prisma.notification.deleteMany({
      where: { readAt: { not: null }, createdAt: { lt: thirtyDaysAgo } },
    }),
    // Clean old tracking events for demo shipments (keep 30 days)
    prisma.trackingEvent.deleteMany({
      where: {
        shipment: { isDemo: true },
        createdAt: { lt: thirtyDaysAgo },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: {
      apiLogs: results[0].count,
      notifications: results[1].count,
      trackingEvents: results[2].count,
    },
  });
}