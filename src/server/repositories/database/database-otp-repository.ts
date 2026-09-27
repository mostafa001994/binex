import type {
  OtpChallenge as DatabaseOtpChallenge,
} from "@/generated/prisma/client";
import type {
  OtpChallenge,
} from "@/server/auth/auth-types";
import { getPrismaClient } from "@/server/db/prisma";
import type { OtpRepository } from "@/server/repositories/contracts/otp-repository";

function toOtpChallenge(
  challenge: DatabaseOtpChallenge,
): OtpChallenge {
  return {
    id: challenge.id,
    phone: challenge.phone,
    codeHash: challenge.codeHash,
    expiresAt: challenge.expiresAt.toISOString(),
    attempts: challenge.attempts,
    maxAttempts: challenge.maxAttempts,
    consumedAt:
      challenge.consumedAt?.toISOString() ?? null,
    createdAt: challenge.createdAt.toISOString(),
  };
}

export class DatabaseOtpRepository
  implements OtpRepository
{
  async create(
    challenge: OtpChallenge,
  ): Promise<OtpChallenge> {
    const created =
      await getPrismaClient().otpChallenge.create({
        data: {
          id: challenge.id,
          phone: challenge.phone,
          codeHash: challenge.codeHash,
          expiresAt: new Date(challenge.expiresAt),
          attempts: challenge.attempts,
          maxAttempts: challenge.maxAttempts,
          consumedAt: challenge.consumedAt
            ? new Date(challenge.consumedAt)
            : null,
          createdAt: new Date(challenge.createdAt),
        },
      });

    return toOtpChallenge(created);
  }

  async findLatestActiveByPhone(
    phone: string,
  ): Promise<OtpChallenge | null> {
    const challenge =
      await getPrismaClient().otpChallenge.findFirst({
        where: {
          phone,
          consumedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return challenge
      ? toOtpChallenge(challenge)
      : null;
  }

  async incrementAttempts(id: string): Promise<void> {
    await getPrismaClient().otpChallenge.updateMany({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async consume(id: string): Promise<void> {
    await getPrismaClient().otpChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(),
      },
    });
  }
}