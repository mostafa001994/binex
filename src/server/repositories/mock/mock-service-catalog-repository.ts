import type {
  CreateServiceDefinitionInput,
  ServiceCatalogRepository,
  UpdateServiceDefinitionInput,
} from "@/server/repositories/contracts/service-catalog-repository";
import type {
  ServiceId,
} from "@/server/services/service-types";
import {
  getMockServiceCatalogStore,
  persistMockServiceCatalogStore,
} from "@/server/repositories/mock/mock-service-catalog-store";

function sorted() {
  return [
    ...getMockServiceCatalogStore(),
  ].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.createdAt.localeCompare(
        b.createdAt,
      ),
  );
}

export class MockServiceCatalogRepository
  implements ServiceCatalogRepository
{
  async list() {
    return sorted();
  }

  async findById(id: ServiceId) {
    return (
      getMockServiceCatalogStore().find(
        (service) =>
          service.id === id,
      ) ?? null
    );
  }

  async findBySlug(slug: string) {
    return (
      getMockServiceCatalogStore().find(
        (service) =>
          service.slug === slug,
      ) ?? null
    );
  }

  async create(
    input: CreateServiceDefinitionInput,
  ) {
    const timestamp =
      new Date().toISOString();

    const service = {
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    getMockServiceCatalogStore().push(
      service,
    );
    persistMockServiceCatalogStore();

    return service;
  }

  async update(
    id: ServiceId,
    input: UpdateServiceDefinitionInput,
  ) {
    const service =
      await this.findById(id);

    if (!service) return null;

    Object.assign(service, input, {
      updatedAt:
        new Date().toISOString(),
    });

    persistMockServiceCatalogStore();
    return service;
  }

  async delete(id: ServiceId) {
    const store =
      getMockServiceCatalogStore();
    const index = store.findIndex(
      (service) =>
        service.id === id,
    );

    if (index < 0) return false;

    store.splice(index, 1);
    persistMockServiceCatalogStore();

    return true;
  }
}
