import type { AppRole } from "@/lib/roles";

export type AdminPermission =
  | "admin.dashboard.read"
  | "admin.users.read"
  | "admin.users.manage"
  | "admin.businesses.read"
  | "admin.businesses.manage"
  | "admin.services.manage"
  | "admin.audit.read"
  | "admin.system.read"
  | "admin.catalog.manage"
  | "admin.catalog.read"
  | "admin.custom-services.read"
  | "admin.custom-services.manage"
  | "admin.plans.read"
  | "admin.plans.manage"
  | "admin.payment-gateways.read"
  | "admin.payment-gateways.manage"
  | "admin.subscriptions.read"
  | "admin.subscriptions.manage"
  | "admin.orders.read"
  | "admin.orders.manage"
  | "admin.provisioning.read"
  | "admin.provisioning.manage"
  | "admin.roles.manage"
  | "admin.support.read"
  | "admin.support.manage"
  | "admin.leads.read"
  | "admin.leads.manage"
  | "admin.notifications.read"
  | "admin.notifications.manage"
  | "admin.content.read"
  | "admin.content.write"
  | "admin.content.publish";

export const ADMIN_PERMISSION_CATALOG: ReadonlyArray<{
  code: AdminPermission;
  label: string;
  group: string;
}> = [
  { code: "admin.dashboard.read", label: "مشاهده نمای کلی", group: "عمومی" },
  { code: "admin.users.read", label: "مشاهده کاربران", group: "کاربران" },
  { code: "admin.users.manage", label: "مدیریت کاربران و امنیت", group: "کاربران" },
  { code: "admin.businesses.read", label: "مشاهده کسب‌وکارها", group: "کسب‌وکارها" },
  { code: "admin.businesses.manage", label: "مدیریت کسب‌وکارها", group: "کسب‌وکارها" },
  { code: "admin.services.manage", label: "تخصیص سرویس به کسب‌وکار", group: "سرویس‌ها" },
  { code: "admin.catalog.read", label: "مشاهده کاتالوگ سرویس", group: "سرویس‌ها" },
  { code: "admin.catalog.manage", label: "مدیریت کاتالوگ سرویس", group: "سرویس‌ها" },
  { code: "admin.custom-services.read", label: "مشاهده سرویس‌های اختصاصی", group: "سرویس‌های اختصاصی" },
  { code: "admin.custom-services.manage", label: "مدیریت سرویس‌های اختصاصی", group: "سرویس‌های اختصاصی" },
  { code: "admin.plans.read", label: "مشاهده پلن‌ها", group: "فروش" },
  { code: "admin.plans.manage", label: "مدیریت پلن‌ها", group: "فروش" },
  { code: "admin.payment-gateways.read", label: "مشاهده درگاه‌های پرداخت", group: "فروش" },
  { code: "admin.payment-gateways.manage", label: "مدیریت درگاه‌های پرداخت", group: "فروش" },
  { code: "admin.subscriptions.read", label: "مشاهده اشتراک‌ها", group: "فروش" },
  { code: "admin.subscriptions.manage", label: "مدیریت اشتراک‌ها", group: "فروش" },
  { code: "admin.orders.read", label: "مشاهده سفارش‌ها و پرداخت‌ها", group: "فروش" },
  { code: "admin.orders.manage", label: "مدیریت سفارش‌های پرداخت‌نشده", group: "فروش" },
  { code: "admin.provisioning.read", label: "مشاهده صف راه‌اندازی", group: "عملیات" },
  { code: "admin.provisioning.manage", label: "مدیریت صف راه‌اندازی", group: "عملیات" },
  { code: "admin.support.read", label: "مشاهده تیکت‌های پشتیبانی", group: "پشتیبانی" },
  { code: "admin.support.manage", label: "پاسخ، ارجاع و مدیریت تیکت‌ها", group: "پشتیبانی" },
  { code: "admin.leads.read", label: "مشاهده درخواست‌های مشاوره", group: "مشتریان" },
  { code: "admin.leads.manage", label: "پیگیری و مدیریت درخواست‌های مشاوره", group: "مشتریان" },
  { code: "admin.notifications.read", label: "مشاهده هشدارهای عملیاتی", group: "عملیات" },
  { code: "admin.notifications.manage", label: "مدیریت مرکز اطلاع‌رسانی", group: "عملیات" },
  { code: "admin.audit.read", label: "مشاهده گزارش تغییرات", group: "نظارت" },
  { code: "admin.system.read", label: "مشاهده وضعیت سیستم", group: "نظارت" },
  { code: "admin.roles.manage", label: "مدیریت نقش‌ها و مجوزها", group: "امنیت" },
];

