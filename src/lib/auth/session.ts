import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secretKey = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me");

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  roleCode: string;
  customerId?: string | null;
}

export interface SessionPayload extends JWTPayload {
  userId: string;
  organizationId: string;
}

export async function signSessionToken(user: AuthUser, ttlDays?: number) {
  const days = ttlDays ?? parseInt(process.env.AUTH_SESSION_TTL_DAYS ?? "30", 10);
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    userId: user.id,
    organizationId: user.organizationId,
    roleCode: user.roleCode,
    customerId: user.customerId ?? null,
  } as SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + days * 24 * 60 * 60)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "nexus_session";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}