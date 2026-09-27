import type { AdminSubscriptionRecord, SubscriptionRepository, SubscriptionStatusValue } from "@/server/repositories/contracts/subscription-repository";

const items: AdminSubscriptionRecord[] = [];
export class MockSubscriptionRepository implements SubscriptionRepository {
  async search(input: Parameters<SubscriptionRepository["search"]>[0]) {
    const filtered = items.filter((item) => (!input.status || item.status === input.status) && (!input.serviceId || item.serviceId === input.serviceId));
    return { items: filtered, pagination: { page: 1, pageSize: input.pageSize || 20, total: filtered.length, totalPages: 1 } };
  }
  async findById(id: string) { return items.find((item) => item.id === id) ?? null; }
  async listForBusiness(businessId: string) {
    return items.filter((item) => item.businessId === businessId);
  }
  async findForBusiness(businessId: string, id: string) {
    return items.find((item) => item.id === id && item.businessId === businessId) ?? null;
  }
  async transitionStatus(id: string, expected: SubscriptionStatusValue, status: SubscriptionStatusValue) {
    const item = items.find((entry) => entry.id === id);
    if (!item || item.status !== expected) return null;
    item.status = status; item.provisioningStatus = "queued"; item.updatedAt = new Date().toISOString(); return item;
  }
}
