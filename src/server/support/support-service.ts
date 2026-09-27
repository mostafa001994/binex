import { randomBytes } from "node:crypto";
import {
  NotificationKind,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import { requireBusinessActive } from "@/server/business/business-access";
import { ConflictApiError, NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { sendToN8n } from "@/server/automation/n8n-client";
import { createAutomationPayload, AutomationEvents } from "@/server/automation/events";
import { getAuditRepository } from "@/server/repositories/repository-provider";
import { getSlaState, supportSlaDeadlines } from "@/server/support/support-sla";

const categories = new Set(["technical", "billing", "subscription", "service", "other"]);
const ticketInclude = {
  messages: {
    where: { isInternal: false },
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: { id: true, name: true, phone: true } } },
  },
};

function text(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new ValidationApiError(`${field} معتبر نیست.`);
  }
  return value.trim();
}

function ticketNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `BNX-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function serializeTicket<T extends { status: SupportTicketStatus; priority: SupportTicketPriority; createdAt: Date; updatedAt: Date; lastMessageAt: Date; firstResponseDueAt: Date; resolutionDueAt: Date; firstRespondedAt: Date | null; resolvedAt: Date | null; closedAt: Date | null }>(ticket: T) {
  return {
    ...ticket,
    status: ticket.status.toLowerCase().replaceAll("_", "-"),
    priority: ticket.priority.toLowerCase(),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    lastMessageAt: ticket.lastMessageAt.toISOString(),
    firstResponseDueAt: ticket.firstResponseDueAt.toISOString(),
    resolutionDueAt: ticket.resolutionDueAt.toISOString(),
    firstRespondedAt: ticket.firstRespondedAt?.toISOString() ?? null,
    sla: getSlaState(ticket),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    closedAt: ticket.closedAt?.toISOString() ?? null,
    ...(Object.hasOwn(ticket, "messages") ? {
      messages: (ticket as T & { messages: Array<{ createdAt: Date }> }).messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() })),
    } : {}),
  };
}

export async function listMyTickets(user: AuthUser) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  const tickets = await getPrismaClient().supportTicket.findMany({
    where: { businessId: context.business.id, createdByUserId: user.id },
    orderBy: { lastMessageAt: "desc" },
  });
  return tickets.map(serializeTicket);
}

export async function getMyTicket(user: AuthUser, id: string) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  const ticket = await getPrismaClient().supportTicket.findFirst({
    where: { id, businessId: context.business.id, createdByUserId: user.id },
    include: ticketInclude,
  });
  if (!ticket) throw new NotFoundApiError("تیکت پیدا نشد.");
  return serializeTicket(ticket);
}

export async function createMyTicket(user: AuthUser, body: Record<string, unknown>) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  const subject = text(body.subject, "موضوع", 3, 180);
  const message = text(body.message, "متن پیام", 3, 5000);
  const category = typeof body.category === "string" ? body.category : "other";
  if (!categories.has(category)) throw new ValidationApiError("دسته‌بندی تیکت معتبر نیست.");
  const prisma = getPrismaClient();
  const ticket = await prisma.$transaction(async (tx) => {
    const created = await tx.supportTicket.create({
      data: { ticketNumber: ticketNumber(), businessId: context.business.id, createdByUserId: user.id, subject, category, ...supportSlaDeadlines() },
    });
    await tx.supportTicketMessage.create({ data: { ticketId: created.id, authorUserId: user.id, body: message } });
    const recipients = await tx.user.findMany({
      where: {
        status: "ACTIVE",
        accessRole: {
          permissions: {
            some: { permissionCode: "admin.support.read" },
          },
        },
      },
      select: { id: true },
    });
    if (recipients.length) {
      await tx.notification.createMany({
        data: recipients.map((recipient) => ({
          userId: recipient.id,
          kind: NotificationKind.INFO,
          title: `تیکت جدید ${created.ticketNumber}`,
          message: `${subject} · ${context.business.name}`,
          href: `/admin/support/${created.id}`,
        })),
      });
    }
    return created;
  });
  await getAuditRepository().create({ actorUserId: user.id, action: "support_ticket_created", targetType: "support-ticket", targetId: ticket.id, metadata: { businessId: context.business.id, ticketNumber: ticket.ticketNumber, category } });

  await sendToN8n(
    createAutomationPayload(
      AutomationEvents.TICKET_CREATED,
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        businessId: context.business.id,
        category,
        subject,
      }
    )
  );

  return getMyTicket(user, ticket.id);
}

export async function replyToMyTicket(user: AuthUser, id: string, body: Record<string, unknown>) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  const message = text(body.message, "متن پیام", 3, 5000);
  const prisma = getPrismaClient();
  const ticket = await prisma.supportTicket.findFirst({ where: { id, businessId: context.business.id, createdByUserId: user.id } });
  if (!ticket) throw new NotFoundApiError("تیکت پیدا نشد.");
  if (ticket.status === SupportTicketStatus.CLOSED) throw new ConflictApiError("تیکت بسته است و امکان ارسال پاسخ ندارد.");
  await prisma.$transaction([
    prisma.supportTicketMessage.create({ data: { ticketId: id, authorUserId: user.id, body: message } }),
    prisma.supportTicket.update({ where: { id }, data: { lastMessageAt: new Date(), status: ticket.status === SupportTicketStatus.WAITING_CUSTOMER ? SupportTicketStatus.IN_PROGRESS : ticket.status } }),
  ]);
  await getAuditRepository().create({ actorUserId: user.id, action: "support_ticket_replied", targetType: "support-ticket", targetId: id, metadata: { source: "customer" } });
  return getMyTicket(user, id);
}

export async function listMyNotifications(user: AuthUser) {
  const prisma = getPrismaClient();
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return { unreadCount, items: items.map((item) => ({ ...item, kind: item.kind.toLowerCase(), createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() ?? null })) };
}

export async function markNotification(user: AuthUser, id: string) {
  const result = await getPrismaClient().notification.updateMany({ where: { id, userId: user.id }, data: { readAt: new Date() } });
  if (!result.count) throw new NotFoundApiError("اعلان پیدا نشد.");
  return { id, read: true };
}

export async function markAllNotifications(user: AuthUser) {
  const result = await getPrismaClient().notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return { updated: result.count };
}

export { NotificationKind };
