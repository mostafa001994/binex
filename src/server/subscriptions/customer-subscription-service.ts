import { requireBusinessActive } from "@/server/business/business-access";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import { ForbiddenApiError, NotFoundApiError } from "@/server/core/api-error";
import type { AdminSubscriptionRecord } from "@/server/repositories/contracts/subscription-repository";
import { getSubscriptionRepository } from "@/server/repositories/repository-provider";

export type CustomerSubscriptionLifecycle =
  | "pending"
  | "trial"
  | "setup-required"
  | "provisioning"
  | "active"
  | "payment-required"
  | "setup-failed"
  | "paused"
  | "ended";

export type CustomerSubscriptionNextAction =
  | "wait-for-activation"
  | "complete-setup"
  | "wait-for-provisioning"
  | "resolve-payment"
  | "contact-support"
  | "none";

export type CustomerSubscription = {
  id: string;
  service: { id: string; name: string };
  plan: { id: string; name: string };
  status: AdminSubscriptionRecord["status"];
  provisioningStatus: AdminSubscriptionRecord["provisioningStatus"];
  lifecycleStatus: CustomerSubscriptionLifecycle;
  nextAction: CustomerSubscriptionNextAction;
  billing: {
    period: AdminSubscriptionRecord["billingPeriod"];
    priceAmount: string;
    currency: string;
    autoRenew: boolean;
    cancelAtPeriodEnd: boolean;
  };
  period: {
    startsAt: string | null;
    endsAt: string | null;
    trialEndsAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

type AuthenticatedBusinessUser = { id: string; phone: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireSubscriptionOwner(role: "owner" | "admin" | "member") {
  if (role !== "owner") {
    throw new ForbiddenApiError(
      "فقط مالک کسب‌وکار می‌تواند اطلاعات اشتراک و مالی را مشاهده کند.",
    );
  }
}

export function getCustomerSubscriptionLifecycle(record: AdminSubscriptionRecord): {
  status: CustomerSubscriptionLifecycle;
  nextAction: CustomerSubscriptionNextAction;
} {
  if (record.status === "canceled" || record.status === "expired") {
    return { status: "ended", nextAction: "none" };
  }

  if (record.status === "paused") {
    return { status: "paused", nextAction: "contact-support" };
  }

  if (record.status === "past-due") {
    return { status: "payment-required", nextAction: "resolve-payment" };
  }

  if (record.provisioningStatus === "failed") {
    return { status: "setup-failed", nextAction: "contact-support" };
  }

  if (
    record.provisioningStatus === "queued" ||
    record.provisioningStatus === "in-progress"
  ) {
    return { status: "provisioning", nextAction: "wait-for-provisioning" };
  }

  if (
    record.provisioningStatus === "not-started" &&
    (record.status === "active" || record.status === "trialing")
  ) {
    return { status: "setup-required", nextAction: "complete-setup" };
  }

  if (record.status === "trialing") {
    return { status: "trial", nextAction: "none" };
  }

  if (record.status === "active") {
    return { status: "active", nextAction: "none" };
  }

  return { status: "pending", nextAction: "wait-for-activation" };
}

function toCustomerSubscription(record: AdminSubscriptionRecord): CustomerSubscription {
  const state = getCustomerSubscriptionLifecycle(record);

  return {
    id: record.id,
    service: { id: record.serviceId, name: record.serviceName },
    plan: { id: record.planId, name: record.planName },
    status: record.status,
    provisioningStatus: record.provisioningStatus,
    lifecycleStatus: state.status,
    nextAction: state.nextAction,
    billing: {
      period: record.billingPeriod,
      priceAmount: record.priceAmount,
      currency: record.currency,
      autoRenew: record.autoRenew,
      cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    },
    period: {
      startsAt: record.currentPeriodStartsAt,
      endsAt: record.currentPeriodEndsAt,
      trialEndsAt: record.trialEndsAt,
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function ownerBusinessContext(user: AuthenticatedBusinessUser) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  requireSubscriptionOwner(context.membership.role);
  return context;
}

export async function listCustomerSubscriptions(user: AuthenticatedBusinessUser) {
  const context = await ownerBusinessContext(user);
  const records = await getSubscriptionRepository().listForBusiness(
    context.business.id,
  );
  const subscriptions = records.map(toCustomerSubscription);

  return {
    subscriptions,
    summary: {
      total: subscriptions.length,
      active: subscriptions.filter((item) =>
        item.lifecycleStatus === "active" || item.lifecycleStatus === "trial"
      ).length,
      needsAttention: subscriptions.filter((item) =>
        item.lifecycleStatus === "setup-required" ||
        item.lifecycleStatus === "payment-required" ||
        item.lifecycleStatus === "setup-failed"
      ).length,
    },
  };
}

export async function getCustomerSubscription(
  user: AuthenticatedBusinessUser,
  subscriptionId: string,
) {
  const context = await ownerBusinessContext(user);

  if (!UUID_PATTERN.test(subscriptionId)) {
    throw new NotFoundApiError("اشتراک موردنظر پیدا نشد.");
  }

  const record = await getSubscriptionRepository().findForBusiness(
    context.business.id,
    subscriptionId,
  );

  if (!record) {
    throw new NotFoundApiError("اشتراک موردنظر پیدا نشد.");
  }

  return toCustomerSubscription(record);
}
