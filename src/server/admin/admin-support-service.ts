import { NotificationKind, PaymentStatus, ProvisioningJobStatus, SubscriptionStatus, SupportTicketPriority, SupportTicketStatus } from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { ConflictApiError, NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { getAuditRepository } from "@/server/repositories/repository-provider";
import { getSlaState, supportSlaPolicy } from "@/server/support/support-sla";

const statusMap = { open: SupportTicketStatus.OPEN, "in-progress": SupportTicketStatus.IN_PROGRESS, "waiting-customer": SupportTicketStatus.WAITING_CUSTOMER, resolved: SupportTicketStatus.RESOLVED, closed: SupportTicketStatus.CLOSED } as const;
const priorityMap = { low: SupportTicketPriority.LOW, normal: SupportTicketPriority.NORMAL, high: SupportTicketPriority.HIGH, urgent: SupportTicketPriority.URGENT } as const;
const include = {
  business: { select: { id: true, name: true, phone: true } },
  createdBy: { select: { id: true, name: true, phone: true } },
  assignedTo: { select: { id: true, name: true, phone: true } },
  messages: { orderBy: { createdAt: "asc" as const }, include: { author: { select: { id: true, name: true, phone: true } } } },
};
const slug = (value: string) => value.toLowerCase().replaceAll("_", "-");
function serialize(ticket: Awaited<ReturnType<typeof getPrismaClient>["supportTicket"]["findFirst"]> | Record<string, unknown>) {
  const item = ticket as Record<string, unknown> & { status: string; priority: string; createdAt: Date; updatedAt: Date; lastMessageAt: Date; firstResponseDueAt: Date; resolutionDueAt: Date; firstRespondedAt: Date | null; resolvedAt: Date | null; closedAt: Date | null; messages?: Array<Record<string, unknown> & { createdAt: Date }> };
  return { ...item, status: slug(item.status), priority: slug(item.priority), createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(), lastMessageAt: item.lastMessageAt.toISOString(), firstResponseDueAt: item.firstResponseDueAt.toISOString(), resolutionDueAt: item.resolutionDueAt.toISOString(), firstRespondedAt: item.firstRespondedAt?.toISOString() ?? null, resolvedAt: item.resolvedAt?.toISOString() ?? null, closedAt: item.closedAt?.toISOString() ?? null, sla: getSlaState(item), ...(item.messages ? { messages: item.messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() })) } : {}) };
}
function bodyText(value: unknown) { if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 5000) throw new ValidationApiError("متن پاسخ معتبر نیست."); return value.trim(); }

export async function listAdminSupportTickets(user: AuthUser, input: { search?: string; status?: string; priority?: string; assignee?: string; breach?: string } = {}) {
  requireAdminPermission(user, "admin.support.read");
  const search = input.search?.trim();
  const tickets = await getPrismaClient().supportTicket.findMany({
    where: {
      ...(input.status && Object.hasOwn(statusMap, input.status) ? { status: statusMap[input.status as keyof typeof statusMap] } : {}),
      ...(input.priority && Object.hasOwn(priorityMap, input.priority) ? { priority: priorityMap[input.priority as keyof typeof priorityMap] } : {}),
      ...(input.assignee === "unassigned" ? { assignedToUserId: null } : input.assignee ? { assignedToUserId: input.assignee } : {}),
      ...(input.breach === "first-response" ? { firstRespondedAt: null, firstResponseDueAt: { lt: new Date() }, status: { notIn: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED] } } : {}),
      ...(input.breach === "resolution" ? { resolutionDueAt: { lt: new Date() }, status: { notIn: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED] } } : {}),
      ...(input.breach === "any" ? { OR: [{ firstRespondedAt: null, firstResponseDueAt: { lt: new Date() } }, { resolutionDueAt: { lt: new Date() } }], status: { notIn: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED] } } : {}),
      ...(search ? { OR: [{ ticketNumber: { contains: search, mode: "insensitive" } }, { subject: { contains: search, mode: "insensitive" } }, { business: { name: { contains: search, mode: "insensitive" } } }, { createdBy: { phone: { contains: search } } }] } : {}),
    },
    orderBy: [{ priority: "desc" }, { lastMessageAt: "desc" }],
    include: { business: include.business, createdBy: include.createdBy, assignedTo: include.assignedTo, _count: { select: { messages: true } } },
    take: 100,
  });
  return tickets.map(serialize);
}

