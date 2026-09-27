import crypto from "node:crypto";
import {
  BillingPeriod,
  BusinessStatus,
  CustomServiceOfferStatus,
  CustomServiceSubscriptionStatus,
  CustomServiceStatus,
  OrderItemType,
  OrderStatus,
  PaymentStatus,
  type Prisma,
} from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { requireBusinessActive } from "@/server/business/business-access";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import {
  ConflictApiError,
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { startPayment } from "@/server/payments/payment-service";
import { fulfillPaidOrder } from "@/server/payments/payment-fulfillment-service";
import { sendNotification } from "@/server/notifications/notification-engine";
import { createDatabaseAuditLog } from "@/server/repositories/database/database-audit-repository";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown, label: string, max: number, min = 1) {
  const result = String(value ?? "").trim();
  if (result.length < min || result.length > max)
    throw new ValidationApiError(`${label} باید بین ${min} تا ${max} کاراکتر باشد.`);
  return result;
}

function optionalText(value: unknown, label: string, max: number) {
  const result = String(value ?? "").trim();
  if (!result) return null;
  if (result.length > max) throw new ValidationApiError(`${label} بیش از حد طولانی است.`);
  return result;
}

function appHref(value: unknown) {
  const result = optionalText(value, "مسیر ورود", 255);
  if (!result) return null;
  if (!result.startsWith("/app/") || result.startsWith("//") || result.includes("://"))
    throw new ValidationApiError("مسیر ورود باید یک مسیر داخلی و با /app/ شروع شود.");
  return result;
}

function features(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 30);
}

function price(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw) || BigInt(raw) <= 0n)
    throw new ValidationApiError("مبلغ پیشنهاد باید عدد صحیح مثبت و برحسب ریال باشد.");
  return BigInt(raw);
}

function period(value: unknown, customDaysValue: unknown) {
  const billingPeriod = value === "quarterly"
    ? BillingPeriod.QUARTERLY
    : value === "yearly"
      ? BillingPeriod.YEARLY
      : value === "custom"
        ? BillingPeriod.CUSTOM
        : BillingPeriod.MONTHLY;
  const customDurationDays = billingPeriod === BillingPeriod.CUSTOM
    ? Number(customDaysValue)
    : null;
  if (billingPeriod === BillingPeriod.CUSTOM && (!Number.isInteger(customDurationDays) || customDurationDays! < 1 || customDurationDays! > 3650))
    throw new ValidationApiError("مدت سفارشی باید بین ۱ تا ۳۶۵۰ روز باشد.");
  return { billingPeriod, customDurationDays };
}

function endDate(start: Date, billingPeriod: BillingPeriod, customDurationDays: number | null) {
  const end = new Date(start);
  const addMonths = (months: number) => {
    const day = end.getUTCDate();
    end.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + months);
    const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
    end.setUTCDate(Math.min(day, lastDay));
  };
  if (billingPeriod === BillingPeriod.MONTHLY) addMonths(1);
  else if (billingPeriod === BillingPeriod.QUARTERLY) addMonths(3);
  else if (billingPeriod === BillingPeriod.YEARLY) addMonths(12);
  else end.setUTCDate(end.getUTCDate() + (customDurationDays ?? 0));
  return end;
}

const serviceInclude = { _count: { select: { offers: true, subscriptions: true } } } as const;
const offerInclude = {
  customService: true,
  business: { select: { id: true, name: true } },
  subscription: true,
} as const;

