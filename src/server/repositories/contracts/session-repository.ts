import type { AuthSession } from "@/server/auth/auth-types";

export interface SessionRepository {
  create(session: AuthSession): Promise<AuthSession>;
  findActiveByTokenHash(tokenHash: string): Promise<AuthSession | null>;
  revokeByTokenHash(tokenHash: string): Promise<void>;
  countActiveByUserId(userId: string): Promise<number>;
  revokeAllByUserId(userId: string): Promise<number>;
}
