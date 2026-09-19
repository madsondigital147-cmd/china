import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = { status: "ok" as const, service: "nexus-logistics", time: new Date().toISOString() };

  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ...status, db: "connected" });
  } catch {
    return NextResponse.json(
      { ok: false, ...status, db: "unavailable" },
      { status: 503 },
    );
  }
}