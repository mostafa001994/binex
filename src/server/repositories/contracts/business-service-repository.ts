import type { BusinessService } from "@/server/business/business-types";

export interface BusinessServiceRepository {
  listByBusinessId(
    businessId: string,
  ): Promise<BusinessService[]>;

  create(
    input: Omit<BusinessService, "id" | "createdAt">,
  ): Promise<BusinessService>;

  updateStatus(
    businessId: string,
    serviceId: BusinessService["serviceId"],
    status: BusinessService["status"],
  ): Promise<BusinessService | null>;

  delete(
    businessId: string,
    serviceId: BusinessService["serviceId"],
  ): Promise<boolean>;
}
