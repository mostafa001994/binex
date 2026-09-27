import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { ConflictApiError, NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import { getAuditRepository, getSubscriptionRepository } from "@/server/repositories/repository-provider";
import type { SubscriptionSearchInput, SubscriptionStatusValue } from "@/server/repositories/contracts/subscription-repository";
import { BillingPeriod, BusinessServiceStatus, BusinessStatus, PlanStatus, ProvisioningAction, ProvisioningStatus, SubscriptionStatus } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import { sendToN8n } from "@/server/automation/n8n-client";
import { createAutomationPayload, AutomationEvents } from "@/server/automation/events";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function periodEnd(start: Date, period: BillingPeriod, customDays: number | null) {
  const end = new Date(start);
  if (period === BillingPeriod.MONTHLY) end.setUTCMonth(end.getUTCMonth() + 1);
  else if (period === BillingPeriod.QUARTERLY) end.setUTCMonth(end.getUTCMonth() + 3);
  else if (period === BillingPeriod.YEARLY) end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCDate(end.getUTCDate() + (customDays ?? 0));
  return end;
}

function parseStart(value: unknown) {
  if (value === undefined || value === null || value === "") return new Date();
  if (typeof value !== "string") throw new ValidationApiError("تاریخ شروع معتبر نیست.");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new ValidationApiError("تاریخ شروع معتبر نیست.");
  return date;
}

export async function createAdminSubscription(user: AuthUser, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.subscriptions.manage");
  const businessId = typeof body.businessId === "string" ? body.businessId : "";
  const planId = typeof body.planId === "string" ? body.planId : "";
  if (!UUID_PATTERN.test(businessId) || !UUID_PATTERN.test(planId)) throw new ValidationApiError("کسب‌وکار یا پلن انتخاب‌شده معتبر نیست.");
  if (body.status !== "pending" && body.status !== "trialing" && body.status !== "active") throw new ValidationApiError("وضعیت اولیه اشتراک معتبر نیست.");
  const status = body.status === "active" ? SubscriptionStatus.ACTIVE : body.status === "trialing" ? SubscriptionStatus.TRIALING : SubscriptionStatus.PENDING;
  const prisma = getPrismaClient();
  const [business, plan] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.servicePlan.findUnique({ where: { id: planId }, include: { service: true } }),
  ]);
  if (!business || business.status !== BusinessStatus.ACTIVE) throw new ValidationApiError("کسب‌وکار فعال پیدا نشد.");
  if (!plan || plan.status !== PlanStatus.ACTIVE) throw new ValidationApiError("برای ایجاد اشتراک باید یک پلن فعال انتخاب شود.");
  if (status === SubscriptionStatus.TRIALING && plan.trialDays <= 0) throw new ValidationApiError("پلن انتخاب‌شده دوره آزمایشی ندارد.");
  const existing = await prisma.subscription.findFirst({ where: { businessId, serviceId: plan.serviceId, status: { in: [SubscriptionStatus.PENDING, SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.PAUSED] } } });
  if (existing) throw new ConflictApiError("برای این کسب‌وکار و سرویس یک اشتراک باز وجود دارد.");
  const startsAt = parseStart(body.startsAt);
  const endsAt = periodEnd(startsAt, plan.billingPeriod, plan.customDurationDays);
  const subscriptionId = crypto.randomUUID();
  const queueProvisioning = status !== SubscriptionStatus.PENDING;
  await prisma.$transaction(async (tx) => {
    await tx.businessService.upsert({
      where: { businessId_serviceId: { businessId, serviceId: plan.serviceId } },
      update: {},
      create: { businessId, serviceId: plan.serviceId, status: BusinessServiceStatus.SETUP },
    });
    await tx.subscription.create({
      data: {
        id: subscriptionId, businessId, serviceId: plan.serviceId, planId: plan.id, status,
        provisioningStatus: queueProvisioning ? ProvisioningStatus.QUEUED : ProvisioningStatus.NOT_STARTED,
        planCodeSnapshot: plan.code, planNameSnapshot: plan.name, billingPeriod: plan.billingPeriod,
        customDurationDays: plan.customDurationDays, priceAmount: plan.priceAmount, currency: plan.currency,
        startsAt, currentPeriodStartsAt: startsAt, currentPeriodEndsAt: endsAt,
        trialEndsAt: status === SubscriptionStatus.TRIALING ? new Date(Math.min(endsAt.getTime(), startsAt.getTime() + plan.trialDays * 86400000)) : null,
        autoRenew: false, metadata: { source: "admin-manual", paymentVerified: false },
      },
    });
    if (queueProvisioning) await tx.provisioningJob.create({ data: { subscriptionId, businessId, serviceId: plan.serviceId, action: ProvisioningAction.ACTIVATE, idempotencyKey: `admin:create:${subscriptionId}`, payload: { source: "admin-manual", paymentVerified: false } } });
  });
  await getAuditRepository().create({ actorUserId: user.id, action: "subscription_created", targetType: "subscription", targetId: subscriptionId, metadata: { businessId, serviceId: plan.serviceId, planId: plan.id, status: body.status } });

  await sendToN8n(
    createAutomationPayload(
      AutomationEvents.SUBSCRIPTION_CREATED,
      {
        subscriptionId,
        businessId,
        serviceId: plan.serviceId,
        planId: plan.id,
        status: body.status,
      }
    )
  );

  return getSubscriptionRepository().findById(subscriptionId);
}

