import {
  BusinessServiceStatus as DatabaseServiceStatus,
  type BusinessService as DatabaseBusinessService,
} from "@/generated/prisma/client";
import type {
  BusinessService,
  BusinessServiceStatus,
} from "@/server/business/business-types";
import { getPrismaClient } from "@/server/db/prisma";
import type { BusinessServiceRepository } from "@/server/repositories/contracts/business-service-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toServiceStatus(
  status: DatabaseServiceStatus,
): BusinessServiceStatus {
  switch (status) {
    case DatabaseServiceStatus.SETUP:
      return "setup";

    case DatabaseServiceStatus.ACTIVE:
      return "active";

    case DatabaseServiceStatus.PAUSED:
      return "paused";

    case DatabaseServiceStatus.COMING_SOON:
      return "coming-soon";
  }
}

function toDatabaseStatus(
  status: BusinessServiceStatus,
): DatabaseServiceStatus {
  switch (status) {
    case "setup":
      return DatabaseServiceStatus.SETUP;

    case "active":
      return DatabaseServiceStatus.ACTIVE;

    case "paused":
      return DatabaseServiceStatus.PAUSED;

    case "coming-soon":
      return DatabaseServiceStatus.COMING_SOON;
  }
}

function toBusinessService(
  service: DatabaseBusinessService,
): BusinessService {
  return {
    id: service.id,
    businessId: service.businessId,
    serviceId: service.serviceId,
    status: toServiceStatus(service.status),
    setupCompleted: service.setupCompleted,
    createdAt: service.createdAt.toISOString(),
  };
}

export class DatabaseBusinessServiceRepository
  implements BusinessServiceRepository
{
  async listByBusinessId(
    businessId: string,
  ): Promise<BusinessService[]> {
    if (!UUID_PATTERN.test(businessId)) {
      return [];
    }

    const services =
      await getPrismaClient().businessService.findMany({
        where: {
          businessId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return services.map(toBusinessService);
  }

  async create(
    input: Omit<BusinessService, "id" | "createdAt">,
  ): Promise<BusinessService> {
    const service =
      await getPrismaClient().businessService.upsert({
        where: {
          businessId_serviceId: {
            businessId: input.businessId,
            serviceId: input.serviceId,
          },
        },
        update: {},
        create: {
          businessId: input.businessId,
          serviceId: input.serviceId,
          status: toDatabaseStatus(input.status),
          setupCompleted: input.setupCompleted,
        },
      });

    return toBusinessService(service);
  }

  async updateStatus(
    businessId: string,
    serviceId: BusinessService["serviceId"],
    status: BusinessService["status"],
  ): Promise<BusinessService | null> {
    if (!UUID_PATTERN.test(businessId)) {
      return null;
    }

    const result =
      await getPrismaClient().businessService.updateMany({
        where: {
          businessId,
          serviceId,
        },
        data: {
          status: toDatabaseStatus(status),
          setupCompleted: status === "active",
        },
      });

    if (result.count === 0) {
      return null;
    }

    const service =
      await getPrismaClient().businessService.findUnique({
        where: {
          businessId_serviceId: {
            businessId,
            serviceId,
          },
        },
      });

    return service
      ? toBusinessService(service)
      : null;
  }

  async delete(
    businessId: string,
    serviceId: BusinessService["serviceId"],
  ): Promise<boolean> {
    if (!UUID_PATTERN.test(businessId)) {
      return false;
    }

    const result =
      await getPrismaClient().businessService.deleteMany({
        where: {
          businessId,
          serviceId,
        },
      });

    return result.count > 0;
  }
}