const VALID_PERMISSIONS = new Set(
  ADMIN_PERMISSION_CATALOG.map((item) => item.code),
);

export function isAdminPermission(value: unknown): value is AdminPermission {
  return (
    typeof value === "string" &&
    VALID_PERMISSIONS.has(value as AdminPermission)
  );
}

const MATRIX: Record<AppRole, ReadonlySet<AdminPermission>> = {
  user: new Set(),

  support: new Set([
    "admin.dashboard.read",
    "admin.users.read",
    "admin.businesses.read",
    "admin.audit.read",
    "admin.system.read",
    "admin.subscriptions.read",
    "admin.orders.read",
    "admin.provisioning.read",
    "admin.support.read",
    "admin.support.manage",
    "admin.leads.read",
    "admin.leads.manage",
    "admin.notifications.read",
  ]),

  finance: new Set([
    "admin.dashboard.read",
    "admin.users.read",
    "admin.businesses.read",
    "admin.audit.read",
    "admin.plans.read",
    "admin.catalog.read",
    "admin.custom-services.read",
    "admin.subscriptions.read",
    "admin.orders.read",
    "admin.notifications.read",
  ]),

  admin: new Set([
    "admin.dashboard.read",
    "admin.users.read",
    "admin.users.manage",
    "admin.businesses.read",
    "admin.businesses.manage",
    "admin.services.manage",
    "admin.audit.read",
    "admin.system.read",
    "admin.catalog.manage",
    "admin.catalog.read",
    "admin.custom-services.read",
    "admin.custom-services.manage",
    "admin.plans.read",
    "admin.plans.manage",
    "admin.subscriptions.read",
    "admin.subscriptions.manage",
    "admin.orders.read",
    "admin.orders.manage",
    "admin.payment-gateways.read",
    "admin.payment-gateways.manage",
    "admin.provisioning.read",
    "admin.provisioning.manage",
    "admin.support.read",
    "admin.support.manage",
    "admin.leads.read",
    "admin.leads.manage",
    "admin.notifications.read",
  ]),

  "super-admin": new Set([
    "admin.dashboard.read",
    "admin.users.read",
    "admin.users.manage",
    "admin.businesses.read",
    "admin.businesses.manage",
    "admin.services.manage",
    "admin.audit.read",
    "admin.system.read",
    "admin.catalog.manage",
    "admin.catalog.read",
    "admin.custom-services.read",
    "admin.custom-services.manage",
    "admin.plans.read",
    "admin.plans.manage",
    "admin.subscriptions.read",
    "admin.subscriptions.manage",
    "admin.orders.read",
    "admin.orders.manage",
    "admin.payment-gateways.read",
    "admin.payment-gateways.manage",
    "admin.provisioning.read",
    "admin.provisioning.manage",
    "admin.support.read",
    "admin.support.manage",
    "admin.leads.read",
    "admin.leads.manage",
    "admin.notifications.read",
    "admin.notifications.manage",
    "admin.roles.manage",
   "admin.content.read",
   "admin.content.write",
   "admin.content.publish",
  ]),
};

export function hasAdminPermission(
  roleOrPermissions: AppRole | readonly string[],
  permission: AdminPermission,
) {
  return Array.isArray(roleOrPermissions)
    ? roleOrPermissions.includes(permission)
    : MATRIX[roleOrPermissions as AppRole].has(permission);
}

export function getDefaultAdminPermissions(role: AppRole) {
  return [...MATRIX[role]];
}
