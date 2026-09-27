import type { BusinessServiceRepository } from "@/server/repositories/contracts/business-service-repository";
import { getMockBusinessStore } from "@/server/repositories/mock/mock-business-store";
import type { BusinessService } from "@/server/business/business-types";

export class MockBusinessServiceRepository
  implements BusinessServiceRepository
{
  async listByBusinessId(businessId: string) {
    return getMockBusinessStore().services.filter(
      (item) => item.businessId === businessId,
    );
  }

  async create(
    input: Omit<BusinessService, "id" | "createdAt">,
  ) {
    const existing =
      getMockBusinessStore().services.find(
        (item) =>
          item.businessId === input.businessId &&
          item.serviceId === input.serviceId,
      ) ?? null;

    if (existing) return existing;

    const service: BusinessService = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    getMockBusinessStore().services.push(service);
    return service;
  }

  async updateStatus(
    businessId: string,
    serviceId: BusinessService["serviceId"],
    status: BusinessService["status"],
  ) {
    const service =
      getMockBusinessStore().services.find(
        (item) =>
          item.businessId === businessId &&
          item.serviceId === serviceId,
      ) ?? null;

    if (!service) return null;

    service.status = status;
    service.setupCompleted = status === "active";
    return service;
  }

  async delete(
    businessId: string,
    serviceId: BusinessService["serviceId"],
  ) {
    const store = getMockBusinessStore();
    const index = store.services.findIndex(
      (item) =>
        item.businessId === businessId &&
        item.serviceId === serviceId,
    );

    if (index < 0) return false;

    store.services.splice(index, 1);
    return true;
  }
}
