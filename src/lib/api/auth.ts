import { createHash, timingSafeEqual } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface ApiAuthResult {
  apiKeyId: string;
  organizationId: string;
  name: string;
}

/**
 * Authenticate an incoming API request via `Authorization: Bearer <key>`.
 * The full key is never stored — only its SHA-256 hash (spec §46).
 */
export async function authenticateApiKey(bearer: string | null): Promise<ApiAuthResult | null> {
  const key = bearer?.trim();
  if (!key) return null;
  if (key.length < 16 || key.length > 256) return null;

  const keyHash = createHash("sha256").update(key).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) return null;
  if (apiKey.status !== "ACTIVE") return null;
  if (apiKey.revokedAt) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { apiKeyId: apiKey.id, organizationId: apiKey.organizationId, name: apiKey.name };
}

export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function logApiRequest(input: {
  organizationId: string;
  apiKeyId: string | null;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number | null;
  ip: string | null;
  requestJson?: unknown;
  responseJson?: unknown;
}) {
  await prisma.apiLog.create({
    data: {
      organizationId: input.organizationId,
      apiKeyId: input.apiKeyId,
      method: input.method,
      path: input.path,
      statusCode: input.statusCode,
      latencyMs: input.latencyMs,
      ip: input.ip,
      requestJson: (input.requestJson ?? undefined) as Prisma.InputJsonValue | undefined,
      responseJson: (input.responseJson ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  }).catch(() => {
    // Logging must never break the API response.
  });
}

/** Constant-time string comparison helper. */
export function safeEqual(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}