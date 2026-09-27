import type {
  AppRole,
  AuthUser,
} from "@/server/auth/auth-types";

export interface UserRepository {
  findById(id: string): Promise<AuthUser | null>;
  findByPhone(phone: string): Promise<AuthUser | null>;
  create(input: { phone: string }): Promise<AuthUser>;

  updateProfile(
    id: string,
    input: {
      name?: string | null;
      importantNotificationsOnly?: boolean;
    },
  ): Promise<AuthUser | null>;

  updateRole(
    id: string,
    role: AppRole,
  ): Promise<AuthUser | null>;

  setStatusAndRevokeSessions(
    id: string,
    status: AuthUser["status"],
  ): Promise<{ user: AuthUser; revokedSessions: number } | null>;

  list(): Promise<AuthUser[]>;
}
