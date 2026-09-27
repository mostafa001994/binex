import {
  AuditAction as DatabaseAuditAction,
  Prisma,
  type AuditLog as DatabaseAuditLog,
} from "@/generated/prisma/client";
import type {
  AuditAction,
  AuditLog,
} from "@/server/admin/audit-types";
import { sanitizeAuditMetadata } from "@/server/admin/audit-types";
import { getRequestContext } from "@/server/core/request-context";
import { getPrismaClient } from "@/server/db/prisma";
import type { AuditRepository } from "@/server/repositories/contracts/audit-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type DatabaseAuditLogWithActor = DatabaseAuditLog & {
  actor: {
    phone: string;
    name: string | null;
  };
};

const ACTOR_INCLUDE = {
  actor: {
    select: {
      phone: true,
      name: true,
    },
  },
} as const;

const ACTION_TO_DATABASE: Record<
  AuditAction,
  DatabaseAuditAction
> = {
  business_service_status_changed:
    DatabaseAuditAction.BUSINESS_SERVICE_STATUS_CHANGED,
  business_service_assigned:
    DatabaseAuditAction.BUSINESS_SERVICE_ASSIGNED,
  business_service_removed:
    DatabaseAuditAction.BUSINESS_SERVICE_REMOVED,
  business_status_changed:
    DatabaseAuditAction.BUSINESS_STATUS_CHANGED,
  user_role_changed:
    DatabaseAuditAction.USER_ROLE_CHANGED,
  admin_login_checked:
    DatabaseAuditAction.ADMIN_LOGIN_CHECKED,
  service_catalog_created:
    DatabaseAuditAction.SERVICE_CATALOG_CREATED,
  service_catalog_updated:
    DatabaseAuditAction.SERVICE_CATALOG_UPDATED,
  service_catalog_deleted:
    DatabaseAuditAction.SERVICE_CATALOG_DELETED,
  business_member_added:
    DatabaseAuditAction.BUSINESS_MEMBER_ADDED,
  business_member_removed:
    DatabaseAuditAction.BUSINESS_MEMBER_REMOVED,
  business_ownership_transferred:
    DatabaseAuditAction.BUSINESS_OWNERSHIP_TRANSFERRED,
  service_plan_created:
    DatabaseAuditAction.SERVICE_PLAN_CREATED,
  service_plan_updated:
    DatabaseAuditAction.SERVICE_PLAN_UPDATED,
  service_plan_archived:
    DatabaseAuditAction.SERVICE_PLAN_ARCHIVED,
  subscription_paused:
    DatabaseAuditAction.SUBSCRIPTION_PAUSED,
  subscription_resumed:
    DatabaseAuditAction.SUBSCRIPTION_RESUMED,
  subscription_canceled:
    DatabaseAuditAction.SUBSCRIPTION_CANCELED,
  provisioning_job_retried:
    DatabaseAuditAction.PROVISIONING_JOB_RETRIED,
  user_status_changed:
    DatabaseAuditAction.USER_STATUS_CHANGED,
  user_sessions_revoked:
    DatabaseAuditAction.USER_SESSIONS_REVOKED,
  access_role_created:
    DatabaseAuditAction.ACCESS_ROLE_CREATED,
  access_role_updated:
    DatabaseAuditAction.ACCESS_ROLE_UPDATED,
  user_created:
    DatabaseAuditAction.USER_CREATED,
  user_profile_updated:
    DatabaseAuditAction.USER_PROFILE_UPDATED,
  subscription_created:
    DatabaseAuditAction.SUBSCRIPTION_CREATED,
  subscription_renewed:
    DatabaseAuditAction.SUBSCRIPTION_RENEWED,
  subscription_plan_changed:
    DatabaseAuditAction.SUBSCRIPTION_PLAN_CHANGED,
  order_note_updated:
    DatabaseAuditAction.ORDER_NOTE_UPDATED,
  order_canceled:
    DatabaseAuditAction.ORDER_CANCELED,
  order_expired:
    DatabaseAuditAction.ORDER_EXPIRED,
  business_created:
    DatabaseAuditAction.BUSINESS_CREATED,
  business_profile_updated:
    DatabaseAuditAction.BUSINESS_PROFILE_UPDATED,
  business_archived:
    DatabaseAuditAction.BUSINESS_ARCHIVED,
  business_restored:
    DatabaseAuditAction.BUSINESS_RESTORED,
  automation_connector_updated:
    DatabaseAuditAction.AUTOMATION_CONNECTOR_UPDATED,
  automation_connector_cleared:
    DatabaseAuditAction.AUTOMATION_CONNECTOR_CLEARED,
  support_ticket_created:
    DatabaseAuditAction.SUPPORT_TICKET_CREATED,
  support_ticket_updated:
    DatabaseAuditAction.SUPPORT_TICKET_UPDATED,
  support_ticket_replied:
    DatabaseAuditAction.SUPPORT_TICKET_REPLIED,
  consultation_lead_updated:
    DatabaseAuditAction.CONSULTATION_LEAD_UPDATED,
  blog_post_created:
    DatabaseAuditAction.BLOG_POST_CREATED,

  blog_post_updated:
    DatabaseAuditAction.BLOG_POST_UPDATED,

  blog_post_submitted:
    DatabaseAuditAction.BLOG_POST_SUBMITTED,

  blog_post_published:
    DatabaseAuditAction.BLOG_POST_PUBLISHED,

  blog_post_archived:
    DatabaseAuditAction.BLOG_POST_ARCHIVED,

  blog_post_scheduled:
    DatabaseAuditAction.BLOG_POST_SCHEDULED,

  blog_post_unpublished:
    DatabaseAuditAction.BLOG_POST_UNPUBLISHED,

  blog_post_revision_restored:
    DatabaseAuditAction.BLOG_POST_REVISION_RESTORED,

  blog_post_deleted:
    DatabaseAuditAction.BLOG_POST_DELETED,

  site_seo_updated:
    DatabaseAuditAction.SITE_SEO_UPDATED,

  faq_settings_updated:
    DatabaseAuditAction.FAQ_SETTINGS_UPDATED,

  blog_media_uploaded:
    DatabaseAuditAction.BLOG_MEDIA_UPLOADED,

  blog_media_updated:
    DatabaseAuditAction.BLOG_MEDIA_UPDATED,

  blog_media_deleted:
    DatabaseAuditAction.BLOG_MEDIA_DELETED,

  blog_taxonomy_created:
    DatabaseAuditAction.BLOG_TAXONOMY_CREATED,

  blog_taxonomy_updated:
    DatabaseAuditAction.BLOG_TAXONOMY_UPDATED,

  blog_taxonomy_deleted:
    DatabaseAuditAction.BLOG_TAXONOMY_DELETED,

  blog_taxonomy_merged:
    DatabaseAuditAction.BLOG_TAXONOMY_MERGED,

  custom_service_created:
    DatabaseAuditAction.CUSTOM_SERVICE_CREATED,

  custom_service_updated:
    DatabaseAuditAction.CUSTOM_SERVICE_UPDATED,

  custom_service_offer_created:
    DatabaseAuditAction.CUSTOM_SERVICE_OFFER_CREATED,

  custom_service_offer_sent:
    DatabaseAuditAction.CUSTOM_SERVICE_OFFER_SENT,

  custom_service_offer_canceled:
    DatabaseAuditAction.CUSTOM_SERVICE_OFFER_CANCELED,

  custom_service_offer_paid:
    DatabaseAuditAction.CUSTOM_SERVICE_OFFER_PAID,

  custom_service_offer_updated:
    DatabaseAuditAction.CUSTOM_SERVICE_OFFER_UPDATED,

  custom_service_offer_expired:
    DatabaseAuditAction.CUSTOM_SERVICE_OFFER_EXPIRED,

  custom_service_subscription_paused:
    DatabaseAuditAction.CUSTOM_SERVICE_SUBSCRIPTION_PAUSED,

  custom_service_subscription_resumed:
    DatabaseAuditAction.CUSTOM_SERVICE_SUBSCRIPTION_RESUMED,

  custom_service_subscription_ended:
    DatabaseAuditAction.CUSTOM_SERVICE_SUBSCRIPTION_ENDED,

  custom_service_subscription_extended:
    DatabaseAuditAction.CUSTOM_SERVICE_SUBSCRIPTION_EXTENDED,
};

