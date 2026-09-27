import type {
  Business,
  BusinessStatus,
} from "@/server/business/business-types";

export interface BusinessRepository {
  findById(id: string, options?: { includeArchived?: boolean }): Promise<Business | null>;

  create(input: {
    name: string;
    phone?: string | null;
    category?: string | null;
  }): Promise<Business>;

  update(
    id: string,
    input: {
      name?: string;
      phone?: string | null;
      category?: string | null;
      status?: BusinessStatus;
    },
  ): Promise<Business | null>;

  list(options?: { includeArchived?: boolean }): Promise<Business[]>;
}
