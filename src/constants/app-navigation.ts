import type { IconKey } from "@/constants/icon-registry";

export type NavigationItem = {
  href: string;
  label: string;
  icon: IconKey;
};

export const appPrimaryNavigation: NavigationItem[] = [
  { href: "/app", label: "خانه", icon: "home" },
  { href: "/app/services", label: "سرویس‌های من", icon: "layout-grid" },
  { href: "/app/custom-services", label: "سرویس‌های اختصاصی", icon: "sparkles" },
  { href: "/app/reports", label: "گزارش‌ها", icon: "bar-chart" },
  { href: "/app/notifications", label: "اعلان‌ها", icon: "bell" },
];

export const appSecondaryNavigation: NavigationItem[] = [
  { href: "/app/billing", label: "اشتراک و صورت‌حساب", icon: "credit-card" },
  { href: "/app/support", label: "پشتیبانی", icon: "message" },
  { href: "/app/settings", label: "تنظیمات", icon: "settings" },
];

export const mobileNavigation: NavigationItem[] = [
  { href: "/app", label: "خانه", icon: "home" },
  { href: "/app/services", label: "سرویس‌ها", icon: "layout-grid" },
  { href: "/app/custom-services", label: "اختصاصی", icon: "sparkles" },
  { href: "/app/reports", label: "گزارش‌ها", icon: "bar-chart" },
  { href: "/app/billing", label: "اشتراک", icon: "credit-card" },
  { href: "/app/support", label: "پشتیبانی", icon: "message" },
  { href: "/app/settings", label: "تنظیمات", icon: "settings" },
];

export const marketingNavigation = [
  { label: "نحوه همکاری", href: "/#how-it-works" },
  { label: "کاربردها", href: "/#use-cases" },
  { label: "انتخاب راهکار", href: "/#pricing" },
] as const;
