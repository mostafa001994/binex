import {
  BusinessMemberRole,
  BusinessStatus,
  OrderStatus,
  ProvisioningJobStatus,
  SubscriptionStatus,
  UserStatus,
} from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { hasAdminPermission, type AdminPermission } from "@/server/admin/admin-permissions";
import {
  ConflictApiError,
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { getAuditRepository } from "@/server/repositories/repository-provider";

const PHONE_PATTERN = /^09\d{9}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

function requireAdminPermission(user: AuthUser, permission: AdminPermission) {
  if (!hasAdminPermission(user.permissions, permission)) {
    throw new ForbiddenApiError("شما مجوز انجام این عملیات را ندارید.");
  }
}

function profile(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
  const category = typeof body.category === "string" && body.category.trim() ? body.category.trim() : null;

  if (name.length < 2 || name.length > 160) {
    throw new ValidationApiError("نام کسب‌وکار باید بین ۲ تا ۱۶۰ کاراکتر باشد.");
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    throw new ValidationApiError("شماره تماس کسب‌وکار باید با فرمت 09xxxxxxxxx باشد.");
  }
  if (category && category.length > 100) {
    throw new ValidationApiError("دسته‌بندی حداکثر ۱۰۰ کاراکتر است.");
  }
  return { name, phone, category };
}

export async function createAdminBusiness(user: AuthUser, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.businesses.manage");
  const input = profile(body);
  const ownerUserId = typeof body.ownerUserId === "string" ? body.ownerUserId.trim() : "";
  if (!UUID_PATTERN.test(ownerUserId)) throw new ValidationApiError("مالک کسب‌وکار باید از کاربران موجود انتخاب شود.");

  const prisma = getPrismaClient();
  const owner = await prisma.user.findUnique({ where: { id: ownerUserId } });
  if (!owner) throw new NotFoundApiError("کاربر مالک پیدا نشد.");
  if (owner.status !== UserStatus.ACTIVE) throw new ConflictApiError("حساب مالک مسدود است و نمی‌تواند مالک کسب‌وکار جدید باشد.");

  const business = await prisma.$transaction(async (tx) => {
    const created = await tx.business.create({ data: { ...input, status: BusinessStatus.ACTIVE } });
    await tx.businessMember.create({ data: { businessId: created.id, userId: ownerUserId, role: BusinessMemberRole.OWNER } });
    return created;
  });

  await getAuditRepository().create({
    actorUserId: user.id,
    action: "business_created",
    targetType: "business",
    targetId: business.id,
    metadata: { name: business.name, ownerUserId },
  });
  return { ...business, archivedAt: business.archivedAt?.toISOString() ?? null, createdAt: business.createdAt.toISOString(), updatedAt: business.updatedAt.toISOString() };
}

export async function updateAdminBusinessProfile(user: AuthUser, businessId: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.businesses.manage");
  if (!UUID_PATTERN.test(businessId)) throw new NotFoundApiError("کسب‌وکار پیدا نشد.");
  const input = profile(body);
  const prisma = getPrismaClient();
  const current = await prisma.business.findUnique({ where: { id: businessId } });
  if (!current) throw new NotFoundApiError("کسب‌وکار پیدا نشد.");
  if (current.status === BusinessStatus.ARCHIVED) throw new ConflictApiError("برای ویرایش، ابتدا کسب‌وکار را از آرشیو بازیابی کنید.");
  const updated = await prisma.business.update({ where: { id: businessId }, data: input });
  await getAuditRepository().create({
    actorUserId: user.id,
    action: "business_profile_updated",
    targetType: "business",
    targetId: businessId,
    metadata: { beforeName: current.name, afterName: updated.name, beforePhone: current.phone, afterPhone: updated.phone, beforeCategory: current.category, afterCategory: updated.category },
  });
  return { ...updated, archivedAt: updated.archivedAt?.toISOString() ?? null, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() };
}

export async function archiveAdminBusiness(user: AuthUser, businessId: string) {
  requireAdminPermission(user, "admin.businesses.manage");
  const prisma = getPrismaClient();
  const current = await prisma.business.findUnique({ where: { id: businessId } });
  if (!current) throw new NotFoundApiError("کسب‌وکار پیدا نشد.");
  if (current.status === BusinessStatus.ARCHIVED) return current;

  const [openSubscriptions, runningJobs] = await Promise.all([
    prisma.subscription.count({ where: { businessId, status: { in: [SubscriptionStatus.PENDING, SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.PAUSED] } } }),
    prisma.provisioningJob.count({ where: { businessId, status: { in: [ProvisioningJobStatus.PENDING, ProvisioningJobStatus.PROCESSING] } } }),
  ]);
  if (openSubscriptions || runningJobs) {
    throw new ConflictApiError(`آرشیو امن نیست؛ ${openSubscriptions.toLocaleString("fa-IR")} اشتراک باز و ${runningJobs.toLocaleString("fa-IR")} عملیات راه‌اندازی در جریان است.`);
  }
  const updated = await prisma.business.update({ where: { id: businessId }, data: { status: BusinessStatus.ARCHIVED, archivedAt: new Date() } });
  await getAuditRepository().create({ actorUserId: user.id, action: "business_archived", targetType: "business", targetId: businessId, metadata: { beforeStatus: current.status.toLowerCase() } });
  return updated;
}

export async function restoreAdminBusiness(user: AuthUser, businessId: string) {
  requireAdminPermission(user, "admin.businesses.manage");
  const prisma = getPrismaClient();
  const current = await prisma.business.findUnique({ where: { id: businessId } });
  if (!current) throw new NotFoundApiError("کسب‌وکار پیدا نشد.");
  if (current.status !== BusinessStatus.ARCHIVED) throw new ConflictApiError("این کسب‌وکار در آرشیو نیست.");
  const updated = await prisma.business.update({ where: { id: businessId }, data: { status: BusinessStatus.SUSPENDED, archivedAt: null } });
  await getAuditRepository().create({ actorUserId: user.id, action: "business_restored", targetType: "business", targetId: businessId, metadata: { restoredAs: "suspended" } });
  return updated;
}

export async function getAdminBusinessCommerceSummary(user: AuthUser, businessId: string) {
  requireAdminPermission(user, "admin.businesses.read");
  const prisma = getPrismaClient();
  const [subscriptionCounts, orderCounts, recentSubscriptions, recentOrders] = await Promise.all([
    prisma.subscription.groupBy({ by: ["status"], where: { businessId }, _count: { _all: true } }),
    prisma.order.groupBy({ by: ["status"], where: { businessId }, _count: { _all: true } }),
    prisma.subscription.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 5, include: { service: { select: { name: true } }, plan: { select: { name: true } } } }),
    prisma.order.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const activeStatuses = new Set<SubscriptionStatus>([SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.PAUSED]);
  return {
    counts: {
      subscriptions: subscriptionCounts.reduce((sum, item) => sum + item._count._all, 0),
      activeSubscriptions: subscriptionCounts.filter((item) => activeStatuses.has(item.status)).reduce((sum, item) => sum + item._count._all, 0),
      orders: orderCounts.reduce((sum, item) => sum + item._count._all, 0),
      pendingOrders: orderCounts.find((item) => item.status === OrderStatus.PENDING_PAYMENT)?._count._all ?? 0,
    },
    recentSubscriptions: recentSubscriptions.map((item) => ({ id: item.id, status: item.status.toLowerCase().replaceAll("_", "-"), serviceName: item.service.name, planName: item.plan.name, currentPeriodEndsAt: item.currentPeriodEndsAt?.toISOString() ?? null })),
    recentOrders: recentOrders.map((item) => ({ id: item.id, orderNumber: item.orderNumber, status: item.status.toLowerCase().replaceAll("_", "-"), totalAmount: item.totalAmount.toString(), createdAt: item.createdAt.toISOString() })),
  };
}
