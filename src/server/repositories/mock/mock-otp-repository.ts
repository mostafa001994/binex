import type { OtpRepository } from "@/server/repositories/contracts/otp-repository";
import {
  getMockAuthStore,
  persistMockAuthStore,
} from "@/server/repositories/mock/mock-auth-store";
import type { OtpChallenge } from "@/server/auth/auth-types";

export class MockOtpRepository implements OtpRepository {
  async create(challenge: OtpChallenge) {
    getMockAuthStore().otpChallenges.push(challenge);
    persistMockAuthStore();
    return challenge;
  }

  async findLatestActiveByPhone(phone: string) {
    const now = Date.now();

    return (
      [...getMockAuthStore().otpChallenges]
        .reverse()
        .find(
          (item) =>
            item.phone === phone &&
            !item.consumedAt &&
            new Date(item.expiresAt).getTime() > now,
        ) ?? null
    );
  }

  async incrementAttempts(id: string) {
    const item = getMockAuthStore().otpChallenges.find(
      (challenge) => challenge.id === id,
    );
    if (item) item.attempts += 1;
  }

  async consume(id: string) {
    const item = getMockAuthStore().otpChallenges.find(
      (challenge) => challenge.id === id,
    );
    if (item) item.consumedAt = new Date().toISOString();
  }
}
