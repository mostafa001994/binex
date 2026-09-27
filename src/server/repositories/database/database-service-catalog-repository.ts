import {
  Prisma,
  ServiceAvailability as DatabaseAvailability,
  ServiceCatalogStatus as DatabaseCatalogStatus,
  ServiceVisibility as DatabaseVisibility,
  type ServiceDefinition as DatabaseServiceDefinition,
} from "@/generated/prisma/client";
import type {
  CreateServiceDefinitionInput,
  ServiceCatalogRepository,
  UpdateServiceDefinitionInput,
} from "@/server/repositories/contracts/service-catalog-repository";
import { getPrismaClient } from "@/server/db/prisma";
import type {
  ServiceAvailability,
  ServiceCatalogStatus,
  ServiceDefinition,
  ServiceId,
  ServiceVisibility,
} from "@/server/services/service-types";
import { normalizeServiceMarketingContent } from "@/types/service-marketing";

function toAvailability(
  value: DatabaseAvailability,
): ServiceAvailability {
  return value === DatabaseAvailability.AVAILABLE
    ? "available"
    : "coming-soon";
}

function toDatabaseAvailability(
  value: ServiceAvailability,
): DatabaseAvailability {
  return value === "available"
    ? DatabaseAvailability.AVAILABLE
    : DatabaseAvailability.COMING_SOON;
}

function toCatalogStatus(
  value: DatabaseCatalogStatus,
): ServiceCatalogStatus {
  switch (value) {
    case DatabaseCatalogStatus.DRAFT:
      return "draft";

    case DatabaseCatalogStatus.ACTIVE:
      return "active";

    case DatabaseCatalogStatus.DISABLED:
      return "disabled";
  }
}

function toDatabaseCatalogStatus(
  value: ServiceCatalogStatus,
): DatabaseCatalogStatus {
  switch (value) {
    case "draft":
      return DatabaseCatalogStatus.DRAFT;

    case "active":
      return DatabaseCatalogStatus.ACTIVE;

    case "disabled":
      return DatabaseCatalogStatus.DISABLED;
  }
}

function toVisibility(
  value: DatabaseVisibility,
): ServiceVisibility {
  return value === DatabaseVisibility.PUBLIC
    ? "public"
    : "private";
}

function toDatabaseVisibility(
  value: ServiceVisibility,
): DatabaseVisibility {
  return value === "public"
    ? DatabaseVisibility.PUBLIC
    : DatabaseVisibility.PRIVATE;
}

function toFeatures(
  value: Prisma.JsonValue,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function toServiceDefinition(
  service: DatabaseServiceDefinition,
): ServiceDefinition {
  const features = toFeatures(service.features);

  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortName: service.shortName,
    category: service.category,
    description: service.description,
    appHref: service.appHref,
    marketingHref: service.marketingHref,
    availability: toAvailability(
      service.availability,
    ),
    status: toCatalogStatus(service.status),
    visibility: toVisibility(
      service.visibility,
    ),
    accent: service.accent,
    iconKey:
      service.iconKey as ServiceDefinition["iconKey"],
    sortOrder: service.sortOrder,
    features,
    marketingContent: normalizeServiceMarketingContent(
      service.marketingContent,
      {
        name: service.name,
        category: service.category,
        description: service.description,
        features,
      },
    ),
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

export class DatabaseServiceCatalogRepository
  implements ServiceCatalogRepository
{
  async list(): Promise<ServiceDefinition[]> {
    const services =
      await getPrismaClient().serviceDefinition.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    return services.map(toServiceDefinition);
  }

  async findById(
    id: ServiceId,
  ): Promise<ServiceDefinition | null> {
    const service =
      await getPrismaClient().serviceDefinition.findUnique({
        where: { id },
      });

    return service
      ? toServiceDefinition(service)
      : null;
  }

  async findBySlug(
    slug: string,
  ): Promise<ServiceDefinition | null> {
    const service =
      await getPrismaClient().serviceDefinition.findUnique({
        where: { slug },
      });

    return service
      ? toServiceDefinition(service)
      : null;
  }

  async create(
    input: CreateServiceDefinitionInput,
  ): Promise<ServiceDefinition> {
    const service =
      await getPrismaClient().serviceDefinition.create({
        data: {
          id: input.id,
          slug: input.slug,
          name: input.name,
          shortName: input.shortName,
          category: input.category,
          description: input.description,
          appHref: input.appHref,
          marketingHref: input.marketingHref,
          availability:
            toDatabaseAvailability(
              input.availability,
            ),
          status:
            toDatabaseCatalogStatus(
              input.status,
            ),
          visibility:
            toDatabaseVisibility(
              input.visibility,
            ),
          accent: input.accent,
          iconKey: input.iconKey,
          sortOrder: input.sortOrder,
          features: input.features,
          marketingContent: input.marketingContent as Prisma.InputJsonValue,
        },
      });

    return toServiceDefinition(service);
  }

  async update(
    id: ServiceId,
    input: UpdateServiceDefinitionInput,
  ): Promise<ServiceDefinition | null> {
    const data: Prisma.ServiceDefinitionUpdateInput =
      {};

    if (input.slug !== undefined) {
      data.slug = input.slug;
    }

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.shortName !== undefined) {
      data.shortName = input.shortName;
    }

    if (input.category !== undefined) {
      data.category = input.category;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.appHref !== undefined) {
      data.appHref = input.appHref;
    }

    if (input.marketingHref !== undefined) {
      data.marketingHref =
        input.marketingHref;
    }

    if (input.availability !== undefined) {
      data.availability =
        toDatabaseAvailability(
          input.availability,
        );
    }

    if (input.status !== undefined) {
      data.status =
        toDatabaseCatalogStatus(
          input.status,
        );
    }

    if (input.visibility !== undefined) {
      data.visibility =
        toDatabaseVisibility(
          input.visibility,
        );
    }

    if (input.accent !== undefined) {
      data.accent = input.accent;
    }

    if (input.iconKey !== undefined) {
      data.iconKey = input.iconKey;
    }

    if (input.sortOrder !== undefined) {
      data.sortOrder = input.sortOrder;
    }

    if (input.features !== undefined) {
      data.features = input.features;
    }

    if (input.marketingContent !== undefined) {
      data.marketingContent = input.marketingContent as Prisma.InputJsonValue;
    }

    const result =
      await getPrismaClient()
        .serviceDefinition
        .updateMany({
          where: { id },
          data,
        });

    if (result.count === 0) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: ServiceId): Promise<boolean> {
    const result =
      await getPrismaClient()
        .serviceDefinition
        .deleteMany({
          where: { id },
        });

    return result.count > 0;
  }
}
