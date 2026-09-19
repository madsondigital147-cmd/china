import { NextResponse } from "next/server";

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(code: string, message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, ...extra },
    },
    { status },
  );
}

export function badRequest(message: string, code = "BAD_REQUEST") {
  return jsonError(code, message, 400);
}

export function unauthorized(message = "Missing or invalid API key") {
  return jsonError("UNAUTHORIZED", message, 401);
}

export function notFound(message = "Resource not found") {
  return jsonError("NOT_FOUND", message, 404);
}

export function methodNotAllowed() {
  return jsonError("METHOD_NOT_ALLOWED", "Method not allowed", 405);
}

export function serverError(message = "Internal server error") {
  return jsonError("INTERNAL_ERROR", message, 500);
}