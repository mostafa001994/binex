export type ProvisioningJobStatusValue = "pending" | "processing" | "succeeded" | "failed" | "canceled";
export type ProvisioningActionValue = "activate" | "update" | "suspend" | "cancel";

export type AdminProvisioningJob = {
  id: string;
  subscriptionId: string;
  businessId: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  action: ProvisioningActionValue;
  status: ProvisioningJobStatusValue;
  subscriptionStatus: "pending" | "trialing" | "active" | "past-due" | "paused" | "canceled" | "expired";
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  lockedAt: string | null;
  n8nExecutionId: string | null;
  lastError: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProvisioningSearchInput = {
  search?: string;
  status?: ProvisioningJobStatusValue | "";
  action?: ProvisioningActionValue | "";
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

export interface ProvisioningRepository {
  search(input: ProvisioningSearchInput): Promise<{
    items: AdminProvisioningJob[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }>;
  findById(id: string): Promise<AdminProvisioningJob | null>;
  retryFailed(id: string, expectedUpdatedAt: string): Promise<AdminProvisioningJob | null>;
}
