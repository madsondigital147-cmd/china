import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface AuditEntryInput {
  organizationId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Append-only audit log (spec §42, §115). Never update/delete.
 */
export async function writeAuditLog(entry: AuditEntryInput) {
  return prisma.auditLog.create({
    data: {
      organizationId: entry.organizationId,
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      beforeJson: (entry.before as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      afterJson: (entry.after as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    },
  });
}

export async function listAuditLogs(opts: {
  organizationId: string;
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
}) {
  const page = Math.max(opts.page ?? 1, 1);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 25, 1), 100);

  const where: Prisma.AuditLogWhereInput = {
    organizationId: opts.organizationId,
    ...(opts.action ? { action: opts.action } : {}),
    ...(opts.entityType ? { entityType: opts.entityType } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}