import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type {
  AuthSession,
  AuthUser,
  OtpChallenge,
} from "@/server/auth/auth-types";
import { getDefaultAdminPermissions } from "@/lib/admin-permissions";

type MockAuthStore = {
  users: AuthUser[];
  otpChallenges: OtpChallenge[];
  sessions: AuthSession[];
};

declare global {
  var __binixMockAuthStore: MockAuthStore | undefined;
}

const STORE_PATH = join(
  process.cwd(),
  ".binix",
  "mock-auth-store.json",
);

function emptyStore(): MockAuthStore {
  return {
    users: [],
    otpChallenges: [],
    sessions: [],
  };
}

function isMockAuthStore(value: unknown): value is MockAuthStore {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<MockAuthStore>;

  return (
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.otpChallenges) &&
    Array.isArray(candidate.sessions)
  );
}

function readPersistentStore(): MockAuthStore {
  try {
    if (!existsSync(STORE_PATH)) {
      return emptyStore();
    }

    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isMockAuthStore(parsed)) return emptyStore();
    parsed.users = parsed.users.map((user) => ({
      ...user,
      status: user.status === "blocked" ? "blocked" : "active",
      email: user.email ?? null,
      accessRole: user.accessRole ?? { id: `mock-${user.role}`, code: user.role, name: user.role, isProtected: user.role === "super-admin" },
      permissions: user.permissions ?? getDefaultAdminPermissions(user.role),
      preferences: user.preferences ?? { importantNotificationsOnly: true },
    }));
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function getMockAuthStore(): MockAuthStore {
  if (!globalThis.__binixMockAuthStore) {
    globalThis.__binixMockAuthStore = readPersistentStore();
  }

  return globalThis.__binixMockAuthStore;
}

export function persistMockAuthStore() {
  const store = getMockAuthStore();

  mkdirSync(dirname(STORE_PATH), { recursive: true });

  const tempPath = `${STORE_PATH}.tmp`;
  writeFileSync(
    tempPath,
    JSON.stringify(store, null, 2),
    "utf8",
  );
  renameSync(tempPath, STORE_PATH);
}
