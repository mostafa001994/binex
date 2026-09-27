import type {
  AppRole,
} from "@/server/auth/auth-types";
import type { UserRepository } from "@/server/repositories/contracts/user-repository";
import {
  getMockAuthStore,
  persistMockAuthStore,
} from "@/server/repositories/mock/mock-auth-store";
import { getDefaultAdminPermissions } from "@/lib/admin-permissions";

function parsePhones(value?: string) {
  return new Set(
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function resolveMockRole(phone: string): AppRole {
  const superAdmins = parsePhones(
    process.env.BINIX_MOCK_SUPER_ADMIN_PHONES ||
      "09120000000",
  );
  const admins = parsePhones(
    process.env.BINIX_MOCK_ADMIN_PHONES,
  );
  const support = parsePhones(
    process.env.BINIX_MOCK_SUPPORT_PHONES,
  );
  const finance = parsePhones(
    process.env.BINIX_MOCK_FINANCE_PHONES,
  );

  if (superAdmins.has(phone)) return "super-admin";
  if (admins.has(phone)) return "admin";
  if (support.has(phone)) return "support";
  if (finance.has(phone)) return "finance";

  return "user";
}

export class MockUserRepository implements UserRepository {
  async findById(id: string) {
    return (
      getMockAuthStore().users.find(
        (user) => user.id === id,
      ) ?? null
    );
  }

  async findByPhone(phone: string) {
    return (
      getMockAuthStore().users.find(
        (user) => user.phone === phone,
      ) ?? null
    );
  }

  async create(input: { phone: string }) {
    const existing = await this.findByPhone(input.phone);
    if (existing) return existing;

    const user = {
      id: crypto.randomUUID(),
      phone: input.phone,
      email: null,
      name: null,
      role: resolveMockRole(input.phone),
      accessRole: {
        id: `mock-${resolveMockRole(input.phone)}`,
        code: resolveMockRole(input.phone),
        name: resolveMockRole(input.phone),
        isProtected: resolveMockRole(input.phone) === "super-admin",
      },
      permissions: getDefaultAdminPermissions(resolveMockRole(input.phone)),
      status: "active" as const,
      preferences: {
        importantNotificationsOnly: true,
      },
      createdAt: new Date().toISOString(),
    };

    getMockAuthStore().users.push(user);
    persistMockAuthStore();
    return user;
  }

  async updateProfile(
    id: string,
    input: {
      name?: string | null;
      importantNotificationsOnly?: boolean;
    },
  ) {
    const user =
      getMockAuthStore().users.find(
        (item) => item.id === id,
      ) ?? null;

    if (!user) return null;

    if (input.name !== undefined) user.name = input.name;
    if (input.importantNotificationsOnly !== undefined) {
      user.preferences.importantNotificationsOnly = input.importantNotificationsOnly;
    }
    persistMockAuthStore();
    return user;
  }

  async updateRole(id: string, role: AppRole) {
    const user =
      getMockAuthStore().users.find(
        (item) => item.id === id,
      ) ?? null;

    if (!user) return null;

    user.role = role;
    user.accessRole = { id: `mock-${role}`, code: role, name: role, isProtected: role === "super-admin" };
    user.permissions = getDefaultAdminPermissions(role);
    persistMockAuthStore();
    return user;
  }

  async list() {
    return [...getMockAuthStore().users];
  }

  async setStatusAndRevokeSessions(id: string, status: "active" | "blocked") {
    const store = getMockAuthStore();
    const user = store.users.find((item) => item.id === id);
    if (!user) return null;
    user.status = status;
    const now = new Date();
    let revokedSessions = 0;
    for (const session of store.sessions) {
      if (session.userId === id && !session.revokedAt && new Date(session.expiresAt) > now) {
        session.revokedAt = now.toISOString();
        revokedSessions += 1;
      }
    }
    persistMockAuthStore();
    return { user, revokedSessions };
  }
}
