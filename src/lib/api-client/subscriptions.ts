type ApiErrorPayload = {
  success: false;
  error: { code: string; message: string };
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

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

export type CustomerSubscriptionApiItem = {
  id: string;
  service: { id: string; name: string };
  plan: { id: string; name: string };
  status: "pending" | "trialing" | "active" | "past-due" | "paused" | "canceled" | "expired";
  provisioningStatus: "not-started" | "queued" | "in-progress" | "ready" | "failed";
  lifecycleStatus: CustomerSubscriptionLifecycle;
  nextAction: CustomerSubscriptionNextAction;
  billing: {
    period: "monthly" | "quarterly" | "yearly" | "custom";
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

export type CustomerSubscriptionsResponse = {
  subscriptions: CustomerSubscriptionApiItem[];
  summary: { total: number; active: number; needsAttention: number };
};

async function getJson<T>(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;

  if (!response.ok || !payload.success) {
    throw new Error(
      (payload as ApiErrorPayload).error?.message ||
        "اطلاعات اشتراک قابل دریافت نیست.",
    );
  }

  return payload.data;
}

export function getCustomerSubscriptionsApi() {
  return getJson<CustomerSubscriptionsResponse>("/api/v1/subscriptions");
}

export function getCustomerSubscriptionApi(subscriptionId: string) {
  return getJson<{ subscription: CustomerSubscriptionApiItem }>(
    `/api/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
}