export async function getAdminSupportTicket(user: AuthUser, id: string) {
  requireAdminPermission(user, "admin.support.read");
  const ticket = await getPrismaClient().supportTicket.findUnique({ where: { id }, include });
  if (!ticket) throw new NotFoundApiError("تیکت پیدا نشد.");
  return serialize(ticket);
}

export async function updateAdminSupportTicket(user: AuthUser, id: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.support.manage");
  const prisma = getPrismaClient();
  const before = await prisma.supportTicket.findUnique({ where: { id } });
  if (!before) throw new NotFoundApiError("تیکت پیدا نشد.");
  if (body.operation === "reply") {
    if (before.status === SupportTicketStatus.CLOSED) throw new ConflictApiError("تیکت بسته است.");
    const message = bodyText(body.message);
    const isInternal = body.isInternal === true;
    await prisma.$transaction(async (tx) => {
      await tx.supportTicketMessage.create({ data: { ticketId: id, authorUserId: user.id, body: message, isInternal } });
      const repliedAt = new Date();
      await tx.supportTicket.update({ where: { id }, data: { lastMessageAt: repliedAt, status: isInternal ? before.status : SupportTicketStatus.WAITING_CUSTOMER, ...(!isInternal && !before.firstRespondedAt ? { firstRespondedAt: repliedAt } : {}) } });
      if (!isInternal) await tx.notification.create({ data: { userId: before.createdByUserId, kind: NotificationKind.INFO, title: `پاسخ جدید به ${before.ticketNumber}`, message: "پشتیبانی Binix به تیکت شما پاسخ داد.", href: `/app/support?ticket=${id}` } });
    });
    await getAuditRepository().create({ actorUserId: user.id, action: "support_ticket_replied", targetType: "support-ticket", targetId: id, metadata: { isInternal } });
    return getAdminSupportTicket(user, id);
  }
  if (body.operation !== "update") throw new ValidationApiError("عملیات تیکت معتبر نیست.");
  const status = typeof body.status === "string" && Object.hasOwn(statusMap, body.status) ? statusMap[body.status as keyof typeof statusMap] : before.status;
  const priority = typeof body.priority === "string" && Object.hasOwn(priorityMap, body.priority) ? priorityMap[body.priority as keyof typeof priorityMap] : before.priority;
  const assignedToUserId = body.assignedToUserId === null || body.assignedToUserId === "" ? null : typeof body.assignedToUserId === "string" ? body.assignedToUserId : before.assignedToUserId;
  if (assignedToUserId) {
    const assignee = await prisma.user.findFirst({ where: { id: assignedToUserId, status: "ACTIVE", accessRole: { permissions: { some: { permissionCode: "admin.support.read" } } } } });
    if (!assignee) throw new ValidationApiError("کارشناس پشتیبانی معتبر نیست.");
  }
  await prisma.supportTicket.update({ where: { id }, data: { status, priority, assignedToUserId, resolvedAt: status === SupportTicketStatus.RESOLVED ? new Date() : null, closedAt: status === SupportTicketStatus.CLOSED ? new Date() : null } });
  await getAuditRepository().create({ actorUserId: user.id, action: "support_ticket_updated", targetType: "support-ticket", targetId: id, metadata: { beforeStatus: slug(before.status), afterStatus: slug(status), beforePriority: slug(before.priority), afterPriority: slug(priority), assignedToUserId } });
  return getAdminSupportTicket(user, id);
}

