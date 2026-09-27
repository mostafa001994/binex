import type { AuthUser } from "@/server/auth/auth-types";
import { isAppRole } from "@/lib/roles";
import {
  hasAdminPermission,
  type AdminPermission,
} from "@/server/admin/admin-permissions";
import type {
  BusinessService,
  BusinessStatus,
} from "@/server/business/business-types";
import {
  ConflictApiError,
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import {
  getAuditRepository,
  getAdminDashboardRepository,
  getBusinessMemberRepository,
  getBusinessRepository,
  getBusinessServiceRepository,
  getSalesAgentRepository,
  getSessionRepository,
  getServiceCatalogRepository,
  getUserRepository,
} from "@/server/repositories/repository-provider";
import { getAdminBusinessCommerceSummary } from "@/server/admin/admin-business-lifecycle-service";

export function requireAdminPermission(
  user: AuthUser,
  permission: AdminPermission,
) {
  if (!hasAdminPermission(user.permissions, permission)) {
    throw new ForbiddenApiError(
      "شما مجوز انجام این عملیات را ندارید.",
    );
  }

  return user;
}

export function requireAdmin(user: AuthUser) {
  return requireAdminPermission(
    user,
    "admin.dashboard.read",
  );
}

export function requireSuperAdmin(user: AuthUser) {
  return requireAdminPermission(
    user,
    "admin.roles.manage",
  );
}

function pageValue(value: number, fallback: number) {
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}

function paginate<T>(
  items: T[],
  pageInput: number,
  pageSizeInput: number,
) {
  const page = pageValue(pageInput, 1);
  const pageSize = Math.min(
    100,
    pageValue(pageSizeInput, 20),
  );
  const total = items.length;
  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getAdminDashboard(user: AuthUser) {
  requireAdminPermission(user, "admin.dashboard.read");
  const [counts, recentAudit] = await Promise.all([
    getAdminDashboardRepository().getSnapshot(),
    getAuditRepository().list(10),
  ]);
  return { counts, recentAudit };
}

export async function listAdminUsers(
  user: AuthUser,
  input: {
    search?: string;
    roleId?: string;
    status?: AuthUser["status"] | "";
    page?: number;
    pageSize?: number;
  } = {},
) {
  requireAdminPermission(user, "admin.users.read");

  const users = await getUserRepository().list();
  const normalizedSearch = (input.search || "")
    .trim()
    .toLowerCase();

  const filtered = users
    .filter((item) => {
      if (
        input.roleId &&
        item.accessRole.id !== input.roleId
      ) {
        return false;
      }

      if (input.status && item.status !== input.status) return false;

      if (!normalizedSearch) return true;

      return (
        item.phone.includes(normalizedSearch) ||
        item.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        item.role
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.accessRole.code.toLowerCase().includes(normalizedSearch) ||
        item.accessRole.name.toLowerCase().includes(normalizedSearch)
      );
    })
    .sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

  return paginate(
    filtered,
    input.page ?? 1,
    input.pageSize ?? 20,
  );
}

export async function getAdminUser(
  user: AuthUser,
  userId: string,
) {
  requireAdminPermission(user, "admin.users.read");

  const target =
    await getUserRepository().findById(userId);

  if (!target) {
    throw new NotFoundApiError("کاربر پیدا نشد.");
  }

  const businesses =
    await getBusinessRepository().list();
  const memberships =
    await Promise.all(
      businesses.map((business) =>
        getBusinessMemberRepository().listByBusinessId(
          business.id,
        ),
      ),
    );

  const related = memberships
    .map((members, index) => {
      const member = members.find(
        (item) => item.userId === userId,
      );

      return member
        ? {
            business: businesses[index],
            membership: member,
          }
        : null;
    })
    .filter(Boolean);

  return {
    user: target,
    businesses: related,
    activeSessionCount: await getSessionRepository().countActiveByUserId(userId),
    canManageRole:
      user.role === "super-admin" &&
      user.id !== target.id,
    canManageIdentity: canManageUserIdentity(user, target),
    canManageSecurity: canManageUserSecurity(user, target),
  };
}

export function canManageUserIdentity(actor: AuthUser, target: AuthUser) {
  if (actor.role === "super-admin") return true;
  return target.role !== "super-admin" && target.role !== "admin";
}

function canManageUserSecurity(actor: AuthUser, target: AuthUser) {
  if (actor.id === target.id || target.role === "super-admin") return false;
  if (actor.role === "super-admin") return true;
  return actor.role === "admin" && target.role !== "admin";
}

export async function updateAdminUserStatus(user: AuthUser, userId: string, status: unknown) {
  requireAdminPermission(user, "admin.users.manage");
  if (status !== "active" && status !== "blocked") throw new ValidationApiError("وضعیت کاربر معتبر نیست.");
  const target = await getUserRepository().findById(userId);
  if (!target) throw new NotFoundApiError("کاربر پیدا نشد.");
  if (!canManageUserSecurity(user, target)) throw new ForbiddenApiError("تغییر وضعیت امنیتی این حساب مجاز نیست.");
  if (target.status === status) throw new ConflictApiError("حساب کاربر در همین وضعیت قرار دارد.");
  const result = await getUserRepository().setStatusAndRevokeSessions(userId, status);
  if (!result) throw new NotFoundApiError("کاربر پیدا نشد.");
  await getAuditRepository().create({
    actorUserId: user.id,
    action: "user_status_changed",
    targetType: "user",
    targetId: userId,
    metadata: { beforeStatus: target.status, afterStatus: status, revokedSessions: result.revokedSessions },
  });
  return result;
}

export async function revokeAdminUserSessions(user: AuthUser, userId: string) {
  requireAdminPermission(user, "admin.users.manage");
  const target = await getUserRepository().findById(userId);
  if (!target) throw new NotFoundApiError("کاربر پیدا نشد.");
  if (!canManageUserSecurity(user, target)) throw new ForbiddenApiError("مدیریت نشست‌های این حساب مجاز نیست.");
  const revokedSessions = await getSessionRepository().revokeAllByUserId(userId);
  await getAuditRepository().create({
    actorUserId: user.id,
    action: "user_sessions_revoked",
    targetType: "user",
    targetId: userId,
    metadata: { revokedSessions },
  });
  return { revokedSessions };
}

export async function updateAdminUserRole(
  user: AuthUser,
  userId: string,
  role: unknown,
) {
  requireSuperAdmin(user);

  if (!isAppRole(role)) {
    throw new ValidationApiError(
      "Role کاربر معتبر نیست.",
    );
  }

  if (user.id === userId) {
    throw new ValidationApiError(
      "نمی‌توانید Role حساب خودتان را از این بخش تغییر دهید.",
    );
  }

  const target =
    await getUserRepository().findById(userId);

  if (!target) {
    throw new NotFoundApiError("کاربر پیدا نشد.");
  }

  const beforeRole = target.role;

  if (
    beforeRole === "super-admin" &&
    role !== "super-admin"
  ) {
    const allUsers =
      await getUserRepository().list();

    const superAdminCount =
      allUsers.filter(
        (item) =>
          item.role ===
          "super-admin",
      ).length;

    if (superAdminCount <= 1) {
      throw new ValidationApiError(
        "آخرین super-admin سیستم قابل تنزل نقش نیست.",
      );
    }
  }

  const updated =
    await getUserRepository().updateRole(
      userId,
      role,
    );

  if (!updated) {
    throw new NotFoundApiError("کاربر پیدا نشد.");
  }

  await getAuditRepository().create({
    actorUserId: user.id,
    action: "user_role_changed",
    targetType: "user",
    targetId: userId,
    metadata: {
      beforeRole,
      afterRole: role,
    },
  });

  return updated;
}

export async function listAdminBusinesses(
  user: AuthUser,
  input: {
    search?: string;
    status?: BusinessStatus | "";
    serviceStatus?: BusinessService["status"] | "";
    page?: number;
    pageSize?: number;
  } = {},
) {
  requireAdminPermission(user, "admin.businesses.read");

  const businesses =
    await getBusinessRepository().list({ includeArchived: true });

  const memberRepository =
    getBusinessMemberRepository();
  const serviceRepository =
    getBusinessServiceRepository();
  const normalizedSearch = (input.search || "")
    .trim()
    .toLowerCase();

  const result = await Promise.all(
    businesses.map(async (business) => {
      const [members, services] =
        await Promise.all([
          memberRepository.listByBusinessId(
            business.id,
          ),
          serviceRepository.listByBusinessId(
            business.id,
          ),
        ]);

      const ownerMember = members.find(
        (item) => item.role === "owner",
      );
      const owner = ownerMember
        ? await getUserRepository().findById(
            ownerMember.userId,
          )
        : null;

      return {
        ...business,
        memberCount: members.length,
        owner: owner
          ? {
              id: owner.id,
              phone: owner.phone,
              name: owner.name,
            }
          : null,
        services,
      };
    }),
  );

  const filtered = result
    .filter((business) => {
      if (
        input.status &&
        business.status !== input.status
      ) {
        return false;
      }

      if (
        input.serviceStatus &&
        !business.services.some(
          (item) =>
            item.status === input.serviceStatus,
        )
      ) {
        return false;
      }

      if (!normalizedSearch) return true;

      return (
        business.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        business.phone?.includes(
          normalizedSearch,
        ) ||
        business.owner?.phone.includes(
          normalizedSearch,
        ) ||
        business.owner?.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        business.id
          .toLowerCase()
          .includes(normalizedSearch)
      );
    })
    .sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );

  return paginate(
    filtered,
    input.page ?? 1,
    input.pageSize ?? 20,
  );
}

export async function getAdminBusiness(
  user: AuthUser,
  businessId: string,
) {
  requireAdminPermission(user, "admin.businesses.read");

  const business =
    await getBusinessRepository().findById(
      businessId,
      { includeArchived: true },
    );

  if (!business) {
    throw new NotFoundApiError(
      "کسب‌وکار پیدا نشد.",
    );
  }

  const [members, services, catalog, commerce] =
    await Promise.all([
      getBusinessMemberRepository().listByBusinessId(
        business.id,
      ),
      getBusinessServiceRepository().listByBusinessId(
        business.id,
      ),
      getServiceCatalogRepository().list(),
      getAdminBusinessCommerceSummary(user, business.id),
    ]);

  const memberUsers = await Promise.all(
    members.map((member) =>
      getUserRepository().findById(
        member.userId,
      ),
    ),
  );

  const salesAgentState = services.find(
    (item) =>
      item.serviceId === "sales-agent",
  );

  const credentialStatus = salesAgentState
    ? await getSalesAgentRepository()
        .getCredentials(business.id)
        .then((credentials) => ({
          baleBotTokenConfigured: Boolean(
            credentials.baleBotTokenEncrypted,
          ),
          woocommerceTokenConfigured: Boolean(
            credentials.woocommerceStoreUrlEncrypted &&
              credentials.woocommerceConsumerKeyEncrypted &&
              credentials.woocommerceConsumerSecretEncrypted,
          ),
        }))
    : null;

  return {
    business,
    members: members.map(
      (member, index) => ({
        ...member,
        user: memberUsers[index]
          ? {
              id: memberUsers[index]!.id,
              phone: memberUsers[index]!.phone,
              name: memberUsers[index]!.name,
              role: memberUsers[index]!.role,
            }
          : null,
      }),
    ),
    services: catalog.map(
      (definition) => ({
        definition,
        state:
          services.find(
            (item) =>
              item.serviceId ===
              definition.id,
          ) ?? null,
      }),
    ),
    salesAgentCredentials: credentialStatus,
    commerce,
  };
}

export async function updateAdminBusinessStatus(
  user: AuthUser,
  businessId: string,
  status: BusinessStatus,
) {
  requireAdminPermission(user, "admin.businesses.manage");

  if (
    status !== "active" &&
    status !== "suspended"
  ) {
    throw new ValidationApiError(
      "وضعیت کسب‌وکار معتبر نیست.",
    );
  }

  const business =
    await getBusinessRepository().findById(
      businessId,
    );

  if (!business) {
    throw new NotFoundApiError(
      "کسب‌وکار پیدا نشد.",
    );
  }

  const beforeStatus = business.status;

  const updated =
    await getBusinessRepository().update(
      businessId,
      { status },
    );

  if (!updated) {
    throw new NotFoundApiError(
      "کسب‌وکار پیدا نشد.",
    );
  }

  await getAuditRepository().create({
    actorUserId: user.id,
    action: "business_status_changed",
    targetType: "business",
    targetId: businessId,
    metadata: {
      beforeStatus,
      afterStatus: status,
    },
  });

  return updated;
}

export async function assignAdminBusinessService(
  user: AuthUser,
  input: {
    businessId: string;
    serviceId: BusinessService["serviceId"];
  },
) {
  requireAdminPermission(user, "admin.services.manage");

  const business =
    await getBusinessRepository().findById(
      input.businessId,
    );

  if (!business) {
    throw new NotFoundApiError(
      "کسب‌وکار پیدا نشد.",
    );
  }

  const catalog =
    await getServiceCatalogRepository().list();

  const definition = catalog.find(
    (item) => item.id === input.serviceId,
  );

  if (!definition) {
    throw new ValidationApiError(
      "سرویس معتبر نیست.",
    );
  }

  if (
    definition.availability ===
      "coming-soon" ||
    definition.status !==
      "active"
  ) {
    throw new ValidationApiError(
      "این سرویس در وضعیت فعلی قابل تخصیص نیست.",
    );
  }

  const existing =
    await getBusinessServiceRepository()
      .listByBusinessId(input.businessId)
      .then((items) =>
        items.find(
          (item) =>
            item.serviceId ===
            input.serviceId,
        ),
      );

  if (existing) return existing;

  const created =
    await getBusinessServiceRepository().create({
      businessId: input.businessId,
      serviceId: input.serviceId,
      status: "setup",
      setupCompleted: false,
    });

  await getAuditRepository().create({
    actorUserId: user.id,
    action: "business_service_assigned",
    targetType: "business-service",
    targetId: created.id,
    metadata: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      status: created.status,
    },
  });

  return created;
}

