import type { SessionRepository } from "@/server/repositories/contracts/session-repository";
import {
  getMockAuthStore,
  persistMockAuthStore,
} from "@/server/repositories/mock/mock-auth-store";
import type { AuthSession } from "@/server/auth/auth-types";

export class MockSessionRepository implements SessionRepository {
  async create(session: AuthSession) {
    const store = getMockAuthStore();

    store.sessions = store.sessions.filter(
      (item) =>
        item.userId !== session.userId ||
        item.revokedAt ||
        new Date(item.expiresAt).getTime() <= Date.now(),
    );

    store.sessions.push(session);
    persistMockAuthStore();

    return session;
  }

  async findActiveByTokenHash(tokenHash: string) {
    const now = Date.now();
    const store = getMockAuthStore();

    const session =
      store.sessions.find(
        (item) =>
          item.tokenHash === tokenHash &&
          !item.revokedAt &&
          new Date(item.expiresAt).getTime() > now,
      ) ?? null;

    return session;
  }

  async revokeByTokenHash(tokenHash: string) {
    const session = getMockAuthStore().sessions.find(
      (item) => item.tokenHash === tokenHash && !item.revokedAt,
    );

    if (session) {
      session.revokedAt = new Date().toISOString();
      persistMockAuthStore();
    }
  }

  async countActiveByUserId(userId: string) {
    const now = new Date();
    return getMockAuthStore().sessions.filter((item) => item.userId === userId && !item.revokedAt && new Date(item.expiresAt) > now).length;
  }

  async revokeAllByUserId(userId: string) {
    const store = getMockAuthStore();
    const now = new Date();
    let count = 0;
    for (const session of store.sessions) {
      if (session.userId === userId && !session.revokedAt && new Date(session.expiresAt) > now) {
        session.revokedAt = now.toISOString();
        count += 1;
      }
    }
    persistMockAuthStore();
    return count;
  }
}
