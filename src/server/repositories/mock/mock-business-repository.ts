import type { BusinessRepository } from "@/server/repositories/contracts/business-repository";
import { getMockBusinessStore } from "@/server/repositories/mock/mock-business-store";

export class MockBusinessRepository
  implements BusinessRepository
{
  async findById(id: string, options: { includeArchived?: boolean } = {}) {
    return (
      getMockBusinessStore().businesses.find(
        (item) => item.id === id && (options.includeArchived || item.status !== "archived"),
      ) ?? null
    );
  }

  async create(input: {
    name: string;
    phone?: string | null;
    category?: string | null;
  }) {
    const business = {
      id: crypto.randomUUID(),
      name: input.name,
      phone: input.phone ?? null,
      category: input.category ?? null,
      status: "active" as const,
      archivedAt: null,
      createdAt: new Date().toISOString(),
    };

    getMockBusinessStore().businesses.push(business);
    return business;
  }

  async update(
    id: string,
    input: {
      name?: string;
      phone?: string | null;
      category?: string | null;
      status?: "active" | "suspended" | "archived";
    },
  ) {
    const business =
      getMockBusinessStore().businesses.find(
        (item) => item.id === id,
      ) ?? null;

    if (!business) return null;

    if (typeof input.name === "string") {
      business.name = input.name;
    }

    if ("phone" in input) {
      business.phone = input.phone ?? null;
    }

    if ("category" in input) {
      business.category = input.category ?? null;
    }

    if (input.status) {
      business.status = input.status;
      business.archivedAt = input.status === "archived" ? new Date().toISOString() : null;
    }

    return business;
  }

  async list(options: { includeArchived?: boolean } = {}) {
    return getMockBusinessStore().businesses.filter(
      (item) => options.includeArchived || item.status !== "archived",
    );
  }
}