function mapService<T extends { createdAt: Date; updatedAt: Date; features: Prisma.JsonValue }>(item: T) {
  return {
    ...item,
    features: Array.isArray(item.features) ? item.features.map(String) : [],
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapOffer<T extends {
  priceAmount: bigint;
  features: Prisma.JsonValue;
  validUntil: Date;
  sentAt: Date | null;
  paidAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscription?: { startsAt: Date; endsAt: Date } | null;
}>(item: T) {
  return {
    ...item,
    priceAmount: item.priceAmount.toString(),
    features: Array.isArray(item.features) ? item.features.map(String) : [],
    validUntil: item.validUntil.toISOString(),
    sentAt: item.sentAt?.toISOString() ?? null,
    paidAt: item.paidAt?.toISOString() ?? null,
    canceledAt: item.canceledAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    subscription: item.subscription
      ? {
          id: (item.subscription as { id?: string }).id,
          status: (item.subscription as { status?: string }).status,
          startsAt: item.subscription.startsAt.toISOString(),
          endsAt: item.subscription.endsAt.toISOString(),
        }
      : item.subscription,
  };
}

export async function runCustomServiceMaintenance() {
  const prisma = getPrismaClient();
  const now = new Date();
  const expiringOffers = await prisma.customServiceOffer.findMany({
    where: { status: { in: [CustomServiceOfferStatus.SENT, CustomServiceOfferStatus.PAYMENT_PENDING] }, validUntil: { lt: now } },
    select: { id: true, createdByUserId: true },
  });
  for (const offer of expiringOffers) {
    await prisma.$transaction(async (tx) => {
      const changed = await tx.customServiceOffer.updateMany({
        where: { id: offer.id, status: { in: [CustomServiceOfferStatus.SENT, CustomServiceOfferStatus.PAYMENT_PENDING] } },
        data: { status: CustomServiceOfferStatus.EXPIRED },
      });
      if (changed.count) await createDatabaseAuditLog(tx, { actorUserId: offer.createdByUserId, action: "custom_service_offer_expired", targetType: "custom-service-offer", targetId: offer.id, metadata: { expiredAt: now.toISOString() } });
    });
  }
  const endedSubscriptions = await prisma.customServiceSubscription.findMany({
    where: { status: CustomServiceSubscriptionStatus.ACTIVE, endsAt: { lte: now } },
    include: { offer: { select: { createdByUserId: true } } },
  });
  for (const subscription of endedSubscriptions) {
    await prisma.$transaction(async (tx) => {
      const changed = await tx.customServiceSubscription.updateMany({ where: { id: subscription.id, status: CustomServiceSubscriptionStatus.ACTIVE }, data: { status: CustomServiceSubscriptionStatus.ENDED, endedAt: now } });
      if (changed.count) await createDatabaseAuditLog(tx, { actorUserId: subscription.offer.createdByUserId, action: "custom_service_subscription_ended", targetType: "custom-service-subscription", targetId: subscription.id, metadata: { reason: "period-ended", endsAt: subscription.endsAt.toISOString() } });
    });
  }
  const paidWithoutSubscription = await prisma.order.findMany({
    where: { status: OrderStatus.PAID, items: { some: { type: OrderItemType.CUSTOM_SERVICE, customSubscriptionId: null } } },
    select: { id: true }, take: 25,
  });
  for (const order of paidWithoutSubscription) {
    try { await fulfillPaidOrder(order.id); } catch (error) { console.error("custom service payment reconciliation failed", { orderId: order.id, error }); }
  }
  return { expiredOffers: expiringOffers.length, endedSubscriptions: endedSubscriptions.length, reconciledOrders: paidWithoutSubscription.length };
}

async function expireOffers() { await runCustomServiceMaintenance(); }

export async function listAdminCustomServices(user: AuthUser) {
  requireAdminPermission(user, "admin.custom-services.read");
  const services = await getPrismaClient().customService.findMany({ include: serviceInclude, orderBy: { createdAt: "desc" } });
  return { services: services.map(mapService) };
}

export async function createAdminCustomService(user: AuthUser, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.custom-services.manage");
  const status = body.status === "active" ? CustomServiceStatus.ACTIVE : CustomServiceStatus.DRAFT;
  const service = await getPrismaClient().$transaction(async (tx) => {
    const created = await tx.customService.create({
      data: {
        name: text(body.name, "نام سرویس", 120, 2),
        shortName: text(body.shortName || body.name, "نام کوتاه", 80, 2),
        description: text(body.description, "توضیحات", 3000, 10),
        features: features(body.features),
        appHref: appHref(body.appHref),
        accent: text(body.accent || "#078BFF", "رنگ", 40),
        iconKey: text(body.iconKey || "sparkles", "آیکن", 80),
        status,
      },
      include: serviceInclude,
    });
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "custom_service_created",
      targetType: "custom-service",
      targetId: created.id,
      metadata: { name: created.name, status: created.status.toLowerCase() },
    });
    return created;
  });
  return mapService(service);
}

