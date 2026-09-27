import { ConsultationLeadStatus } from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { getAuditRepository } from "@/server/repositories/repository-provider";

const statusMap = {
  new: ConsultationLeadStatus.NEW,
  contacted: ConsultationLeadStatus.CONTACTED,
  qualified: ConsultationLeadStatus.QUALIFIED,
  closed: ConsultationLeadStatus.CLOSED,
} as const;

const slug = (value: string) => value.toLowerCase().replaceAll("_", "-");

function serialize<T extends { status: string; consentAt: Date; createdAt: Date; updatedAt: Date }>(lead: T) {
  return {
    ...lead,
    status: slug(lead.status),
    consentAt: lead.consentAt.toISOString(),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export async function listAdminConsultationLeads(
  user: AuthUser,
  input: { search?: string; status?: string; source?: string; page?: number } = {},
) {
  requireAdminPermission(user, "admin.leads.read");
  const prisma = getPrismaClient();
  const search = input.search?.trim();
  const page = Math.max(1, input.page ?? 1);
  const pageSize = 30;
  const where = {
    ...(input.status && Object.hasOwn(statusMap, input.status)
      ? { status: statusMap[input.status as keyof typeof statusMap] }
      : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(search
      ? {
          OR: [
            { phone: { contains: search } },
            { name: { contains: search, mode: "insensitive" as const } },
            { businessName: { contains: search, mode: "insensitive" as const } },
            { need: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total, sources, metrics] = await Promise.all([
    prisma.consultationLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.consultationLead.count({ where }),
    prisma.consultationLead.findMany({ distinct: ["source"], select: { source: true }, orderBy: { source: "asc" } }),
    prisma.consultationLead.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(metrics.map((item) => [slug(item.status), item._count._all]));
  return {
    items: items.map(serialize),
    sources: sources.map((item) => item.source),
    metrics: {
      total: Object.values(counts).reduce((sum, value) => sum + value, 0),
      new: counts.new ?? 0,
      contacted: counts.contacted ?? 0,
      qualified: counts.qualified ?? 0,
      closed: counts.closed ?? 0,
    },
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function updateAdminConsultationLead(user: AuthUser, id: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.leads.manage");
  const prisma = getPrismaClient();
  const before = await prisma.consultationLead.findUnique({ where: { id } });
  if (!before) throw new NotFoundApiError("درخواست مشاوره پیدا نشد.");

  if (typeof body.status !== "string" || !Object.hasOwn(statusMap, body.status)) {
    throw new ValidationApiError("وضعیت درخواست معتبر نیست.");
  }
  const internalNote = typeof body.internalNote === "string" ? body.internalNote.trim() : "";
  if (internalNote.length > 2000) throw new ValidationApiError("یادداشت پیگیری بیش از حد طولانی است.");

  const status = statusMap[body.status as keyof typeof statusMap];
  const updated = await prisma.consultationLead.update({
    where: { id },
    data: { status, internalNote: internalNote || null },
  });

  await getAuditRepository().create({
    actorUserId: user.id,
    action: "consultation_lead_updated",
    targetType: "consultation-lead",
    targetId: id,
    metadata: { beforeStatus: slug(before.status), afterStatus: slug(status), noteChanged: before.internalNote !== updated.internalNote },
  });

  return serialize(updated);
}
