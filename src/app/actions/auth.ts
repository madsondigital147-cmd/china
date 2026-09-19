"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { writeAuditLog } from "@/services/audit";

export interface ActionResult {
  error?: string;
  ok?: boolean;
}

export async function loginAction(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
    include: { role: true, customer: { select: { id: true } } },
  });
  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password." };

  const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
  if (!org) return { error: "Invalid account configuration." };

  const token = await signSessionToken({
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    name: user.name,
    roleCode: user.role.code,
    customerId: user.customer?.id ?? null,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await writeAuditLog({
    organizationId: user.organizationId,
    userId: user.id,
    action: "user.login",
    entityType: "user",
    entityId: user.id,
  });

  const isAdmin = user.role.code === "SUPER_ADMIN" || user.role.code === "ADMIN" || user.role.code === "OPERATOR";
  redirect(isAdmin ? "/dashboard" : user.customer?.id ? "/portal" : "/dashboard");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}

export async function registerAction(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!name || name.length < 2) return { error: "Full name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });
  if (existing) return { error: "An account with this email already exists." };

  const role = await prisma.role.findUnique({ where: { code: "CUSTOMER" } });
  if (!role) return { error: "Registration is not configured." };

  const org = await prisma.organization.findFirst();
  if (!org) return { error: "No organization configured." };

  const { hashPassword } = await import("@/lib/auth/password");
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      organizationId: org.id,
      roleId: role.id,
      email: email.toLowerCase(),
      name,
      passwordHash,
    },
  });

  const token = await signSessionToken({
    id: user.id,
    organizationId: org.id,
    email: user.email,
    name: user.name,
    roleCode: "CUSTOMER",
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());

  redirect("/portal");
}