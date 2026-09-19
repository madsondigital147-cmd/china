import { NextRequest } from "next/server";
import { Prisma, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { authenticateApiKey, extractBearerToken, logApiRequest } from "@/lib/api/auth";
import { badRequest, jsonOk, serverError, unauthorized } from "@/lib/api/json";
import { normalizeTrackingInput } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MAX_ITEMS = 100;

export const GET = async (req: NextRequest) => {
  const started = Date.now();
  const auth = await authenticateApiKey(extractBearerToken(req.headers.get("authorization")));
  if (!auth) {
    await logApiRequest({
      organizationId: "unknown",
      apiKeyId: null,
      method: "GET",
      path: req.nextUrl.pathname,
      statusCode: 401,
      latencyMs: Date.now() - started,
      ip: req.headers.get("x-forwarded-for") ?? null,
    });
    return unauthorized();
  }

  const sp = req.nextUrl.searchParams;
  const where: Prisma.ShipmentWhereInput = { organizationId: auth.organizationId, deletedAt: null };

  if (sp.get("status")) {
    const status = sp.get("status")!.toUpperCase();
    if (!Object.values(ShipmentStatus).includes(status as ShipmentStatus)) {
      return badRequest(`Invalid status "${status}"`, "INVALID_STATUS");
    }
    where.status = status as ShipmentStatus;
  }
  if (sp.get("carrier")) where.carrierId = sp.get("carrier")!;
  if (sp.get("q")) {
    const q = sp.get("q")!.trim();
    if (q) {
      where.OR = [
        { shipmentNumber: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { trackingNumber: { contains: normalizeTrackingInput(q) } },
      ];
    }
  }

  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(MAX_ITEMS, Math.max(1, parseInt(sp.get("pageSize") ?? "20", 10) || 20));

  try {
    const [total, rows] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          shipmentNumber: true,
          trackingNumber: true,
          status: true,
          isDemo: true,
          reference: true,
          createdAt: true,
          updatedAt: true,
          estimatedDeliveryEnd: true,
          carrier: { select: { name: true, code: true } },
          service: { select: { name: true, code: true } },
          recipientAddress: { select: { city: true, countryCode: true } },
          packageData: { select: { weightKg: true, currency: true } },
        },
      }),
    ]);

    const items = rows.map((s) => ({
      id: s.id,
      shipmentNumber: s.shipmentNumber,
      trackingNumber: s.trackingNumber,
      status: s.status,
      isDemo: s.isDemo,
      reference: s.reference,
      carrier: s.carrier?.name ?? null,
      carrierCode: s.carrier?.code ?? null,
      service: s.service?.name ?? null,
      serviceCode: s.service?.code ?? null,
      destination: s.recipientAddress ? `${s.recipientAddress.city ?? ""}, ${s.recipientAddress.countryCode}` : null,
      weightKg: s.packageData ? Number(s.packageData.weightKg) : null,
      currency: s.packageData?.currency ?? null,
      estimatedDeliveryEnd: s.estimatedDeliveryEnd?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    }));

    const response = {
      ok: true,
      data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };

    await logApiRequest({
      organizationId: auth.organizationId,
      apiKeyId: auth.apiKeyId,
      method: "GET",
      path: req.nextUrl.pathname,
      statusCode: 200,
      latencyMs: Date.now() - started,
      ip: req.headers.get("x-forwarded-for") ?? null,
      requestJson: { query: Object.fromEntries(sp) },
      responseJson: { total },
    });

    return jsonOk(response);
  } catch (err) {
    return serverError();
  }
};