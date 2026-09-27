import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { ConflictApiError, NotFoundApiError } from "@/server/core/api-error";
import { getAuditRepository, getProvisioningRepository } from "@/server/repositories/repository-provider";
import type { ProvisioningActionValue, ProvisioningJobStatusValue, ProvisioningSearchInput } from "@/server/repositories/contracts/provisioning-repository";
import { AutomationConnectorStatus } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import { dispatchProvisioningJob } from "@/server/automation/provisioning-dispatcher";

const statuses = new Set<ProvisioningJobStatusValue>(["pending", "processing", "succeeded", "failed", "canceled"]);
const actions = new Set<ProvisioningActionValue>(["activate", "update", "suspend", "cancel"]);

export function searchAdminProvisioningJobs(user: AuthUser, input: ProvisioningSearchInput) {
  requireAdminPermission(user, "admin.provisioning.read");
  return getProvisioningRepository().search(input);
}
export async function retryAdminProvisioningJob(user: AuthUser, jobId: string) {
  requireAdminPermission(user, "admin.provisioning.manage");
  const repository = getProvisioningRepository();
  const before = await repository.findById(jobId);
  if (!before) throw new NotFoundApiError("کار راه‌اندازی پیدا نشد.");
  if (before.status !== "failed") throw new ConflictApiError("فقط کار ناموفق را می‌توان دوباره در صف قرار داد.");
  const connector = await getPrismaClient().automationConnector.findUnique({ where: { serviceId: before.serviceId } });
  if (!connector?.endpointEncrypted || connector.status !== AutomationConnectorStatus.ACTIVE) {
    throw new ConflictApiError("اتصال n8n این سرویس هنوز فعال و آماده نیست؛ ابتدا آن را در مرکز اتوماسیون پیکربندی کنید.");
  }
  const updated = await repository.retryFailed(jobId, before.updatedAt);
  if (!updated) throw new ConflictApiError("وضعیت کار هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کنید.");
  await getAuditRepository().create({
    actorUserId: user.id, action: "provisioning_job_retried", targetType: "provisioning-job", targetId: jobId,
    metadata: { businessId: before.businessId, serviceId: before.serviceId, subscriptionId: before.subscriptionId, attemptCount: before.attemptCount },
  });

  await dispatchProvisioningJob(jobId);

  return updated;
}
export function validateProvisioningStatus(value: string): value is ProvisioningJobStatusValue { return statuses.has(value as ProvisioningJobStatusValue); }
export function validateProvisioningAction(value: string): value is ProvisioningActionValue { return actions.has(value as ProvisioningActionValue); }
