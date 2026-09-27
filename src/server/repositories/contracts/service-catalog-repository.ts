import type {
  ServiceDefinition,
  ServiceId,
} from "@/server/services/service-types";

export type CreateServiceDefinitionInput =
  Omit<
    ServiceDefinition,
    "createdAt" | "updatedAt"
  >;

export type UpdateServiceDefinitionInput =
  Partial<
    Omit<
      ServiceDefinition,
      "id" | "createdAt" | "updatedAt"
    >
  >;

export interface ServiceCatalogRepository {
  list(): Promise<ServiceDefinition[]>;

  findById(
    id: ServiceId,
  ): Promise<ServiceDefinition | null>;

  findBySlug(
    slug: string,
  ): Promise<ServiceDefinition | null>;

  create(
    input: CreateServiceDefinitionInput,
  ): Promise<ServiceDefinition>;

  update(
    id: ServiceId,
    input: UpdateServiceDefinitionInput,
  ): Promise<ServiceDefinition | null>;

  delete(
    id: ServiceId,
  ): Promise<boolean>;
}
