import type { AdminProvisioningJob, ProvisioningRepository } from "@/server/repositories/contracts/provisioning-repository";

const jobs: AdminProvisioningJob[] = [];
export class MockProvisioningRepository implements ProvisioningRepository {
  async search(input: Parameters<ProvisioningRepository["search"]>[0]) {
    const filtered = jobs.filter((job) => (!input.status || job.status === input.status) && (!input.action || job.action === input.action) && (!input.serviceId || job.serviceId === input.serviceId));
    return { items: filtered, pagination: { page: 1, pageSize: input.pageSize || 20, total: filtered.length, totalPages: 1 } };
  }
  async findById(id: string) { return jobs.find((job) => job.id === id) ?? null; }
  async retryFailed(id: string, expectedUpdatedAt: string) {
    const job = jobs.find((item) => item.id === id && item.status === "failed" && item.updatedAt === expectedUpdatedAt);
    if (!job) return null;
    job.status = "pending"; job.lastError = null; job.nextAttemptAt = new Date().toISOString(); job.updatedAt = new Date().toISOString();
    return job;
  }
}