export async function renewAdminSubscription(user: AuthUser, subscriptionId: string) {
  requireAdminPermission(user, "admin.subscriptions.manage");
  const prisma = getPrismaClient();
  const current = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!current) throw new NotFoundApiError("اشتراک پیدا نشد.");
  if (current.status !== SubscriptionStatus.ACTIVE && current.status !== SubscriptionStatus.PAST_DUE && current.status !== SubscriptionStatus.PAUSED) throw new ConflictApiError("این اشتراک در وضعیت قابل تمدید نیست.");
  const startsAt = current.currentPeriodEndsAt && current.currentPeriodEndsAt > new Date() ? current.currentPeriodEndsAt : new Date();
  const endsAt = periodEnd(startsAt, current.billingPeriod, current.customDurationDays);
  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({ where: { id: subscriptionId }, data: { status: SubscriptionStatus.ACTIVE, provisioningStatus: ProvisioningStatus.QUEUED, currentPeriodStartsAt: startsAt, currentPeriodEndsAt: endsAt, canceledAt: null, endedAt: null } });
    await tx.provisioningJob.create({ data: { subscriptionId, businessId: current.businessId, serviceId: current.serviceId, action: ProvisioningAction.UPDATE, idempotencyKey: `admin:renew:${subscriptionId}:${endsAt.toISOString()}`, payload: { source: "admin-manual", paymentVerified: false } } });
  });
  await getAuditRepository().create({ actorUserId: user.id, action: "subscription_renewed", targetType: "subscription", targetId: subscriptionId, metadata: { businessId: current.businessId, serviceId: current.serviceId, previousEnd: current.currentPeriodEndsAt?.toISOString() ?? null, newEnd: endsAt.toISOString() } });
  return getSubscriptionRepository().findById(subscriptionId);
}

