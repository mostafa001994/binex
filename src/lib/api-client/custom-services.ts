type ApiEnvelope<T> = { success: true; data: T } | { success: false; error?: { message?: string } };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    ...init,
  });
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) throw new Error(payload && !payload.success ? payload.error?.message || "انجام درخواست ناموفق بود." : "پاسخ سرور معتبر نیست.");
  return payload.data;
}

export type CustomService = {
  id: string; name: string; shortName: string; description: string; features: string[];
  appHref: string | null; accent: string; iconKey: string; status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdAt: string; updatedAt: string; _count?: { offers: number; subscriptions: number };
};

export type CustomOffer = {
  id: string; customServiceId: string; businessId: string; title: string; description: string; terms: string | null;
  features: string[]; priceAmount: string; currency: string; billingPeriod: "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM";
  customDurationDays: number | null; validUntil: string; status: "DRAFT" | "SENT" | "PAYMENT_PENDING" | "PAID" | "EXPIRED" | "CANCELED";
  sentAt: string | null; paidAt: string | null; canceledAt: string | null; termsAcceptedAt: string | null; version: number; createdAt: string; updatedAt: string;
  customService: CustomService; business: { id: string; name: string };
  subscription?: { id: string; startsAt: string; endsAt: string; status: "ACTIVE" | "PAUSED" | "ENDED" } | null;
};

export type CustomSubscription = {
  id: string; customServiceId: string; status: "ACTIVE" | "PAUSED" | "ENDED"; serviceNameSnapshot: string;
  offerTitleSnapshot: string; descriptionSnapshot: string; priceAmount: string; currency: string;
  billingPeriod: CustomOffer["billingPeriod"]; customDurationDays: number | null; startsAt: string; endsAt: string;
  pausedAt: string | null; endedAt: string | null; customService: CustomService; features: string[];
  business?: { id: string; name: string }; offer?: { title: string };
};

export const getAdminCustomServicesApi = () => request<{ services: CustomService[] }>("/api/v1/admin/custom-services");
export const createAdminCustomServiceApi = (body: unknown) => request<{ service: CustomService }>("/api/v1/admin/custom-services", { method: "POST", body: JSON.stringify(body) });
export const updateAdminCustomServiceApi = (id: string, body: unknown) => request<{ service: CustomService }>(`/api/v1/admin/custom-services/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const getAdminCustomOffersApi = () => request<{ offers: CustomOffer[]; businesses: Array<{ id: string; name: string }>; services: Array<{ id: string; name: string }>; subscriptions: CustomSubscription[] }>("/api/v1/admin/custom-services/offers");
export const createAdminCustomOfferApi = (body: unknown) => request<{ offer: CustomOffer }>("/api/v1/admin/custom-services/offers", { method: "POST", body: JSON.stringify(body) });
export const updateAdminCustomOfferApi = (id: string, body: Record<string, unknown>) => request<{ offer: CustomOffer }>(`/api/v1/admin/custom-services/offers/${id}`, { method: "PATCH", body: JSON.stringify({ operation: "update", ...body }) });
export const transitionAdminCustomOfferApi = (id: string, operation: "send" | "cancel") => request<{ offer: CustomOffer }>(`/api/v1/admin/custom-services/offers/${id}`, { method: "PATCH", body: JSON.stringify({ operation }) });
export const transitionAdminCustomSubscriptionApi = (id: string, operation: "pause" | "resume" | "end" | "extend", days?: number) => request<{ subscription: CustomSubscription }>(`/api/v1/admin/custom-services/subscriptions/${id}`, { method: "PATCH", body: JSON.stringify({ operation, days }) });
export const getCustomerCustomServicesApi = () => request<{ access: { role: string; canPay: boolean }; offers: CustomOffer[]; subscriptions: CustomSubscription[] }>("/api/v1/custom-services");
export const getCustomerCustomOfferApi = (id: string) => request<{ offer: CustomOffer }>(`/api/v1/custom-services/${id}`);
export const checkoutCustomServiceApi = (id: string, gatewayId: string, termsAccepted: boolean) => request<{ checkout: { paymentUrl: string; authority: string } }>(`/api/v1/custom-services/${id}/checkout`, { method: "POST", body: JSON.stringify({ gatewayId, termsAccepted }) });
