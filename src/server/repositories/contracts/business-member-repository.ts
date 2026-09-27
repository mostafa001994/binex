import type { BusinessMember } from "@/server/business/business-types";

export interface BusinessMemberRepository {
  findPrimaryByUserId(userId: string): Promise<BusinessMember | null>;
  listByBusinessId(businessId: string): Promise<BusinessMember[]>;
  create(input: {
    businessId: string;
    userId: string;
    role: BusinessMember["role"];
  }): Promise<BusinessMember>;  updateRole(
    memberId: string,
    role: BusinessMember["role"],
  ): Promise<BusinessMember | null>;

  remove(
    memberId: string,
  ): Promise<boolean>;
}
