import type { AppRole } from "@/lib/roles";

export type { AppRole } from "@/lib/roles";

export type AuthUser = {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  role: AppRole;
  accessRole: {
    id: string;
    code: string;
    name: string;
    isProtected: boolean;
  };
  permissions: string[];
  status: "active" | "blocked";
  preferences: {
    importantNotificationsOnly: boolean;
  };
  createdAt: string;
};

export type OtpChallenge = {
  id: string;
  phone: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  consumedAt: string | null;
  createdAt: string;
};

export type AuthSession = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
};

export type RequestOtpResult = {
  challengeId: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  devCode?: string;
};

export type VerifyOtpResult = {
  user: AuthUser;
  sessionToken: string;
  sessionExpiresAt: string;
};
