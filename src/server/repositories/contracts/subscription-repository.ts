export type SubscriptionStatusValue = "pending" | "trialing" | "active" | "past-due" | "paused" | "canceled" | "expired";

export type AdminSubscriptionRecord = {
  id: string;
  businessId: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  planId: string;
  planName: string;
  status: SubscriptionStatusValue;
  provisioningStatus: "not-started" | "queued" | "in-progress" | "ready" | "failed";
  billingPeriod: "monthly" | "quarterly" | "yearly" | "custom";
  priceAmount: string;
  currency: string;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionSearchInput = {
  search?: string;
  status?: SubscriptionStatusValue | "";
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

export interface SubscriptionRepository {
  search(input: SubscriptionSearchInput): Promise<{ items: AdminSubscriptionRecord[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>;
  findById(id: string): Promise<AdminSubscriptionRecord | null>;
  listForBusiness(businessId: string): Promise<AdminSubscriptionRecord[]>;
  findForBusiness(businessId: string, id: string): Promise<AdminSubscriptionRecord | null>;
  transitionStatus(id: string, expected: SubscriptionStatusValue, status: SubscriptionStatusValue, action: "activate" | "suspend" | "cancel"): Promise<AdminSubscriptionRecord | null>;
}
