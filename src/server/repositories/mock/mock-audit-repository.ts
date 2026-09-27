import type { AuditRepository } from "@/server/repositories/contracts/audit-repository";
import { getMockAuditStore } from "@/server/repositories/mock/mock-audit-store";
import { sanitizeAuditMetadata } from "@/server/admin/audit-types";
import { getRequestContext } from "@/server/core/request-context";

function normalizePage(
  value: number | undefined,
  fallback: number,
) {
  if (
    !value ||
    !Number.isFinite(value) ||
    value < 1
  ) {
    return fallback;
  }

  return Math.floor(value);
}

export class MockAuditRepository
  implements AuditRepository
{
  async create(
    input: Parameters<
      AuditRepository["create"]
    >[0],
  ) {
    const context = getRequestContext();
    const log = {
      ...input,
      actor: null,
      metadata: sanitizeAuditMetadata(input.metadata),
      requestId: input.requestId ?? context?.requestId ?? null,
      ipAddress: input.ipAddress ?? context?.ip ?? null,
      userAgent: input.userAgent ?? context?.userAgent ?? null,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    getMockAuditStore().unshift(log);
    return log;
  }

  async list(limit = 50) {
    return getMockAuditStore().slice(
      0,
      Math.max(
        1,
        Math.min(limit, 200),
      ),
    );
  }

  async search(
    input: Parameters<
      AuditRepository["search"]
    >[0],
  ) {
    let items = [
      ...getMockAuditStore(),
    ];

    if (input.action) {
      items = items.filter(
        (item) =>
          item.action === input.action,
      );
    }

    if (input.actorUserId) {
      items = items.filter(
        (item) =>
          item.actorUserId ===
          input.actorUserId,
      );
    }

    if (input.actorQuery) {
      const query = input.actorQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.actorUserId.toLowerCase().includes(query) ||
          item.actor?.phone.toLowerCase().includes(query) ||
          item.actor?.name?.toLowerCase().includes(query),
      );
    }

    if (input.targetType) {
      items = items.filter(
        (item) =>
          item.targetType ===
          input.targetType,
      );
    }

    if (input.targetId) {
      items = items.filter(
        (item) =>
          item.targetId ===
          input.targetId,
      );
    }

    if (input.from) {
      items = items.filter(
        (item) =>
          item.createdAt >=
          input.from!,
      );
    }

    if (input.to) {
      items = items.filter(
        (item) =>
          item.createdAt <=
          input.to!,
      );
    }

    items.sort((a, b) =>
      b.createdAt.localeCompare(
        a.createdAt,
      ),
    );

    const page = normalizePage(
      input.page,
      1,
    );
    const pageSize = Math.min(
      100,
      normalizePage(
        input.pageSize,
        30,
      ),
    );
    const total = items.length;
    const totalPages = Math.max(
      1,
      Math.ceil(total / pageSize),
    );
    const safePage = Math.min(
      page,
      totalPages,
    );
    const start =
      (safePage - 1) * pageSize;

    return {
      items: items.slice(
        start,
        start + pageSize,
      ),
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages,
      },
    };
  }
}
