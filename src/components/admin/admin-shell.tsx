"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Gauge,
  ScrollText,
  ServerCog,
  Layers3,
  CreditCard,
  ReceiptText,
  Workflow,
  RefreshCcw,
  ShieldCheck,
  Users,
  WalletCards,
  Webhook,
  LifeBuoy,
  BellRing,
  UserRoundSearch,
  ChevronDown,
  BookOpenText,
  Images,
  SearchCheck,
  CircleHelp,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AdminGate,
  useAdminSession,
} from "@/components/admin/admin-gate";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/admin-permissions";
import { cn } from "@/lib/cn";
import { NotificationButton } from "@/components/shell/notification-button";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: AdminPermission;
};

const groups: Array<{ label: string; items: AdminNavItem[] }> = [
  {
    label: "شروع",
    items: [
      {
        href: "/admin",
        label: "نمای کلی",
        icon: Gauge,
        permission: "admin.dashboard.read",
      },
    ],
  },
  {
    label: "مدیریت مشتریان",
    items: [
      { href: "/admin/users", label: "کاربران", icon: Users, permission: "admin.users.read" },
      { href: "/admin/businesses", label: "کسب‌وکارها", icon: Building2, permission: "admin.businesses.read" },
      { href: "/admin/leads", label: "درخواست‌های مشاوره", icon: UserRoundSearch, permission: "admin.leads.read" },
      { href: "/admin/support", label: "پشتیبانی", icon: LifeBuoy, permission: "admin.support.read" },
    ],
  },
  {
    label: "محصول و فروش",
    items: [
      { href: "/admin/services", label: "سرویس‌ها", icon: Layers3, permission: "admin.catalog.manage" },
      { href: "/admin/custom-services", label: "سرویس‌های اختصاصی", icon: Sparkles, permission: "admin.custom-services.read" },
      { href: "/admin/plans", label: "پلن‌ها و قیمت‌گذاری", icon: CreditCard, permission: "admin.plans.read" },
      { href: "/admin/subscriptions", label: "اشتراک‌ها", icon: RefreshCcw, permission: "admin.subscriptions.read" },
      { href: "/admin/payment-gateways", label: "درگاه‌های پرداخت", icon: WalletCards, permission: "admin.payment-gateways.read",},
      { href: "/admin/notifications/templates", label: "قالب پیام‌ها", icon: BellRing, permission: "admin.notifications.read" },
    ],
  },


  {
    label: "محتوا",
    items: [
      {
        href: "/admin/blog",
        label: "وبلاگ",
        icon: BookOpenText,
        permission: "admin.content.read",
      },
      {
        href: "/admin/media",
        label: "کتابخانه رسانه",
        icon: Images,
        permission: "admin.content.read",
      },
      {
        href: "/admin/seo",
        label: "مدیریت SEO",
        icon: SearchCheck,
        permission: "admin.content.read",
      },
      {
        href: "/admin/faqs",
        label: "سوالات متداول",
        icon: CircleHelp,
        permission: "admin.content.read",
      },
    ],
  },



  {
    label: "مالی",
    items: [
      { href: "/admin/orders", label: "سفارش‌ها", icon: ReceiptText, permission: "admin.orders.read" },
      { href: "/admin/payments", label: "پرداخت‌ها", icon: WalletCards, permission: "admin.orders.read" },
    ],
  },
  {
    label: "عملیات",
    items: [
      { href: "/admin/automations", label: "اتصال‌های اتوماسیون", icon: Webhook, permission: "admin.provisioning.read" },
      { href: "/admin/provisioning", label: "راه‌اندازی سرویس‌ها", icon: Workflow, permission: "admin.provisioning.read" },
      { href: "/admin/alerts", label: "هشدارها", icon: BellRing, permission: "admin.notifications.read" },
      { href: "/admin/notifications", label: "مرکز اطلاع‌رسانی", icon: BellRing, permission: "admin.notifications.read" },
    ],
  },
  {
    label: "سیستم",
    items: [
      { href: "/admin/roles", label: "نقش‌ها و دسترسی‌ها", icon: ShieldCheck, permission: "admin.roles.manage" },
      { href: "/admin/audit", label: "گزارش تغییرات", icon: ScrollText, permission: "admin.audit.read" },
      { href: "/admin/system", label: "وضعیت سیستم", icon: ServerCog, permission: "admin.system.read" },
    ],
  },
];

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminGate>
      <AdminShellContent>{children}</AdminShellContent>
    </AdminGate>
  );
}

function AdminShellContent({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAdminSession();
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasAdminPermission(user.permissions, item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-surface/92 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-4 px-4 md:px-6">
            <div className="min-w-0">
              <div
                data-display-title="true"
                className="truncate text-lg font-bold"
              >
                مدیریت Binix
              </div>
              <div className="font-ui text-[10px] text-foreground-subtle">
                مرکز عملیات و مدیریت
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationButton viewAllHref="/admin/alerts" />
              <Link
                href="/app"
                className="font-ui inline-flex h-9 shrink-0 items-center gap-2 rounded-control border border-border bg-surface-raised px-3 text-xs text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                <span className="hidden sm:inline">بازگشت به پنل</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </header>

        <div className="border-b border-border-subtle bg-surface/60 lg:hidden">
          <details className="group mx-auto max-w-[1480px] px-4 py-2 md:px-6">
            <summary className="font-ui flex min-h-10 cursor-pointer list-none items-center justify-between rounded-control border border-border bg-surface px-3 text-xs font-semibold [&::-webkit-details-marker]:hidden">
              بخش‌های مدیریت
              <ChevronDown size={15} className="transition group-open:rotate-180" />
            </summary>
            <nav aria-label="منوی مدیریت" className="mt-2 grid max-h-[65dvh] gap-3 overflow-x-auto overflow-y-auto rounded-card border border-border bg-surface p-3 sm:grid-cols-2">
              {visibleGroups.map((group) => (
                <div key={group.label}>
                  <div className="px-2 pb-1 font-ui text-[10px] font-semibold text-foreground-subtle">{group.label}</div>
                  <div className="space-y-1">
                    {group.items.map((item) => <AdminNavLink key={item.href} item={item} pathname={pathname} compact />)}
                  </div>
                </div>
              ))}
            </nav>
          </details>
        </div>

        <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-5 md:px-6 lg:grid-cols-[224px_minmax(0,1fr)] lg:py-6">
          <aside className="sticky top-[88px] hidden max-h-[calc(100dvh-112px)] overflow-y-auto rounded-card border border-border bg-surface p-2 shadow-binix-sm lg:block">
            <nav aria-label="منوی مدیریت" className="space-y-4 py-1">
              {visibleGroups.map((group) => (
                <div key={group.label}>
                  <div className="px-3 pb-1.5 font-ui text-[10px] font-semibold text-foreground-subtle">{group.label}</div>
                  <div className="space-y-1">
                    {group.items.map((item) => <AdminNavLink key={item.href} item={item} pathname={pathname} />)}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            <AdminBreadcrumbs />
            {children}
          </main>
        </div>
      </div>
  );
}

function AdminNavLink({ item, pathname, compact = false }: { item: AdminNavItem; pathname: string; compact?: boolean }) {
  const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "font-ui flex items-center gap-3 rounded-control px-3 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        compact ? "py-2" : "py-2.5",
        active ? "bg-primary/10 font-semibold text-primary" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <item.icon size={15} aria-hidden="true" />
      {item.label}
    </Link>
  );
}
