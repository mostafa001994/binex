"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Building2, CircleCheck, CirclePause, CreditCard, Layers3, ReceiptText, RefreshCcw, ScrollText, ServerCog, Users, Workflow } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { useAdminSession } from "@/components/admin/admin-gate";
import { hasAdminPermission, type AdminPermission } from "@/lib/admin-permissions";
import { getAuditActionLabel } from "@/lib/audit";
import { getAdminDashboardApi } from "@/lib/api-client/admin";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

type DashboardData = Awaited<ReturnType<typeof getAdminDashboardApi>>;

export default function AdminDashboardPage() {
  const { user } = useAdminSession();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getAdminDashboardApi().then(setData).catch((reason) => {
      toast.error("دریافت نمای کلی انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    });
  }, []);

  const alerts = data ? [
    { count: data.counts.failedProvisioning, title: "راه‌اندازی ناموفق", description: "jobهای n8n نیازمند بررسی یا تلاش مجدد هستند.", href: "/admin/provisioning?status=failed", permission: "admin.provisioning.read" as AdminPermission },
    { count: data.counts.failedPayments, title: "پرداخت ناموفق", description: "سفارش‌هایی با نتیجه مالی ناموفق وجود دارند.", href: "/admin/orders?paymentStatus=failed", permission: "admin.orders.read" as AdminPermission },
    { count: data.counts.pastDueSubscriptions, title: "اشتراک سررسید گذشته", description: "تمدید یا پیگیری این اشتراک‌ها باید بررسی شود.", href: "/admin/subscriptions?status=past-due", permission: "admin.subscriptions.read" as AdminPermission },
    { count: data.counts.suspendedBusinesses, title: "کسب‌وکار تعلیق‌شده", description: "این کسب‌وکارها امکان استفاده عملیاتی ندارند.", href: "/admin/businesses?status=suspended", permission: "admin.businesses.read" as AdminPermission },
  ].filter((item) => item.count > 0 && hasAdminPermission(user.permissions, item.permission)) : [];

  return <div className="space-y-6">
    <AdminPageHeader title="نمای کلی مدیریت" description="تصویر لحظه‌ای از کاربران، فروش ثبت‌شده، اشتراک‌ها و عملیات n8n در Binix." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Users size={17} />} label="کاربران" value={data?.counts.users} />
      <Metric icon={<Building2 size={17} />} label="کسب‌وکارها" value={data?.counts.businesses} />
      <Metric icon={<RefreshCcw size={17} />} label="اشتراک‌های فعال" value={data?.counts.activeSubscriptions} />
      <Metric icon={<CreditCard size={17} />} label="فروش پرداخت‌شده ۳۰ روز" value={data ? `${(BigInt(data.counts.paidVolume30d) / 10n).toLocaleString("fa-IR")} تومان` : undefined} />
      <Metric icon={<Layers3 size={17} />} label="سرویس‌های فعال" value={data?.counts.activeServices} />
      <Metric icon={<ReceiptText size={17} />} label="سفارش‌های منتظر پرداخت" value={data?.counts.pendingOrders} />
      <Metric icon={<Workflow size={17} />} label="کارهای در صف n8n" value={data?.counts.queuedProvisioning} />
      <Metric icon={<CirclePause size={17} />} label="سرویس‌های متوقف" value={data?.counts.pausedServices} />
    </div>

    <section>
      <h2 data-display-title="true" className="text-lg font-bold">نیازمند توجه</h2>
      {!data ? <Card className="mt-3 font-ui text-xs text-foreground-muted">در حال محاسبه وضعیت عملیاتی…</Card> : alerts.length ? <div className="mt-3 grid gap-3 md:grid-cols-2">{alerts.map((alert) => <Link key={alert.href} href={alert.href} className="group rounded-card border border-danger/25 bg-danger/5 p-4 transition hover:border-danger/45">
        <div className="flex items-start justify-between gap-4"><div><div className="font-ui text-sm font-bold text-danger">{alert.title}</div><p className="mt-1 font-ui text-xs text-foreground-muted">{alert.description}</p></div><span className="font-ui rounded-full bg-danger/10 px-2.5 py-1 text-sm font-bold text-danger">{alert.count.toLocaleString("fa-IR")}</span></div>
        <div className="mt-3 flex items-center gap-1 font-ui text-xs text-primary">بررسی موارد <ArrowLeft size={13} className="transition group-hover:-translate-x-0.5" /></div>
      </Link>)}</div> : <div className="mt-3 flex items-center gap-3 rounded-card border border-success/20 bg-success/5 p-4"><CircleCheck size={20} className="text-success" /><div><div className="font-ui text-sm font-bold text-success">هشدار بحرانی فعالی وجود ندارد</div><p className="mt-1 font-ui text-xs text-foreground-muted">پرداخت‌ها، اشتراک‌ها و صف راه‌اندازی در وضعیت عادی هستند.</p></div></div>}
    </section>

    <section>
      <h2 data-display-title="true" className="text-lg font-bold">دسترسی سریع</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickLink href="/admin/users" icon={<Users size={16} />} label="کاربران" permission="admin.users.read" role={user.role} />
        <QuickLink href="/admin/businesses" icon={<Building2 size={16} />} label="کسب‌وکارها" permission="admin.businesses.read" role={user.role} />
        <QuickLink href="/admin/subscriptions" icon={<RefreshCcw size={16} />} label="اشتراک‌ها" permission="admin.subscriptions.read" role={user.role} />
        <QuickLink href="/admin/orders" icon={<ReceiptText size={16} />} label="سفارش‌ها و پرداخت‌ها" permission="admin.orders.read" role={user.role} />
        <QuickLink href="/admin/provisioning" icon={<Workflow size={16} />} label="صف راه‌اندازی" permission="admin.provisioning.read" role={user.role} />
        <QuickLink href="/admin/audit" icon={<ScrollText size={16} />} label="گزارش تغییرات" permission="admin.audit.read" role={user.role} />
        <QuickLink href="/admin/system" icon={<ServerCog size={16} />} label="وضعیت سیستم" permission="admin.system.read" role={user.role} />
      </div>
    </section>

    <Card>
      <div className="flex items-center justify-between gap-4"><h2 data-display-title="true" className="text-lg font-bold">آخرین تغییرات</h2><Link href="/admin/audit" className="font-ui inline-flex items-center gap-1 text-xs text-primary">مشاهده همه <ArrowLeft size={13} /></Link></div>
      <div className="mt-4 space-y-2">{data?.recentAudit.length ? data.recentAudit.map((item) => <div key={item.id} className="flex flex-col gap-1 rounded-control border border-border-subtle bg-surface-raised/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="font-ui text-xs">{getAuditActionLabel(item.action)}</span><span className="font-ui text-[10px] text-foreground-subtle">{formatTehranPersianDateTime(item.createdAt)}</span></div>) : <p className="font-ui text-sm text-foreground-muted">هنوز تغییر مدیریتی ثبت نشده است.</p>}</div>
    </Card>
  </div>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value?: number | string }) {
  return <Card className="transition hover:-translate-y-0.5 hover:border-primary/20"><div className="flex items-center gap-2 text-primary">{icon}<span className="font-ui text-xs text-foreground-muted">{label}</span></div><div className="mt-3 font-ui text-2xl font-bold">{typeof value === "number" ? value.toLocaleString("fa-IR") : value ?? "—"}</div></Card>;
}

function QuickLink({ href, icon, label, permission, role }: { href: string; icon: ReactNode; label: string; permission: AdminPermission; role: Parameters<typeof hasAdminPermission>[0] }) {
  if (!hasAdminPermission(role, permission)) return null;
  return <Link href={href} className="group flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 shadow-binix-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-surface-hover"><div className="flex items-center gap-2"><span className="text-primary">{icon}</span><span className="font-ui text-xs font-semibold">{label}</span></div><ArrowLeft size={14} className="text-foreground-subtle transition group-hover:-translate-x-0.5 group-hover:text-primary" /></Link>;
}
