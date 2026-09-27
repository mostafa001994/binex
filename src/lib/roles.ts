export const APP_ROLES = [
  "user",
  "support",
  "finance",
  "admin",
  "super-admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  user: "کاربر",
  support: "پشتیبانی",
  finance: "مالی",
  admin: "مدیر",
  "super-admin": "مدیر ارشد",
};

export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" &&
    (APP_ROLES as readonly string[]).includes(value)
  );
}
