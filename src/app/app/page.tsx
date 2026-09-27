"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  Headphones,
  Layers3,
  RefreshCw,
  Settings2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { AppPage } from "@/components/app/app-page";
import { CurrentUserBadge } from "@/components/auth/current-user-badge";
import { CurrentBusinessBadge } from "@/components/business/current-business-badge";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getDashboardApi,
  type DashboardApiPayload,
} from "@/lib/api-client/dashboard";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

const roleLabels = {
  owner: "مالک",
  admin: "مدیر کسب‌وکار",
  member: "عضو",
} as const;

const actionPresentation = {
  service: { icon: Settings2, label: "راه‌اندازی", variant: "info" as const },
  billing: { icon: CreditCard, label: "مالی", variant: "warning" as const },
  support: { icon: Headphones, label: "پشتیبانی", variant: "error" as const },
  notification: { icon: Bell, label: "اعلان", variant: "default" as const },
};

export default function DashboardHomePage() {
  const [dashboard, setDashboard] = useState<DashboardApiPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDashboard(await getDashboardApi());
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "داشبورد قابل دریافت نیست.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <AppPage>
        <Card className="flex min-h-64 flex-col items-center justify-center text-center" role="alert">
          <AlertCircle size={24} className="text-error" />
          <h1 data-display-title="true" className="mt-4 text-xl font-bold">
            دریافت داشبورد انجام نشد
          </h1>
          <p className="mt-2 font-ui text-sm text-foreground-muted">{error}</p>
          <Button
            onClick={load}
            variant="secondary"
            leadingIcon={<RefreshCw size={15} />}
            className="mt-5"
          >
            تلاش دوباره
          </Button>
        </Card>
      </AppPage>
    );
  }

  const enabledServices = dashboard.services.filter(
    (service) => service.businessServiceId !== null,
  );
  const isOwner = dashboard.membership.role === "owner";

  return (
    <AppPage width="wide">
      <PageHeader
        title="خانه"
        description="خلاصه وضعیت کسب‌وکار و مهم‌ترین اقدام‌هایی که در Binix دارید."
        actions={
          <>
            <CurrentUserBadge />
            <CurrentBusinessBadge />
            <ButtonLink
              href="/app/services"
              variant="secondary"
              leadingIcon={<ArrowLeft size={16} />}
            >
              سرویس‌های من
            </ButtonLink>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="خلاصه حساب">
        <MetricCard
          icon={<Layers3 size={17} />}
          label="سرویس‌های آماده"
          value={`${dashboard.summary.readyServices.toLocaleString("fa-IR")} از ${dashboard.summary.enabledServices.toLocaleString("fa-IR")}`}
          href="/app/services"
        />
        <MetricCard
          icon={<CreditCard size={17} />}
          label={isOwner ? "اشتراک‌ها" : "نقش شما"}
          value={
            isOwner
              ? (dashboard.summary.subscriptionCount ?? 0).toLocaleString("fa-IR")
              : roleLabels[dashboard.membership.role]
          }
          hint={
            isOwner && dashboard.summary.subscriptionNeedsAttention
              ? `${dashboard.summary.subscriptionNeedsAttention.toLocaleString("fa-IR")} مورد نیازمند پیگیری`
              : undefined
          }
          href={isOwner ? "/app/billing" : undefined}
          attention={Boolean(dashboard.summary.subscriptionNeedsAttention)}
        />
        <MetricCard
          icon={<Bell size={17} />}
          label="اعلان خوانده‌نشده"
          value={dashboard.summary.unreadNotifications.toLocaleString("fa-IR")}
          href="/app/notifications"
          attention={dashboard.summary.unreadNotifications > 0}
        />
        <MetricCard
          icon={<Headphones size={17} />}
          label="تیکت باز شما"
          value={dashboard.summary.openTickets.toLocaleString("fa-IR")}
          href="/app/support"
          attention={dashboard.summary.openTickets > 0}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge
                variant={dashboard.nextActions.some((item) => item.priority === "high") ? "warning" : "success"}
              >
                {dashboard.nextActions.length ? "نیازمند توجه" : "همه‌چیز مرتب است"}
              </Badge>
              <h2 data-display-title="true" className="mt-4 text-2xl font-bold">
                اقدام‌های بعدی شما
              </h2>
              <p className="mt-2 font-ui text-sm leading-7 text-foreground-muted">
                این فهرست از وضعیت واقعی سرویس، اشتراک، سفارش، اعلان و پشتیبانی ساخته می‌شود.
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-card border border-primary/15 bg-primary/10 text-primary">
              <WandSparkles size={20} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {dashboard.nextActions.length > 0 ? (
              dashboard.nextActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))
            ) : enabledServices.length > 0 ? (
              <div className="rounded-card border border-success/20 bg-success/[0.05] p-4 sm:col-span-2">
                <div className="flex items-center gap-2 font-ui text-sm font-semibold text-success">
                  <CheckCircle2 size={16} />
                  در حال حاضر اقدام فوری ندارید
                </div>
                <p className="mt-2 font-ui text-xs leading-6 text-foreground-muted">
                  اگر وضعیت سرویس، پرداخت یا پشتیبانی تغییر کند، اقدام بعدی اینجا ظاهر می‌شود.
                </p>
              </div>
            ) : (
              <div className="rounded-card border border-primary/20 bg-primary/[0.05] p-4 sm:col-span-2">
                <div className="flex items-center gap-2 font-ui text-sm font-semibold">
                  <Sparkles size={16} className="text-primary" />
                  هنوز سرویسی به این کسب‌وکار متصل نشده است
                </div>
                <ButtonLink href="/app/services" size="sm" className="mt-4">
                  مشاهده سرویس‌ها
                </ButtonLink>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <CircleDashed size={18} className="text-primary" />
            <h2 data-display-title="true" className="text-lg font-bold">
              وضعیت حساب
            </h2>
          </div>
          <div className="mt-5 space-y-4">
            <StatusRow label="کسب‌وکار" value={dashboard.business.name} />
            <StatusRow label="نقش" value={roleLabels[dashboard.membership.role]} />
            <StatusRow
              label="سرویس متصل"
              value={dashboard.summary.enabledServices.toLocaleString("fa-IR")}
            />
            {isOwner && (
              <StatusRow
                label="سفارش باز"
                value={(dashboard.summary.openOrders ?? 0).toLocaleString("fa-IR")}
                attention={Boolean(dashboard.summary.openOrders)}
              />
            )}
          </div>
        </Card>
      </section>

      <ServicesSection services={enabledServices} />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <RecentNotifications items={dashboard.recentNotifications} />
        <QuickAccess isOwner={isOwner} />
      </section>
    </AppPage>
  );
}

