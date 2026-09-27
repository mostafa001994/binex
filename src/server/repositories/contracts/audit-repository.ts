import type { AuditAction, AuditLog } from "@/server/admin/audit-types";

export type CreateAuditLogInput = Omit<
  AuditLog,
  | "id"
  | "createdAt"
  | "actor"
  | "requestId"
  | "ipAddress"
  | "userAgent"
> &
  Partial<
    Pick<AuditLog, "requestId" | "ipAddress" | "userAgent">
  >;

export interface AuditRepository {
  create(input: CreateAuditLogInput): Promise<AuditLog>;

  list(limit?: number): Promise<AuditLog[]>;

  search(input: {
    action?: AuditAction | "";
    actorUserId?: string;
    actorQuery?: string;
    targetType?: AuditLog["targetType"] | "";
    targetId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: AuditLog[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>;
}