export async function changeAdminSubscriptionPlan(user: AuthUser, subscriptionId: string, planId: unknown) {
  requireAdminPermission(user, "admin.subscriptions.manage");
  if (typeof planId !== "string" || !UUID_PATTERN.test(planId)) throw new ValidationApiError("پلن انتخاب‌شده معتبر نیست.");
  const prisma = getPrismaClient();
  const [current, plan] = await Promise.all([prisma.subscription.findUnique({ where: { id: subscriptionId } }), prisma.servicePlan.findUnique({ where: { id: planId } })]);
  if (!current) throw new NotFoundApiError("اشتراک پیدا نشد.");
  if (!plan || plan.status !== PlanStatus.ACTIVE || plan.serviceId !== current.serviceId) throw new ValidationApiError("پلن فعال متعلق به همین سرویس پیدا نشد.");
  if (current.status === SubscriptionStatus.CANCELED || current.status === SubscriptionStatus.EXPIRED) throw new ConflictApiError("پلن اشتراک بسته‌شده قابل تغییر نیست.");
  if (current.planId === plan.id) throw new ConflictApiError("اشتراک هم‌اکنون روی همین پلن قرار دارد.");
  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({ where: { id: subscriptionId }, data: { planId: plan.id, planCodeSnapshot: plan.code, planNameSnapshot: plan.name, billingPeriod: plan.billingPeriod, customDurationDays: plan.customDurationDays, priceAmount: plan.priceAmount, currency: plan.currency, provisioningStatus: ProvisioningStatus.QUEUED } });
    await tx.provisioningJob.create({ data: { subscriptionId, businessId: current.businessId, serviceId: current.serviceId, action: ProvisioningAction.UPDATE, idempotencyKey: `admin:plan:${subscriptionId}:${plan.id}:${crypto.randomUUID()}`, payload: { source: "admin-manual", beforePlanId: current.planId, afterPlanId: plan.id } } });
  });
  await getAuditRepository().create({ actorUserId: user.id, action: "subscription_plan_changed", targetType: "subscription", targetId: subscriptionId, metadata: { businessId: current.businessId, serviceId: current.serviceId, beforePlanId: current.planId, afterPlanId: plan.id } });
  return getSubscriptionRepository().findById(subscriptionId);
}

const statuses = new Set<SubscriptionStatusValue>(["pending", "trialing", "active", "past-due", "paused", "canceled", "expired"]);

export async function searchAdminSubscriptions(user: AuthUser, input: SubscriptionSearchInput) {
  requireAdminPermission(user, "admin.subscriptions.read");
  return getSubscriptionRepository().search(input);
}

export async function transitionAdminSubscription(user: AuthUser, subscriptionId: string, operation: unknown) {
  requireAdminPermission(user, "admin.subscriptions.manage");
  if (operation !== "pause" && operation !== "resume" && operation !== "cancel") {
    throw new ValidationApiError("عملیات اشتراک معتبر نیست.");
  }
  const repository = getSubscriptionRepository();
  const before = await repository.findById(subscriptionId);
  if (!before) throw new NotFoundApiError("اشتراک پیدا نشد.");

  const allowed = operation === "pause"
    ? new Set<SubscriptionStatusValue>(["active", "trialing", "past-due"])
    : operation === "resume"
      ? new Set<SubscriptionStatusValue>(["paused"])
      : new Set<SubscriptionStatusValue>(["pending", "trialing", "active", "past-due", "paused"]);
  if (!allowed.has(before.status)) throw new ConflictApiError("این عملیات با وضعیت فعلی اشتراک سازگار نیست.");

  const next: SubscriptionStatusValue = operation === "pause" ? "paused" : operation === "resume" ? "active" : "canceled";
  const action = operation === "pause" ? "suspend" : operation === "resume" ? "activate" : "cancel";
  const updated = await repository.transitionStatus(subscriptionId, before.status, next, action);
  if (!updated) throw new ConflictApiError("وضعیت اشتراک هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کنید.");

  await getAuditRepository().create({
    actorUserId: user.id,
    action: operation === "pause" ? "subscription_paused" : operation === "resume" ? "subscription_resumed" : "subscription_canceled",
    targetType: "subscription",
    targetId: subscriptionId,
    metadata: { businessId: before.businessId, serviceId: before.serviceId, beforeStatus: before.status, afterStatus: updated.status },
  });
  return updated;
}

export function validateSubscriptionStatus(value: string): value is SubscriptionStatusValue {
  return statuses.has(value as SubscriptionStatusValue);
}
