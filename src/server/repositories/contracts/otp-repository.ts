import type { OtpChallenge } from "@/server/auth/auth-types";

export interface OtpRepository {
  create(challenge: OtpChallenge): Promise<OtpChallenge>;
  findLatestActiveByPhone(phone: string): Promise<OtpChallenge | null>;
  incrementAttempts(id: string): Promise<void>;
  consume(id: string): Promise<void>;
}
