import {
  SystemRole,
  UserStatus,
  type User as DatabaseUser,
} from "@/generated/prisma/client";
import type {
  AppRole,
  AuthUser,
} from "@/server/auth/auth-types";
import { getPrismaClient } from "@/server/db/prisma";
import { getDefaultAdminPermissions } from "@/lib/admin-permissions";
import type { UserRepository } from "@/server/repositories/contracts/user-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toAppRole(role: SystemRole): AppRole {
  switch (role) {
    case SystemRole.SUPER_ADMIN:
      return "super-admin";

    case SystemRole.ADMIN:
      return "admin";

    case SystemRole.SUPPORT:
      return "support";

    case SystemRole.FINANCE:
      return "finance";

    case SystemRole.USER:
      return "user";
  }
}

function toDatabaseRole(role: AppRole): SystemRole {
  switch (role) {
    case "super-admin":
      return SystemRole.SUPER_ADMIN;

    case "admin":
      return SystemRole.ADMIN;

    case "support":
      return SystemRole.SUPPORT;

    case "finance":
      return SystemRole.FINANCE;

    case "user":
      return SystemRole.USER;
  }
}

type DatabaseUserWithAccessRole = DatabaseUser & {
  accessRole: {
    id: string;
    code: string;
    name: string;
    isProtected: boolean;
    permissions: Array<{ permissionCode: string }>;
  };
};

const accessRoleInclude = {
  accessRole: { include: { permissions: true } },
} as const;

function toAuthUser(user: DatabaseUserWithAccessRole): AuthUser {
  const role = toAppRole(user.systemRole);
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    name: user.name,
    role,
    accessRole: {
      id: user.accessRole.id,
      code: user.accessRole.code,
      name: user.accessRole.name,
      isProtected: user.accessRole.isProtected,
    },
    permissions: role === "super-admin"
      ? getDefaultAdminPermissions("super-admin")
      : user.accessRole.permissions.map((item) => item.permissionCode),
    status: user.status === UserStatus.BLOCKED ? "blocked" : "active",
    preferences: {
      importantNotificationsOnly: user.importantNotificationsOnly,
    },
    createdAt: user.createdAt.toISOString(),
  };
}

export class DatabaseUserRepository
  implements UserRepository
{
  async findById(id: string): Promise<AuthUser | null> {
    if (!UUID_PATTERN.test(id)) {
      return null;
    }

    const user = await getPrismaClient().user.findUnique({ where: { id }, include: accessRoleInclude });

    return user ? toAuthUser(user) : null;
  }

  async findByPhone(
    phone: string,
  ): Promise<AuthUser | null> {
    const user = await getPrismaClient().user.findUnique({ where: { phone }, include: accessRoleInclude });

    return user ? toAuthUser(user) : null;
  }

  async create(input: {
    phone: string;
  }): Promise<AuthUser> {
    const user = await getPrismaClient().user.upsert({
      where: {
        phone: input.phone,
      },
      update: {},
      create: {
        phone: input.phone,
        status: UserStatus.ACTIVE,
        systemRole: SystemRole.USER,
        accessRole: { connect: { code: "user" } },
      },
      include: accessRoleInclude,
    });

    return toAuthUser(user);
  }

  async updateProfile(
    id: string,
    input: {
      name?: string | null;
      importantNotificationsOnly?: boolean;
    },
  ): Promise<AuthUser | null> {
    if (!UUID_PATTERN.test(id)) {
      return null;
    }

    const result =
      await getPrismaClient().user.updateMany({
        where: { id },
        data: {
          name: input.name,
          importantNotificationsOnly: input.importantNotificationsOnly,
        },
      });

    if (result.count === 0) {
      return null;
    }

    const user =
      await getPrismaClient().user.findUnique({
        where: { id },
        include: accessRoleInclude,
      });

    return user ? toAuthUser(user) : null;
  }

  async updateRole(
    id: string,
    role: AppRole,
  ): Promise<AuthUser | null> {
    if (!UUID_PATTERN.test(id)) {
      return null;
    }

    const accessRole = await getPrismaClient().accessRole.findUnique({ where: { code: role } });
    if (!accessRole) return null;

    const result =
      await getPrismaClient().user.updateMany({
        where: { id },
        data: {
          systemRole: toDatabaseRole(role),
          accessRoleId: accessRole.id,
        },
      });

    if (result.count === 0) {
      return null;
    }

    const user =
      await getPrismaClient().user.findUnique({
        where: { id },
        include: accessRoleInclude,
      });

    return user ? toAuthUser(user) : null;
  }

  async list(): Promise<AuthUser[]> {
    const users = await getPrismaClient().user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: accessRoleInclude,
    });

    return users.map(toAuthUser);
  }

  async setStatusAndRevokeSessions(id: string, status: AuthUser["status"]) {
    if (!UUID_PATTERN.test(id)) return null;
    const prisma = getPrismaClient();
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return null;
    const now = new Date();
    const [updated, revoked] = await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { status: status === "blocked" ? UserStatus.BLOCKED : UserStatus.ACTIVE }, include: accessRoleInclude }),
      prisma.authSession.updateMany({ where: { userId: id, revokedAt: null, expiresAt: { gt: now } }, data: { revokedAt: now } }),
    ]);
    return { user: toAuthUser(updated), revokedSessions: revoked.count };
  }
}