const DATABASE_TO_ACTION: Record<
  DatabaseAuditAction,
  AuditAction
> = Object.fromEntries(
  Object.entries(ACTION_TO_DATABASE).map(
    ([action, databaseAction]) => [
      databaseAction,
      action,
    ],
  ),
) as Record<DatabaseAuditAction, AuditAction>;

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

function toMetadata(
  value: Prisma.JsonValue,
): AuditLog["metadata"] {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const metadata: AuditLog["metadata"] = {};

  for (const [key, item] of Object.entries(value)) {
    if (
      item === null ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      metadata[key] = item;
    }
  }

  return metadata;
}

function toAuditLog(
  log: DatabaseAuditLogWithActor,
): AuditLog {
  return {
    id: log.id,
    actorUserId: log.actorUserId,
    actor: log.actor,
    action: DATABASE_TO_ACTION[log.action],
    targetType:
      log.targetType as AuditLog["targetType"],
    targetId: log.targetId,
    metadata: toMetadata(log.metadata),
    requestId: log.requestId,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
  };
}

function resolveBusinessId(
  input: Parameters<AuditRepository["create"]>[0],
): string | null {
  if (
    input.targetType === "business" &&
    input.targetId &&
    UUID_PATTERN.test(input.targetId)
  ) {
    return input.targetId;
  }

  const metadataBusinessId =
    input.metadata.businessId;

  return typeof metadataBusinessId === "string" &&
    UUID_PATTERN.test(metadataBusinessId)
    ? metadataBusinessId
    : null;
}