export async function removeAdminBusinessService(
  user: AuthUser,
  input: {
    businessId: string;
    serviceId: BusinessService["serviceId"];
  },
) {
  requireAdminPermission(user, "admin.services.manage");

  const existing =
    await getBusinessServiceRepository()
      .listByBusinessId(input.businessId)
      .then((items) =>
        items.find(
          (item) =>
            item.serviceId ===
            input.serviceId,
        ),
      );

  if (!existing) {
    throw new NotFoundApiError(
      "این سرویس برای کسب‌وکار پیدا نشد.",
    );
  }

  const deleted =
    await getBusinessServiceRepository().delete(
      input.businessId,
      input.serviceId,
    );

  if (!deleted) {
    throw new NotFoundApiError(
      "حذف سرویس انجام نشد.",
    );
  }

  await getAuditRepository().create({
    actorUserId: user.id,
    action: "business_service_removed",
    targetType: "business-service",
    targetId: existing.id,
    metadata: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      previousStatus: existing.status,
    },
  });
}

export async function updateAdminBusinessServiceStatus(
  user: AuthUser,
  input: {
    businessId: string;
    serviceId: BusinessService["serviceId"];
    status: BusinessService["status"];
  },
) {
  requireAdminPermission(user, "admin.services.manage");

  const business =
    await getBusinessRepository().findById(
      input.businessId,
    );

  if (!business) {
    throw new NotFoundApiError(
      "کسب‌وکار پیدا نشد.",
    );
  }

  const definition =
    await getServiceCatalogRepository().findById(
      input.serviceId,
    );

  if (!definition) {
    throw new NotFoundApiError(
      "سرویس در Catalog پیدا نشد.",
    );
  }

  if (
    definition.availability ===
      "coming-soon" &&
    input.status !==
      "coming-soon"
  ) {
    throw new ValidationApiError(
      "این سرویس هنوز در حالت coming-soon است.",
    );
  }

  const before =
    await getBusinessServiceRepository()
      .listByBusinessId(input.businessId)
      .then((items) =>
        items.find(
          (item) =>
            item.serviceId ===
            input.serviceId,
        ),
      );

  const updated =
    await getBusinessServiceRepository().updateStatus(
      input.businessId,
      input.serviceId,
      input.status,
    );

  if (!updated) {
    throw new NotFoundApiError(
      "این سرویس برای کسب‌وکار پیدا نشد.",
    );
  }

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "business_service_status_changed",
    targetType: "business-service",
    targetId: updated.id,
    metadata: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      beforeStatus: before?.status ?? null,
      afterStatus: input.status,
    },
  });

  return updated;
}


