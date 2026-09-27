"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const labels: Record<string, string> = {
  admin: "مدیریت",
  users: "کاربران",
  roles: "نقش‌ها و دسترسی‌ها",
  businesses: "کسب‌وکارها",
  services: "سرویس‌ها",
  "custom-services": "سرویس‌های اختصاصی",
  plans: "پلن‌ها و قیمت‌گذاری",
  "payment-gateways": "درگاه‌های پرداخت",
  subscriptions: "اشتراک‌ها",
  orders: "سفارش‌ها و پرداخت‌ها",
  payments: "پرداخت‌ها",
  automations: "اتصال‌های اتوماسیون",
  provisioning: "صف راه‌اندازی سرویس‌ها",
  audit: "لاگ تغییرات",
  support: "پشتیبانی",
  leads: "درخواست‌های مشاوره",
  alerts: "هشدارها",
  system: "وضعیت سیستم",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments
      .slice(0, index + 1)
      .join("/")}`;

    const isId =
      index > 1 &&
      !labels[segment];

    return {
      href,
      label:
        labels[segment] ||
        (isId
          ? "جزئیات"
          : segment),
      last:
        index ===
        segments.length - 1,
    };
  });

  return (
    <nav
      aria-label="مسیر صفحه"
      className="mb-4 flex min-w-0 items-center gap-1 overflow-x-auto font-ui text-[11px] text-foreground-subtle"
    >
      {crumbs.map((crumb, index) => (
        <div
          key={crumb.href}
          className="flex shrink-0 items-center gap-1"
        >
          {index > 0 ? (
            <ChevronLeft
              size={12}
              className="opacity-50"
            />
          ) : null}

          {crumb.last ? (
            <span className="font-semibold text-foreground-muted">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="transition hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
