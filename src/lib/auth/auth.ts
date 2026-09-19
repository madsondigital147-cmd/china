import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { RoleCode } from "@prisma/client";
import { verifySessionToken, SESSION_COOKIE } from "./session";
import { permissionsForRole, type PermissionKey } from "@/lib/rbac";

export interface CurrentUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  roleCode: RoleCode;
  roleName: string;
  customerId: string | null;
  language: string;
  timezone: string;
}

/**
 * Resolve the currently authenticated user from the session cookie.
 * Returns null when there is no valid session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true, customer: { select: { id: true } } },
  });
  if (!user || !user.isActive || user.deletedAt) return null;

  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    name: user.name,
    roleCode: user.role.code,
    roleName: user.role.name,
    customerId: user.customer?.id ?? null,
    language: user.language,
    timezone: user.timezone,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export function hasPermission(user: CurrentUser, permission: PermissionKey): boolean {
  return permissionsForRole(user.roleCode).includes(permission);
}

export async function requirePermission(user: CurrentUser, permission: PermissionKey) {
  if (!hasPermission(user, permission)) throw new Error("FORBIDDEN");
}

export function isAdminRole(roleCode: RoleCode) {
  return roleCode === "SUPER_ADMIN" || roleCode === "ADMIN";
}

export function isOperatorRole(roleCode: RoleCode) {
  return roleCode === "OPERATOR" || isAdminRole(roleCode);
}