export async function searchAdminAudit(
  user: AuthUser,
  input: Parameters<
    ReturnType<typeof getAuditRepository>["search"]
  >[0],
) {
  requireAdminPermission(user, "admin.audit.read");
  return getAuditRepository().search(input);
}


export async function addAdminBusinessMember(
  user: AuthUser,
  input: {
    businessId: string;
    userId: string;
    role: "owner" | "admin" | "member";
  },
) {
  requireAdminPermission(
    user,
    "admin.businesses.manage",
  );

  const business =
    await getBusinessRepository().findById(
      input.businessId,
    );

  if (!business) {
    throw new NotFoundApiError(
      "کسب‌وکار پیدا نشد.",
    );
  }

  const targetUser =
    await getUserRepository().findById(
      input.userId,
    );

  if (!targetUser) {
    throw new NotFoundApiError(
      "کاربر پیدا نشد.",
    );
  }

  const repository =
    getBusinessMemberRepository();

  const members =
    await repository.listByBusinessId(
      input.businessId,
    );

  if (
    members.some(
      (item) =>
        item.userId ===
        input.userId,
    )
  ) {
    throw new ValidationApiError(
      "این کاربر از قبل عضو کسب‌وکار است.",
    );
  }

  if (
    input.role === "owner" &&
    members.some(
      (item) =>
        item.role === "owner",
    )
  ) {
    throw new ValidationApiError(
      "برای افزودن مالک جدید از انتقال مالکیت استفاده کنید.",
    );
  }

  const member =
    await repository.create({
      businessId:
        input.businessId,
      userId:
        input.userId,
      role:
        input.role,
    });

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "business_member_added",
    targetType: "business",
    targetId:
      input.businessId,
    metadata: {
      memberId:
        member.id,
      userId:
        input.userId,
      role:
        input.role,
    },
  });

  return member;
}

