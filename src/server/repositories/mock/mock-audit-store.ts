import type { AuditLog } from "@/server/admin/audit-types";

declare global {
  var __binixMockAuditStore: AuditLog[] | undefined;
}

export function getMockAuditStore() {
  if (!globalThis.__binixMockAuditStore) {
    globalThis.__binixMockAuditStore = [];
  }

  return globalThis.__binixMockAuditStore;
}