export async function updateAdminCustomService(user: AuthUser, id: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.custom-services.manage");
  if (!UUID.test(id)) throw new NotFoundApiError("سرویس اختصاصی پیدا نشد.");
  const prisma = getPrismaClient();
  const before = await prisma.customService.findUnique({ where: { id } });
  if (!before) throw new NotFoundApiError("سرویس اختصاصی پیدا نشد.");
  const status = body.status === "active" ? CustomServiceStatus.ACTIVE : body.status === "archived" ? CustomServiceStatus.ARCHIVED : CustomServiceStatus.DRAFT;
  const service = await prisma.$transaction(async (tx) => {
    const updated = await tx.customService.update({
      where: { id },
      data: {
        name: text(body.name, "نام سرویس", 120, 2),
        shortName: text(body.shortName || body.name, "نام کوتاه", 80, 2),
        description: text(body.description, "توضیحات", 3000, 10),
        features: features(body.features),
        appHref: appHref(body.appHref),
        accent: text(body.accent || "#078BFF", "رنگ", 40),
        iconKey: text(body.iconKey || "sparkles", "آیکن", 80),
        status,
      },
      include: serviceInclude,
    });
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "custom_service_updated",
      targetType: "custom-service",
      targetId: id,
      metadata: { beforeStatus: before.status.toLowerCase(), afterStatus: updated.status.toLowerCase(), name: updated.name },
    });
    return updated;
  });
  return mapService(service);
}