export class DatabaseAuditRepository
  implements AuditRepository
{
  async create(
    input: Parameters<AuditRepository["create"]>[0],
  ): Promise<AuditLog> {
    const context = getRequestContext();
    const log =
      await getPrismaClient().auditLog.create({
        data: {
          actorUserId: input.actorUserId,
          businessId: resolveBusinessId(input),
          action: ACTION_TO_DATABASE[input.action],
          targetType: input.targetType,
          targetId: input.targetId,
          metadata: sanitizeAuditMetadata(
            input.metadata,
          ) as Prisma.InputJsonValue,
          requestId: input.requestId ?? context?.requestId ?? null,
          ipAddress: input.ipAddress ?? context?.ip ?? null,
          userAgent: input.userAgent ?? context?.userAgent ?? null,
        },
        include: ACTOR_INCLUDE,
      });

    return toAuditLog(log);
  }

  async list(limit = 50): Promise<AuditLog[]> {
    const safeLimit = Math.max(
      1,
      Math.min(limit, 200),
    );

    const logs =
      await getPrismaClient().auditLog.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: safeLimit,
        include: ACTOR_INCLUDE,
      });

    return logs.map(toAuditLog);
  }

  async search(
    input: Parameters<AuditRepository["search"]>[0],
  ): ReturnType<AuditRepository["search"]> {
    const where: Prisma.AuditLogWhereInput = {};

    if (input.action) {
      where.action =
        ACTION_TO_DATABASE[input.action];
    }

    if (input.actorUserId) {
      where.actorUserId = input.actorUserId;
    }

    if (input.actorQuery) {
      const query = input.actorQuery.trim();
      where.OR = [
        ...(UUID_PATTERN.test(query)
          ? [{ actorUserId: query }]
          : []),
        {
          actor: {
            phone: { contains: query },
          },
        },
        {
          actor: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (input.targetType) {
      where.targetType = input.targetType;
    }

    if (input.targetId) {
      where.targetId = input.targetId;
    }

    if (input.from || input.to) {
      where.createdAt = {};

      if (input.from) {
        where.createdAt.gte =
          new Date(input.from);
      }

      if (input.to) {
        where.createdAt.lte =
          new Date(input.to);
      }
    }

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

    const prisma = getPrismaClient();
    const total =
      await prisma.auditLog.count({
        where,
      });

    const totalPages = Math.max(
      1,
      Math.ceil(total / pageSize),
    );

    const safePage = Math.min(
      page,
      totalPages,
    );

    const logs =
      await prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip:
          (safePage - 1) * pageSize,
        take: pageSize,
        include: ACTOR_INCLUDE,
      });

    return {
      items: logs.map(toAuditLog),
      pagination: {
        page: safePage,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async createWithTransaction(
    tx: Prisma.TransactionClient,
    input: Parameters<AuditRepository["create"]>[0],
  ) {
    const databaseAction =
      ACTION_TO_DATABASE[input.action];

    return tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: databaseAction,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata ?? {},
        requestId: input.requestId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }


}

export async function createDatabaseAuditLog(
  tx: Prisma.TransactionClient,
  input: Parameters<DatabaseAuditRepository["create"]>[0],
) {
  const repository = new DatabaseAuditRepository();

  return repository.createWithTransaction(tx, input);
}
