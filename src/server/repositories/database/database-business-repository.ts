import {
  BusinessStatus as DatabaseBusinessStatus,
  type Business as DatabaseBusiness,
} from "@/generated/prisma/client";
import type {
  Business,
  BusinessStatus,
} from "@/server/business/business-types";
import { getPrismaClient } from "@/server/db/prisma";
import type { BusinessRepository } from "@/server/repositories/contracts/business-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toBusinessStatus(
  status: DatabaseBusinessStatus,
): BusinessStatus {
  if (status === DatabaseBusinessStatus.ACTIVE) return "active";
  if (status === DatabaseBusinessStatus.ARCHIVED) return "archived";
  return "suspended";
}

function toDatabaseStatus(
  status: BusinessStatus,
): DatabaseBusinessStatus {
  if (status === "active") return DatabaseBusinessStatus.ACTIVE;
  if (status === "archived") return DatabaseBusinessStatus.ARCHIVED;
  return DatabaseBusinessStatus.SUSPENDED;
}

function toBusiness(
  business: DatabaseBusiness,
): Business {
  return {
    id: business.id,
    name: business.name,
    phone: business.phone,
    category: business.category,
    status: toBusinessStatus(business.status),
    archivedAt: business.archivedAt?.toISOString() ?? null,
    createdAt: business.createdAt.toISOString(),
  };
}

export class DatabaseBusinessRepository
  implements BusinessRepository
{
  async findById(id: string, options: { includeArchived?: boolean } = {}): Promise<Business | null> {
    if (!UUID_PATTERN.test(id)) {
      return null;
    }

    const business =
      await getPrismaClient().business.findFirst({
        where: {
          id,
          ...(options.includeArchived ? {} : { status: { not: DatabaseBusinessStatus.ARCHIVED } }),
        },
      });

    return business
      ? toBusiness(business)
      : null;
  }

  async create(input: {
    name: string;
    phone?: string | null;
    category?: string | null;
  }): Promise<Business> {
    const business =
      await getPrismaClient().business.create({
        data: {
          name: input.name,
          phone: input.phone ?? null,
          category: input.category ?? null,
          status: DatabaseBusinessStatus.ACTIVE,
        },
      });

    return toBusiness(business);
  }

  async update(
    id: string,
    input: {
      name?: string;
      phone?: string | null;
      category?: string | null;
      status?: BusinessStatus;
    },
  ): Promise<Business | null> {
    if (!UUID_PATTERN.test(id)) {
      return null;
    }

    const data: {
      name?: string;
      phone?: string | null;
      category?: string | null;
      status?: DatabaseBusinessStatus;
      archivedAt?: Date | null;
    } = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.phone !== undefined) {
      data.phone = input.phone;
    }

    if (input.category !== undefined) {
      data.category = input.category;
    }

    if (input.status !== undefined) {
      data.status = toDatabaseStatus(input.status);
      data.archivedAt = input.status === "archived" ? new Date() : null;
    }

    const result =
      await getPrismaClient().business.updateMany({
        where: {
          id,
        },
        data,
      });

    if (result.count === 0) {
      return null;
    }

    return this.findById(id, { includeArchived: true });
  }

  async list(options: { includeArchived?: boolean } = {}): Promise<Business[]> {
    const businesses =
      await getPrismaClient().business.findMany({
        where: options.includeArchived ? {} : { status: { not: DatabaseBusinessStatus.ARCHIVED } },
        orderBy: {
          createdAt: "desc",
        },
      });

    return businesses.map(toBusiness);
  }
}