function ActionCard({
  action,
}: {
  action: DashboardApiPayload["nextActions"][number];
}) {
  const presentation = actionPresentation[action.kind];
  const Icon = presentation.icon;

  return (
    <Link
      href={action.href}
      className="group rounded-card border border-border bg-surface-raised/45 p-4 transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 items-center justify-center rounded-control bg-primary/10 text-primary">
          <Icon size={16} />
        </div>
        <Badge variant={presentation.variant}>{presentation.label}</Badge>
      </div>
      <div className="mt-4 font-ui text-sm font-semibold">{action.title}</div>
      <p className="mt-1 font-ui text-xs leading-6 text-foreground-muted">
        {action.description}
      </p>
      <div className="mt-3 flex justify-end">
        <ArrowLeft size={15} className="text-primary transition group-hover:-translate-x-0.5" />
      </div>
    </Link>
  );
}

function ServicesSection({ services }: { services: DashboardApiPayload["services"] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 data-display-title="true" className="text-xl font-bold">
            سرویس‌های کسب‌وکار
          </h2>
          <p className="mt-1 font-ui text-sm text-foreground-muted">
            دسترسی سریع به سرویس‌های متصل و وضعیت فعلی آن‌ها.
          </p>
        </div>
        <Link href="/app/services" className="font-ui inline-flex items-center gap-2 text-xs font-medium text-primary">
          مشاهده همه
          <ArrowLeft size={14} />
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.appHref ?? service.marketingHref}
              className="group rounded-card border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-ui text-xs text-foreground-subtle">{service.category}</div>
                  <h3 data-display-title="true" className="mt-1 text-lg font-bold">{service.name}</h3>
                </div>
                <ServiceStateBadge status={service.businessStatus} />
              </div>
              <p className="mt-4 font-ui text-sm leading-7 text-foreground-muted">{service.description}</p>
              <div className="mt-5 flex justify-end border-t border-border-subtle pt-4">
                <ArrowLeft size={15} className="text-primary transition group-hover:-translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed py-10 text-center">
          <Layers3 size={22} className="mx-auto text-primary" />
          <h3 className="mt-4 font-ui text-base font-semibold">هنوز سرویس متصلی ندارید</h3>
          <p className="mt-2 font-ui text-sm text-foreground-muted">سرویس‌های در دسترس را بررسی و راهکار مناسب کسب‌وکارتان را انتخاب کنید.</p>
        </Card>
      )}
    </section>
  );
}