export async function removeAdminBusinessMember(
  user: AuthUser,
  input: {
    businessId: string;
    memberId: string;
  },
) {
  requireAdminPermission(
    user,
    "admin.businesses.manage",
  );

  const repository =
    getBusinessMemberRepository();

  const members =
    await repository.listByBusinessId(
      input.businessId,
    );

  const member =
    members.find(
      (item) =>
        item.id ===
        input.memberId,
    );

  if (!member) {
    throw new NotFoundApiError(
      "عضو پیدا نشد.",
    );
  }

  if (member.role === "owner") {
    throw new ValidationApiError(
      "مالک کسب‌وکار را نمی‌توان حذف کرد. ابتدا مالکیت را منتقل کنید.",
    );
  }

  await repository.remove(
    member.id,
  );

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "business_member_removed",
    targetType: "business",
    targetId:
      input.businessId,
    metadata: {
      memberId:
        member.id,
      userId:
        member.userId,
      role:
        member.role,
    },
  });
}

export async function transferAdminBusinessOwnership(
  user: AuthUser,
  input: {
    businessId: string;
    newOwnerMemberId: string;
  },
) {
  requireAdminPermission(
    user,
    "admin.businesses.manage",
  );

  const repository =
    getBusinessMemberRepository();

  const members =
    await repository.listByBusinessId(
      input.businessId,
    );

  const currentOwner =
    members.find(
      (item) =>
        item.role === "owner",
    );

  const newOwner =
    members.find(
      (item) =>
        item.id ===
        input.newOwnerMemberId,
    );

  if (
    !currentOwner ||
    !newOwner
  ) {
    throw new NotFoundApiError(
      "مالک فعلی یا عضو مقصد پیدا نشد.",
    );
  }

  if (
    currentOwner.id ===
    newOwner.id
  ) {
    throw new ValidationApiError(
      "این عضو در حال حاضر مالک کسب‌وکار است.",
    );
  }

  const before = {
    ownerMemberId:
      currentOwner.id,
    ownerUserId:
      currentOwner.userId,
    newOwnerMemberId:
      newOwner.id,
    newOwnerUserId:
      newOwner.userId,
  };

  await repository.updateRole(
    currentOwner.id,
    "member",
  );

  await repository.updateRole(
    newOwner.id,
    "owner",
  );

  await getAuditRepository().create({
    actorUserId: user.id,
    action:
      "business_ownership_transferred",
    targetType: "business",
    targetId:
      input.businessId,
    metadata: {
      ...before,
      afterOwnerMemberId:
        newOwner.id,
      afterOwnerUserId:
        newOwner.userId,
    },
  });

  return {
    previousOwner:
      currentOwner,
    owner: {
      ...newOwner,
      role: "owner" as const,
    },
  };
}