export async function listAdminCustomOffers(user: AuthUser) {
  requireAdminPermission(user, "admin.custom-services.read");
  await expireOffers();
  const prisma = getPrismaClient();
  const [offers, businesses, services, subscriptions] = await Promise.all([
    prisma.customServiceOffer.findMany({ include: offerInclude, orderBy: { createdAt: "desc" } }),
    prisma.business.findMany({ where: { status: BusinessStatus.ACTIVE }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.customService.findMany({ where: { status: CustomServiceStatus.ACTIVE }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.customServiceSubscription.findMany({ include: { customService: true, business: { select: { id: true, name: true } }, offer: { select: { title: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return { offers: offers.map(mapOffer), businesses, services, subscriptions: subscriptions.map((item) => ({ ...item, priceAmount: item.priceAmount.toString(), startsAt: item.startsAt.toISOString(), endsAt: item.endsAt.toISOString(), pausedAt: item.pausedAt?.toISOString() ?? null, endedAt: item.endedAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() })) };
}

export async function createAdminCustomOffer(user: AuthUser, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.custom-services.manage");
  const customServiceId = String(body.customServiceId ?? "");
  const businessId = String(body.businessId ?? "");
  if (!UUID.test(customServiceId) || !UUID.test(businessId)) throw new ValidationApiError("سرویس یا کسب‌وکار معتبر نیست.");
  const { billingPeriod, customDurationDays } = period(body.billingPeriod, body.customDurationDays);
  const validUntil = new Date(String(body.validUntil ?? ""));
  if (!Number.isFinite(validUntil.getTime()) || validUntil <= new Date()) throw new ValidationApiError("مهلت پرداخت باید در آینده باشد.");
  const prisma = getPrismaClient();
  const [service, business] = await Promise.all([
    prisma.customService.findUnique({ where: { id: customServiceId } }),
    prisma.business.findUnique({ where: { id: businessId } }),
  ]);
  if (!service || service.status !== CustomServiceStatus.ACTIVE) throw new ValidationApiError("سرویس اختصاصی فعال پیدا نشد.");
  if (!business || business.status !== BusinessStatus.ACTIVE) throw new ValidationApiError("کسب‌وکار فعال پیدا نشد.");
  const offer = await prisma.$transaction(async (tx) => {
    const created = await tx.customServiceOffer.create({
      data: {
        customServiceId,
        businessId,
        createdByUserId: user.id,
        title: text(body.title, "عنوان پیشنهاد", 160, 2),
        description: text(body.description, "توضیحات پیشنهاد", 4000, 10),
        terms: optionalText(body.terms, "شرایط", 4000),
        features: features(body.features).length ? features(body.features) : (Array.isArray(service.features) ? service.features : []),
        priceAmount: price(body.priceAmount),
        billingPeriod,
        customDurationDays,
        validUntil,
      },
      include: offerInclude,
    });
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "custom_service_offer_created",
      targetType: "custom-service-offer",
      targetId: created.id,
      metadata: { businessId, customServiceId, title: created.title, priceAmount: created.priceAmount.toString() },
    });
    return created;
  });
  return mapOffer(offer);
}

export async function transitionAdminCustomOffer(user: AuthUser, id: string, operation: unknown) {
  requireAdminPermission(user, "admin.custom-services.manage");
  if (!UUID.test(id)) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
  if (operation !== "send" && operation !== "cancel") throw new ValidationApiError("عملیات پیشنهاد معتبر نیست.");
  const prisma = getPrismaClient();
  const offer = await prisma.customServiceOffer.findUnique({ where: { id }, include: { customService: true } });
  if (!offer) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
  if (operation === "send") {
    if (offer.status !== CustomServiceOfferStatus.DRAFT) throw new ConflictApiError("فقط پیشنهاد پیش‌نویس قابل ارسال است.");
    if (offer.customService.status !== CustomServiceStatus.ACTIVE || offer.validUntil <= new Date()) throw new ConflictApiError("سرویس باید فعال و مهلت پیشنهاد معتبر باشد.");
  } else if (offer.status !== CustomServiceOfferStatus.DRAFT && offer.status !== CustomServiceOfferStatus.SENT && offer.status !== CustomServiceOfferStatus.PAYMENT_PENDING) {
    throw new ConflictApiError("این پیشنهاد دیگر قابل لغو نیست.");
  }
  const next = operation === "send" ? CustomServiceOfferStatus.SENT : CustomServiceOfferStatus.CANCELED;
  const updated = await prisma.$transaction(async (tx) => {
    if (operation === "cancel" && offer.status === CustomServiceOfferStatus.PAYMENT_PENDING) {
      const pendingOrders = await tx.orderItem.findMany({ where: { customServiceOfferId: id, order: { status: OrderStatus.PENDING_PAYMENT } }, select: { orderId: true } });
      const orderIds = pendingOrders.map((item) => item.orderId);
      if (orderIds.length) {
        await tx.payment.updateMany({ where: { orderId: { in: orderIds }, status: { in: [PaymentStatus.INITIATED, PaymentStatus.PENDING] } }, data: { status: PaymentStatus.CANCELED, failureCode: "ADMIN_CANCELED", failureMessage: "پیشنهاد توسط مدیر لغو شد." } });
        await tx.order.updateMany({ where: { id: { in: orderIds }, status: OrderStatus.PENDING_PAYMENT }, data: { status: OrderStatus.CANCELED, canceledAt: new Date() } });
      }
    }
    const item = await tx.customServiceOffer.update({
      where: { id },
      data: operation === "send" ? { status: next, sentAt: new Date() } : { status: next, canceledAt: new Date() },
      include: offerInclude,
    });
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: operation === "send" ? "custom_service_offer_sent" : "custom_service_offer_canceled",
      targetType: "custom-service-offer",
      targetId: id,
      metadata: { businessId: offer.businessId, customServiceId: offer.customServiceId },
    });
    return item;
  });
  if (operation === "send") {
    const owner = await prisma.businessMember.findFirst({ where: { businessId: offer.businessId, role: "OWNER" }, include: { user: { select: { phone: true, name: true } } } });
    if (owner?.user.phone) {
      try {
        await sendNotification({ eventKey: "custom-service.offer-sent", channel: "sms", receiver: owner.user.phone, referenceId: offer.id, referenceType: "custom-service-offer", data: { user_name: owner.user.name ?? "", offer_title: offer.title, business_name: updated.business.name, app_name: "BINIX" } });
      } catch (error) { console.error("custom service offer notification failed", { offerId: offer.id, error }); }
    }
  }
  return mapOffer(updated);
}

export async function updateAdminCustomOffer(user: AuthUser, id: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.custom-services.manage");
  if (!UUID.test(id)) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
  const prisma = getPrismaClient();
  const existing = await prisma.customServiceOffer.findUnique({ where: { id }, include: { customService: true } });
  if (!existing) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
  if (existing.status !== CustomServiceOfferStatus.DRAFT) throw new ConflictApiError("فقط پیشنهاد پیش‌نویس قابل ویرایش است.");
  const expectedVersion = Number(body.version);
  if (!Number.isInteger(expectedVersion) || expectedVersion !== existing.version) throw new ConflictApiError("پیشنهاد توسط کاربر دیگری تغییر کرده است؛ صفحه را تازه‌سازی کنید.");
  const { billingPeriod, customDurationDays } = period(body.billingPeriod, body.customDurationDays);
  const validUntil = new Date(String(body.validUntil ?? ""));
  if (!Number.isFinite(validUntil.getTime()) || validUntil <= new Date()) throw new ValidationApiError("مهلت پرداخت باید در آینده باشد.");
  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.customServiceOffer.updateMany({
      where: { id, version: expectedVersion, status: CustomServiceOfferStatus.DRAFT },
      data: { title: text(body.title, "عنوان پیشنهاد", 160, 2), description: text(body.description, "توضیحات پیشنهاد", 4000, 10), terms: optionalText(body.terms, "شرایط", 4000), features: features(body.features).length ? features(body.features) : (Array.isArray(existing.customService.features) ? existing.customService.features : []), priceAmount: price(body.priceAmount), billingPeriod, customDurationDays, validUntil, version: { increment: 1 } },
    });
    if (!changed.count) throw new ConflictApiError("پیشنهاد تغییر کرده است؛ صفحه را تازه‌سازی کنید.");
    const item = await tx.customServiceOffer.findUniqueOrThrow({ where: { id }, include: offerInclude });
    await createDatabaseAuditLog(tx, { actorUserId: user.id, action: "custom_service_offer_updated", targetType: "custom-service-offer", targetId: id, metadata: { version: item.version, priceAmount: item.priceAmount.toString() } });
    return item;
  });
  return mapOffer(updated);
}

export async function transitionAdminCustomSubscription(user: AuthUser, id: string, body: Record<string, unknown>) {
  requireAdminPermission(user, "admin.custom-services.manage");
  if (!UUID.test(id)) throw new NotFoundApiError("اشتراک اختصاصی پیدا نشد.");
  const operation = String(body.operation ?? "");
  if (!["pause", "resume", "end", "extend"].includes(operation)) throw new ValidationApiError("عملیات اشتراک معتبر نیست.");
  const prisma = getPrismaClient();
  const existing = await prisma.customServiceSubscription.findUnique({ where: { id } });
  if (!existing) throw new NotFoundApiError("اشتراک اختصاصی پیدا نشد.");
  const now = new Date();
  let data: Prisma.CustomServiceSubscriptionUpdateInput;
  let action: "custom_service_subscription_paused" | "custom_service_subscription_resumed" | "custom_service_subscription_ended" | "custom_service_subscription_extended";
  if (operation === "pause") {
    if (existing.status !== CustomServiceSubscriptionStatus.ACTIVE) throw new ConflictApiError("فقط اشتراک فعال قابل توقف است.");
    data = { status: CustomServiceSubscriptionStatus.PAUSED, pausedAt: now }; action = "custom_service_subscription_paused";
  } else if (operation === "resume") {
    if (existing.status !== CustomServiceSubscriptionStatus.PAUSED) throw new ConflictApiError("فقط اشتراک متوقف قابل ادامه است.");
    data = { status: CustomServiceSubscriptionStatus.ACTIVE, pausedAt: null, endedAt: null, endsAt: existing.endsAt <= now ? new Date(now.getTime() + 86400000) : existing.endsAt }; action = "custom_service_subscription_resumed";
  } else if (operation === "end") {
    if (existing.status === CustomServiceSubscriptionStatus.ENDED) throw new ConflictApiError("اشتراک قبلاً پایان یافته است.");
    data = { status: CustomServiceSubscriptionStatus.ENDED, endedAt: now, endsAt: existing.endsAt > now ? now : existing.endsAt }; action = "custom_service_subscription_ended";
  } else {
    const days = Number(body.days);
    if (!Number.isInteger(days) || days < 1 || days > 3650) throw new ValidationApiError("تعداد روز تمدید باید بین ۱ تا ۳۶۵۰ باشد.");
    const base = existing.endsAt > now ? existing.endsAt : now;
    const endsAt = new Date(base); endsAt.setUTCDate(endsAt.getUTCDate() + days);
    data = { status: CustomServiceSubscriptionStatus.ACTIVE, endsAt, endedAt: null, pausedAt: null }; action = "custom_service_subscription_extended";
  }
  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.customServiceSubscription.update({ where: { id }, data, include: { customService: true, business: { select: { id: true, name: true } }, offer: { select: { title: true } } } });
    await createDatabaseAuditLog(tx, { actorUserId: user.id, action, targetType: "custom-service-subscription", targetId: id, metadata: { previousStatus: existing.status.toLowerCase(), status: item.status.toLowerCase(), previousEndsAt: existing.endsAt.toISOString(), endsAt: item.endsAt.toISOString() } });
    return item;
  });
  return { ...updated, priceAmount: updated.priceAmount.toString(), startsAt: updated.startsAt.toISOString(), endsAt: updated.endsAt.toISOString(), pausedAt: updated.pausedAt?.toISOString() ?? null, endedAt: updated.endedAt?.toISOString() ?? null, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() };
}

async function customerContext(user: AuthUser) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  return { context, isOwner: context.membership.role === "owner" };
}

export async function listCustomerCustomServices(user: AuthUser) {
  await expireOffers();
  const { context, isOwner } = await customerContext(user);
  const prisma = getPrismaClient();
  const [offers, subscriptions] = await Promise.all([
    isOwner
      ? prisma.customServiceOffer.findMany({
          where: { businessId: context.business.id, status: { not: CustomServiceOfferStatus.DRAFT } },
          include: offerInclude,
          orderBy: { createdAt: "desc" },
        })
      : [],
    prisma.customServiceSubscription.findMany({
      where: { businessId: context.business.id },
      include: { customService: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    access: { role: context.membership.role, canPay: isOwner },
    offers: offers.map(mapOffer),
    subscriptions: subscriptions.map((item) => ({
      ...item,
      priceAmount: item.priceAmount.toString(),
      features: Array.isArray(item.featuresSnapshot) ? item.featuresSnapshot.map(String) : [],
      startsAt: item.startsAt.toISOString(),
      endsAt: item.endsAt.toISOString(),
      pausedAt: item.pausedAt?.toISOString() ?? null,
      endedAt: item.endedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  };
}

export async function getCustomerCustomOffer(user: AuthUser, id: string) {
  if (!UUID.test(id)) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
  await expireOffers();
  const { context, isOwner } = await customerContext(user);
  if (!isOwner) throw new ForbiddenApiError("فقط مالک کسب‌وکار می‌تواند پیشنهاد مالی را مشاهده کند.");
  const offer = await getPrismaClient().customServiceOffer.findFirst({ where: { id, businessId: context.business.id }, include: offerInclude });
  if (!offer || offer.status === CustomServiceOfferStatus.DRAFT || offer.status === CustomServiceOfferStatus.CANCELED || offer.status === CustomServiceOfferStatus.EXPIRED)
    throw new NotFoundApiError("پیشنهاد اختصاصی فعال پیدا نشد.");
  return mapOffer(offer);
}

export async function createCustomServiceCheckout(input: { user: AuthUser; offerId: string; gatewayId: string; callbackUrl: string; termsAccepted: boolean }) {
  if (!UUID.test(input.offerId)) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
  const { context, isOwner } = await customerContext(input.user);
  if (!isOwner) throw new ForbiddenApiError("فقط مالک کسب‌وکار می‌تواند پیشنهاد را پرداخت کند.");
  const prisma = getPrismaClient();
  if (!input.termsAccepted) throw new ValidationApiError("برای ادامه پرداخت باید شرایط پیشنهاد را تأیید کنید.");

  const orderId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM custom_service_offers WHERE id = ${input.offerId}::uuid FOR UPDATE`;
    const offer = await tx.customServiceOffer.findFirst({ where: { id: input.offerId, businessId: context.business.id }, include: { customService: true, subscription: true } });
    if (!offer) throw new NotFoundApiError("پیشنهاد اختصاصی پیدا نشد.");
    if (offer.subscription || offer.status === CustomServiceOfferStatus.PAID) throw new ConflictApiError("این پیشنهاد قبلاً پرداخت شده است.");
    if ((offer.status !== CustomServiceOfferStatus.SENT && offer.status !== CustomServiceOfferStatus.PAYMENT_PENDING) || offer.validUntil <= new Date()) throw new ConflictApiError("این پیشنهاد در وضعیت قابل پرداخت نیست.");
    if (offer.customService.status !== CustomServiceStatus.ACTIVE) throw new ConflictApiError("سرویس اختصاصی در حال حاضر فعال نیست.");
    const pendingOrder = await tx.orderItem.findFirst({ where: { customServiceOfferId: offer.id, order: { status: OrderStatus.PENDING_PAYMENT } }, select: { orderId: true } });
    if (pendingOrder) throw new ConflictApiError("یک پرداخت برای این پیشنهاد در حال انجام است. نتیجه همان پرداخت را مشخص کنید یا کمی بعد دوباره تلاش کنید.");
    await tx.order.create({
      data: {
        id: orderId,
        orderNumber: `BX-C-${Date.now()}-${crypto.randomInt(100, 999)}`,
        businessId: context.business.id,
        createdByUserId: input.user.id,
        status: OrderStatus.PENDING_PAYMENT,
        currency: offer.currency,
        subtotalAmount: offer.priceAmount,
        totalAmount: offer.priceAmount,
        expiresAt: offer.validUntil,
        metadata: { kind: "custom-service", offerId: offer.id, termsAcceptedAt: new Date().toISOString() },
      },
    });
    await tx.orderItem.create({
      data: {
        orderId,
        type: OrderItemType.CUSTOM_SERVICE,
        customServiceOfferId: offer.id,
        serviceNameSnapshot: offer.customService.name,
        planCodeSnapshot: `custom-${offer.id}`,
        planNameSnapshot: offer.title,
        billingPeriodSnapshot: offer.billingPeriod,
        customDurationDays: offer.customDurationDays,
        unitAmount: offer.priceAmount,
        totalAmount: offer.priceAmount,
        metadata: { kind: "custom-service", offerId: offer.id },
      },
    });
    await tx.payment.create({
      data: {
        id: paymentId,
        orderId,
        provider: "pending",
        idempotencyKey: `custom-checkout-${paymentId}`,
        amount: offer.priceAmount,
        currency: offer.currency,
        status: PaymentStatus.INITIATED,
      },
    });
    await tx.customServiceOffer.update({ where: { id: offer.id }, data: { status: CustomServiceOfferStatus.PAYMENT_PENDING, termsAcceptedAt: new Date() } });
  });
  try {
    return await startPayment({ paymentId, gatewayId: input.gatewayId, callbackUrl: input.callbackUrl });
  } catch (error) {
    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: PaymentStatus.FAILED, failedAt: new Date(), failureCode: "PAYMENT_START_FAILED", failureMessage: error instanceof Error ? error.message.slice(0, 500) : "شروع پرداخت ناموفق بود." } }),
      prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.PAYMENT_FAILED } }),
      prisma.customServiceOffer.updateMany({ where: { id: input.offerId, status: CustomServiceOfferStatus.PAYMENT_PENDING }, data: { status: CustomServiceOfferStatus.SENT } }),
    ]);
    throw error;
  }
}

export async function releaseCustomServiceOfferAfterFailedPayment(orderId: string) {
  const prisma = getPrismaClient();
  const item = await prisma.orderItem.findFirst({
    where: { orderId, type: OrderItemType.CUSTOM_SERVICE, customServiceOfferId: { not: null } },
    select: { customServiceOfferId: true },
  });
  if (!item?.customServiceOfferId) return;
  await prisma.customServiceOffer.updateMany({
    where: { id: item.customServiceOfferId, status: CustomServiceOfferStatus.PAYMENT_PENDING, subscription: null },
    data: { status: CustomServiceOfferStatus.SENT },
  });
}

export { endDate as calculateCustomServiceEndDate };