function RecentNotifications({
  items,
}: {
  items: DashboardApiPayload["recentNotifications"];
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h2 data-display-title="true" className="text-lg font-bold">آخرین اعلان‌ها</h2>
        </div>
        <Link href="/app/notifications" className="font-ui text-xs text-primary">مشاهده همه</Link>
      </div>
      <div className="mt-5">
        {items.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href || "/app/notifications"}
                className="block py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-ui text-sm font-semibold">{item.title}</div>
                  {!item.readAt && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="خوانده‌نشده" />}
                </div>
                <p className="mt-1 line-clamp-2 font-ui text-xs leading-6 text-foreground-muted">{item.message}</p>
                <time className="mt-1 block font-ui text-[11px] text-foreground-subtle">{formatTehranPersianDateTime(item.createdAt)}</time>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border py-8 text-center">
            <CheckCircle2 size={20} className="mx-auto text-success" />
            <p className="mt-3 font-ui text-sm font-semibold">اعلان جدیدی ندارید</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function QuickAccess({ isOwner }: { isOwner: boolean }) {
  const links = [
    { href: "/app/services", label: "مدیریت سرویس‌ها", icon: Layers3 },

{
  href: "/app/catalog",
  label: "کاتالوگ سرویس‌ها",
  icon: Layers3,
},
    { href: "/app/support", label: "پشتیبانی", icon: Headphones },
    ...(isOwner
      ? [{ href: "/app/billing", label: "اشتراک و صورت‌حساب", icon: CreditCard }]
      : []),
  ];

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <h2 data-display-title="true" className="text-lg font-bold">دسترسی سریع</h2>
      </div>
      <div className="mt-5 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-control border border-border bg-surface-raised/40 px-3 py-3 font-ui text-sm transition hover:bg-surface-hover"
            >
              <span className="flex items-center gap-2"><Icon size={16} className="text-primary" />{item.label}</span>
              <ArrowLeft size={14} className="text-foreground-subtle" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  href,
  attention = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  attention?: boolean;
}) {
  const content = (
    <Card className="h-full p-4">
      <div className={attention ? "flex items-center gap-2 text-warning" : "flex items-center gap-2 text-primary"}>
        {icon}
        <span className="font-ui text-xs text-foreground-muted">{label}</span>
      </div>
      <div className="mt-3 font-ui text-xl font-bold">{value}</div>
      {hint && <div className="mt-1 font-ui text-xs text-warning">{hint}</div>}
    </Card>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function StatusRow({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: string;
  attention?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
      <span className="font-ui text-xs text-foreground-muted">{label}</span>
      <span className={attention ? "font-ui text-xs font-semibold text-warning" : "font-ui text-xs font-semibold"}>{value}</span>
    </div>
  );
}

function ServiceStateBadge({
  status,
}: {
  status: DashboardApiPayload["services"][number]["businessStatus"];
}) {
  if (status === "active") return <Badge variant="success">فعال</Badge>;
  if (status === "setup") return <Badge variant="warning">نیازمند راه‌اندازی</Badge>;
  if (status === "paused") return <Badge variant="error">متوقف</Badge>;
  if (status === "coming-soon") return <Badge>به‌زودی</Badge>;
  return <Badge>فعال نشده</Badge>;
}

function DashboardSkeleton() {
  return (
    <AppPage width="wide">
      <div className="space-y-6" aria-busy="true" aria-label="در حال دریافت داشبورد">
        <div className="h-16 animate-pulse rounded-card bg-surface-raised" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-card bg-surface-raised" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-card bg-surface-raised" />
          <div className="h-72 animate-pulse rounded-card bg-surface-raised" />
        </div>
      </div>
    </AppPage>
  );
}
