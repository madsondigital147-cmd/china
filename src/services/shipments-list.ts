import { prisma } from "@/lib/db";
import { Prisma, ShipmentStatus } from "@prisma/client";

export interface ShipmentsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ShipmentStatus | "ALL";
  country?: string;
  carrierId?: string;
  from?: string;
  to?: string;
}

export async function listShipments(organizationId: string, query: ShipmentsQuery) {
  const page = Math.max(query.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);

  const where: Prisma.ShipmentWhereInput = {
    organizationId,
    deletedAt: null,
  };

  if (query.search) {
    const term = query.search.trim();
    where.OR = [
      { shipmentNumber: { contains: term, mode: "insensitive" } },
      { trackingNumber: { contains: term, mode: "insensitive" } },
      { externalShipmentId: { contains: term, mode: "insensitive" } },
      { reference: { contains: term, mode: "insensitive" } },
      { customer: { name: { contains: term, mode: "insensitive" } } },
      { recipientAddress: { city: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (query.status && query.status !== "ALL") {
    where.status = query.status;
  }

  if (query.carrierId) {
    where.carrierId = query.carrierId;
  }

  if (query.country) {
    where.recipientAddress = { countryCode: query.country.toUpperCase() };
  }

  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(`${query.to}T23:59:59.999Z`) } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        recipientAddress: { select: { city: true, countryCode: true } },
        carrier: { select: { name: true, code: true } },
        customer: { select: { name: true } },
        packageData: { select: { weightKg: true } },
      },
    }),
    prisma.shipment.count({ where }),
  ]);

  return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}