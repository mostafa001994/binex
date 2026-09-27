import {
  BusinessMemberRole as DatabaseMemberRole,
  type BusinessMember as DatabaseBusinessMember,
} from "@/generated/prisma/client";
import type {
  BusinessMember,
  BusinessMemberRole,
} from "@/server/business/business-types";
import { getPrismaClient } from "@/server/db/prisma";
import type { BusinessMemberRepository } from "@/server/repositories/contracts/business-member-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toMemberRole(
  role: DatabaseMemberRole,
): BusinessMemberRole {
  switch (role) {
    case DatabaseMemberRole.OWNER:
      return "owner";

    case DatabaseMemberRole.ADMIN:
      return "admin";

    case DatabaseMemberRole.MEMBER:
      return "member";
  }
}

function toDatabaseRole(
  role: BusinessMemberRole,
): DatabaseMemberRole {
  switch (role) {
    case "owner":
      return DatabaseMemberRole.OWNER;

    case "admin":
      return DatabaseMemberRole.ADMIN;

    case "member":
      return DatabaseMemberRole.MEMBER;
  }
}

function toBusinessMember(
  member: DatabaseBusinessMember,
): BusinessMember {
  return {
    id: member.id,
    businessId: member.businessId,
    userId: member.userId,
    role: toMemberRole(member.role),
    createdAt: member.createdAt.toISOString(),
  };
}

export class DatabaseBusinessMemberRepository
  implements BusinessMemberRepository
{
  async findPrimaryByUserId(
    userId: string,
  ): Promise<BusinessMember | null> {
    if (!UUID_PATTERN.test(userId)) {
      return null;
    }

    const member =
      await getPrismaClient().businessMember.findFirst({
        where: {
          userId,
          business: {
            status: {
              not: "ARCHIVED",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return member
      ? toBusinessMember(member)
      : null;
  }

  async listByBusinessId(
    businessId: string,
  ): Promise<BusinessMember[]> {
    if (!UUID_PATTERN.test(businessId)) {
      return [];
    }

    const members =
      await getPrismaClient().businessMember.findMany({
        where: {
          businessId,
        },
        orderBy: [
          {
            role: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    return members.map(toBusinessMember);
  }

  async create(input: {
    businessId: string;
    userId: string;
    role: BusinessMember["role"];
  }): Promise<BusinessMember> {
    const member =
      await getPrismaClient().businessMember.create({
        data: {
          businessId: input.businessId,
          userId: input.userId,
          role: toDatabaseRole(input.role),
        },
      });

    return toBusinessMember(member);
  }

  async updateRole(
    memberId: string,
    role: BusinessMember["role"],
  ): Promise<BusinessMember | null> {
    if (!UUID_PATTERN.test(memberId)) {
      return null;
    }

    const result =
      await getPrismaClient().businessMember.updateMany({
        where: {
          id: memberId,
        },
        data: {
          role: toDatabaseRole(role),
        },
      });

    if (result.count === 0) {
      return null;
    }

    const member =
      await getPrismaClient().businessMember.findUnique({
        where: {
          id: memberId,
        },
      });

    return member
      ? toBusinessMember(member)
      : null;
  }

  async remove(memberId: string): Promise<boolean> {
    if (!UUID_PATTERN.test(memberId)) {
      return false;
    }

    const result =
      await getPrismaClient().businessMember.deleteMany({
        where: {
          id: memberId,
        },
      });

    return result.count > 0;
  }
}