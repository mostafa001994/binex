import type {
  AuthSession as DatabaseAuthSession,
} from "@/generated/prisma/client";
import type {
  AuthSession,
} from "@/server/auth/auth-types";
import { getPrismaClient } from "@/server/db/prisma";
import type { SessionRepository } from "@/server/repositories/contracts/session-repository";

function toAuthSession(
  session: DatabaseAuthSession,
): AuthSession {
  return {
    id: session.id,
    tokenHash: session.tokenHash,
    userId: session.userId,
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    revokedAt:
      session.revokedAt?.toISOString() ?? null,
  };
}

export class DatabaseSessionRepository
  implements SessionRepository
{
  async create(
    session: AuthSession,
  ): Promise<AuthSession> {
    const prisma = getPrismaClient();
    const now = new Date();

    const [, created] = await prisma.$transaction([
      prisma.authSession.updateMany({
        where: {
          userId: session.userId,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          revokedAt: now,
        },
      }),
      prisma.authSession.create({
        data: {
          id: session.id,
          tokenHash: session.tokenHash,
          userId: session.userId,
          expiresAt: new Date(session.expiresAt),
          createdAt: new Date(session.createdAt),
          revokedAt: session.revokedAt
            ? new Date(session.revokedAt)
            : null,
        },
      }),
    ]);

    return toAuthSession(created);
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<AuthSession | null> {
    const session =
      await getPrismaClient().authSession.findFirst({
        where: {
          tokenHash,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    return session
      ? toAuthSession(session)
      : null;
  }

  async revokeByTokenHash(
    tokenHash: string,
  ): Promise<void> {
    await getPrismaClient().authSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return getPrismaClient().authSession.count({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } } });
  }

  async revokeAllByUserId(userId: string): Promise<number> {
    const result = await getPrismaClient().authSession.updateMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }
}
