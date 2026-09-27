import type { AppRole, AuthUser } from "@/server/auth/auth-types";
import { ForbiddenApiError } from "@/server/core/api-error";

export function hasRole(user: AuthUser, roles: readonly AppRole[]) {
  return roles.includes(user.role);
}

export function requireRole(user: AuthUser, roles: readonly AppRole[]) {
  if (!hasRole(user, roles)) {
    throw new ForbiddenApiError("شما اجازه دسترسی به این بخش را ندارید.");
  }

  return user;
}
