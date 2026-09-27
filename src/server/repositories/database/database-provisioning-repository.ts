import { Prisma, ProvisioningAction, ProvisioningJobStatus, ProvisioningStatus, type ProvisioningJob } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type { AdminProvisioningJob, ProvisioningActionValue, ProvisioningJobStatusValue, ProvisioningRepository } from "@/server/repositories/contracts/provisioning-repository";

const statusToDb: Record<ProvisioningJobStatusValue, ProvisioningJobStatus> = {
  pending: ProvisioningJobStatus.PENDING, processing: ProvisioningJobStatus.PROCESSING,
  succeeded: ProvisioningJobStatus.SUCCEEDED, failed: ProvisioningJobStatus.FAILED, canceled: ProvisioningJobStatus.CANCELED,
};
const actionToDb: Record<ProvisioningActionValue, ProvisioningAction> = {
  activate: ProvisioningAction.ACTIVATE, update: ProvisioningAction.UPDATE,
  suspend: ProvisioningAction.SUSPEND, cancel: ProvisioningAction.CANCEL,
};
const include = {
  business: { select: { name: true } },
  service: { select: { name: true } },
  subscription: { select: { status: true } },
} as const;
type WithRelations = ProvisioningJob & {
  business: { name: string };
  service: { name: string };
  subscription: { status: string };
};

function kebab(value: string) { return value.toLowerCase().replaceAll("_", "-"); }
function safeError(value: string | null) {
  if (!value) return null;
  return value
    .replace(/(token|password|authorization|secret|api[-_]?key)(\s*[:=]\s*)([^\s,;]+)/gi, "$1$2***")
    .slice(0, 500);
}
function record(job: WithRelations): AdminProvisioningJob {
  return {
    id: job.id, subscriptionId: job.subscriptionId,
    businessId: job.businessId, businessName: job.business.name,
    serviceId: job.serviceId, serviceName: job.service.name,
    action: kebab(job.action) as ProvisioningActionValue,
    status: kebab(job.status) as ProvisioningJobStatusValue,
    subscriptionStatus: kebab(job.subscription.status) as AdminProvisioningJob["subscriptionStatus"],
    attemptCount: job.attemptCount, maxAttempts: job.maxAttempts,
    nextAttemptAt: job.nextAttemptAt?.toISOString() ?? null,
    lockedAt: job.lockedAt?.toISOString() ?? null,
    n8nExecutionId: job.n8nExecutionId,
    lastError: safeError(job.lastError), completedAt: job.completedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(), updatedAt: job.updatedAt.toISOString(),
  };
}

export class DatabaseProvisioningRepository implements ProvisioningRepository {
  async search(input: Parameters<ProvisioningRepository["search"]>[0]) {
    const page = Math.max(1, Math.floor(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize || 20)));
    const query = input.search?.trim();
    const where: Prisma.ProvisioningJobWhereInput = {
      status: input.status ? statusToDb[input.status] : undefined,
      action: input.action ? actionToDb[input.action] : undefined,
      serviceId: input.serviceId || undefined,
      OR: query ? [
        { business: { name: { contains: query, mode: "insensitive" } } },
        { service: { name: { contains: query, mode: "insensitive" } } },
        { n8nExecutionId: { contains: query, mode: "insensitive" } },
      ] : undefined,
    };
    const prisma = getPrismaClient();
    const total = await prisma.provisioningJob.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const items = await prisma.provisioningJob.findMany({ where, include, orderBy: { createdAt: "desc" }, skip: (safePage - 1) * pageSize, take: pageSize });
    return { items: items.map((item) => record(item)), pagination: { page: safePage, pageSize, total, totalPages } };
  }

  async findById(id: string) {
    const item = await getPrismaClient().provisioningJob.findUnique({ where: { id }, include });
    return item ? record(item) : null;
  }

  async retryFailed(id: string, expectedUpdatedAt: string) {
    return getPrismaClient().$transaction(async (tx) => {
      const current = await tx.provisioningJob.findUnique({ where: { id }, select: { attemptCount: true, maxAttempts: true, subscriptionId: true } });
      if (!current) return null;
      const changed = await tx.provisioningJob.updateMany({
        where: { id, status: ProvisioningJobStatus.FAILED, updatedAt: new Date(expectedUpdatedAt) },
        data: {
          status: ProvisioningJobStatus.PENDING,
          maxAttempts: Math.max(current.maxAttempts, current.attemptCount + 1),
          nextAttemptAt: new Date(), lockedAt: null, n8nExecutionId: null,
          lastError: null, completedAt: null,
        },
      });
      if (!changed.count) return null;
      await tx.subscription.update({ where: { id: current.subscriptionId }, data: { provisioningStatus: ProvisioningStatus.QUEUED } });
      const item = await tx.provisioningJob.findUniqueOrThrow({ where: { id }, include });
      return record(item);
    });
  }
}
