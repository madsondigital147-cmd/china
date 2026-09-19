import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const generalSchema = z.object({
  companyName: z.string().min(1).max(100).optional(),
  slogan: z.string().max(200).optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  timezone: z.string().min(1).optional(),
  defaultLanguage: z.enum(["en", "pt-BR", "es", "zh-CN"]).optional(),
  defaultCurrency: z.enum(["USD", "BRL", "EUR", "CNY"]).optional(),
  shipmentNumberFormat: z.string().min(1).max(50).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(user, "settings_manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = generalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 422 });
  }

  const updates = Object.entries(parsed.data).filter(([, v]) => v !== undefined);

  await prisma.$transaction(
    updates.map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { organizationId_key: { organizationId: user.organizationId, key } },
        update: { value: value as unknown as object },
        create: { organizationId: user.organizationId, key, value: value as unknown as object },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}