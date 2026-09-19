import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

// ── In-memory sliding-window rate limiter (spec §129) ───────────────────────
// 120 req/ip/min for webhooks, 60 req/ip/min for the rest of the API.
// A serverless deployment should replace this with an external store (Redis).

const WINDOW_MS = 60_000;
const WAIT_MS = 120_000;
const limits = new Map<string, { hits: number[]; limit: number }>();

function isRateLimited(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = limits.get(key) ?? { hits: [], limit };
  const cutoff = now - WINDOW_MS;
  entry.hits = entry.hits.filter((t) => t > cutoff);

  if (entry.hits.length >= entry.limit) {
    if (entry.hits.length >= entry.limit + 20) limits.delete(key); // prevent unbounded growth
    return true;
  }

  entry.hits.push(now);
  entry.limit = limit;
  limits.set(key, entry);

  // Tidy: drop stale keys occasionally
  if (limits.size > 10_000) {
    const before = now - WAIT_MS;
    for (const [k, v] of limits) {
      if (v.hits.length === 0 || v.hits.every((t) => t < before)) limits.delete(k);
    }
  }
  return false;
}

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const ip = clientIp(req);

  // CORS for the public v1 API (spec §41)
  if (url.pathname.startsWith("/api/v1")) {
    const origin = req.headers.get("origin");
    if (origin) {
      const allowAll = origin.endsWith(req.nextUrl.host) || req.method === "GET";
      const corsHeaders: Record<string, string> = allowAll
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Signature",
          }
        : {};
      if (req.method === "OPTIONS") {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
      }
    }
  }

  if (req.method === "OPTIONS") return new NextResponse(null, { status: 204 });

  const isWebhook = url.pathname.startsWith("/api/webhooks") || url.pathname.startsWith("/api/v1/webhooks");
  const limit = isWebhook ? 120 : 60;

  if (isRateLimited(`${ip}|${url.pathname}`, limit)) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." } },
      { status: 429 },
    );
  }

  const response = NextResponse.next();
  response.headers.set("Vary", "Origin");
  return response;
}