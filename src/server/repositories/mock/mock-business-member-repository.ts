import type { BusinessMember } from "@/server/business/business-types";
import type { BusinessMemberRepository } from "@/server/repositories/contracts/business-member-repository";
import { getMockBusinessStore } from "@/server/repositories/mock/mock-business-store";

export class MockBusinessMemberRepository implements BusinessMemberRepository {
  async findPrimaryByUserId(userId: string) {
    return getMockBusinessStore().members.find((item) => item.userId === userId) ?? null;
  }

  async listByBusinessId(businessId: string) {
    return getMockBusinessStore().members.filter(
      (item) => item.businessId === businessId,
    );
  }

  async create(input: {
    businessId: string;
    userId: string;
    role: "owner" | "admin" | "member";
  }) {
    const member = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      userId: input.userId,
      role: input.role,
      createdAt: new Date().toISOString(),
    };

    getMockBusinessStore().members.push(member);
    return member;
  }
  async updateRole(
    memberId: string,
    role: BusinessMember["role"],
  ) {
    const members =
      getMockBusinessStore().members;

    const member =
      members.find(
        (item) =>
          item.id === memberId,
      );

    if (!member) return null;

    member.role = role;
    return member;
  }

  async remove(memberId: string) {
    const members =
      getMockBusinessStore().members;

    const index =
      members.findIndex(
        (item) =>
          item.id === memberId,
      );

    if (index < 0) return false;

    members.splice(
      index,
      1,
    );
    return true;
  }

}
