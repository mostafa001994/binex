import type { AuthUser } from "@/server/auth/auth-types";
import { hasAdminPermission } from "@/server/admin/admin-permissions";
import { ForbiddenApiError } from "@/server/core/api-error";

function requireSystemRead(user: AuthUser) {
  if (!hasAdminPermission(user.permissions, "admin.system.read")) {
    throw new ForbiddenApiError(
      "دسترسی به وضعیت سیستم برای این حساب مجاز نیست.",
    );
  }
}

export async function getAdminSystemStatus(user: AuthUser) {
  requireSystemRead(user);

  return {
    environment: process.env.NODE_ENV || "development",
    dataDriver: process.env.BINIX_DATA_DRIVER || "mock",
    otpDriver: process.env.BINIX_OTP_DRIVER || "mock",
    repositoryMode:
      process.env.BINIX_DATA_DRIVER === "database"
        ? "database"
        : "mock",
    version:
      process.env.NEXT_PUBLIC_APP_VERSION ||
      process.env.npm_package_version ||
      "0.1.0",
    credentialsEncryptionConfigured: Boolean(
      process.env.BINIX_CREDENTIALS_ENCRYPTION_KEY,
    ),
    serverTime: new Date().toISOString(),
    checks: {
      api: "ok",
      repository:
        process.env.BINIX_DATA_DRIVER === "database"
          ? "configured"
          : "mock",
    },
  };
}