export async function listSupportAssignees(user: AuthUser) {
  requireAdminPermission(user, "admin.support.manage");
  return getPrismaClient().user.findMany({ where: { status: "ACTIVE", accessRole: { permissions: { some: { permissionCode: "admin.support.read" } } } }, select: { id: true, name: true, phone: true }, orderBy: { createdAt: "asc" } });
}

export async function getAdminSupportMetrics(user: AuthUser) {
  requireAdminPermission(user, "admin.support.read");
  const prisma = getPrismaClient();
  const now = new Date();
  const active = { notIn: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED] };
  const [open, unassigned, firstResponseOverdue, resolutionOverdue, responded] = await Promise.all([
    prisma.supportTicket.count({ where: { status: active } }),
    prisma.supportTicket.count({ where: { status: active, assignedToUserId: null } }),
    prisma.supportTicket.count({ where: { status: active, firstRespondedAt: null, firstResponseDueAt: { lt: now } } }),
    prisma.supportTicket.count({ where: { status: active, resolutionDueAt: { lt: now } } }),
    prisma.supportTicket.findMany({ where: { firstRespondedAt: { not: null } }, select: { createdAt: true, firstRespondedAt: true }, take: 500, orderBy: { createdAt: "desc" } }),
  ]);
  const responseMinutes = responded.map((item) => Math.max(0, ((item.firstRespondedAt?.getTime() ?? item.createdAt.getTime()) - item.createdAt.getTime()) / 60_000));
  return { open, unassigned, firstResponseOverdue, resolutionOverdue, averageFirstResponseMinutes: responseMinutes.length ? Math.round(responseMinutes.reduce((sum, value) => sum + value, 0) / responseMinutes.length) : null, policy: supportSlaPolicy() };
}

export async function getOperationalAlerts(user: AuthUser) {
  requireAdminPermission(user, "admin.notifications.read");
  const prisma = getPrismaClient();
  const canReadLeads = user.permissions.includes("admin.leads.read");
  const [failedPayments, pastDueSubscriptions, failedJobs, urgentTickets, overdueTickets, newConsultationLeads] = await Promise.all([
    prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
    prisma.subscription.count({ where: { status: SubscriptionStatus.PAST_DUE } }),
    prisma.provisioningJob.count({ where: { status: ProvisioningJobStatus.FAILED } }),
    prisma.supportTicket.count({ where: { priority: SupportTicketPriority.URGENT, status: { in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS, SupportTicketStatus.WAITING_CUSTOMER] } } }),
    prisma.supportTicket.count({ where: { status: { notIn: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED] }, OR: [{ firstRespondedAt: null, firstResponseDueAt: { lt: new Date() } }, { resolutionDueAt: { lt: new Date() } }] } }),
    canReadLeads ? prisma.consultationLead.count({ where: { status: "NEW" } }) : Promise.resolve(0),
  ]);
  return [
    ...(canReadLeads ? [{ key: "new-consultation-leads", title: "درخواست‌های مشاوره جدید", count: newConsultationLeads, kind: "info", href: "/admin/leads?status=new" }] : []),
    { key: "failed-payments", title: "پرداخت‌های ناموفق", count: failedPayments, kind: "error", href: "/admin/payments" },
    { key: "past-due-subscriptions", title: "اشتراک‌های سررسیدگذشته", count: pastDueSubscriptions, kind: "warning", href: "/admin/subscriptions" },
    { key: "failed-provisioning", title: "راه‌اندازی‌های ناموفق", count: failedJobs, kind: "error", href: "/admin/provisioning" },
    { key: "urgent-support", title: "تیکت‌های فوری باز", count: urgentTickets, kind: "warning", href: "/admin/support?priority=urgent" },
    { key: "overdue-support", title: "تیکت‌های خارج از SLA", count: overdueTickets, kind: "error", href: "/admin/support?breach=any" },
  ];
}
