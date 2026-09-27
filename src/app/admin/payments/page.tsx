"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Search, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { getAdminPaymentsApi, type AdminPayment, type AdminPagination as Pagination } from "@/lib/api-client/admin";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

const labels: Record<AdminPayment["status"], string> = { initiated: "ایجادشده", pending: "در انتظار", succeeded: "موفق", failed: "ناموفق", canceled: "لغوشده", refunded: "بازپرداخت‌شده", "partially-refunded": "بازپرداخت جزئی" };
function toman(value: string) { return `${(BigInt(value) / 10n).toLocaleString("fa-IR")} تومان`; }

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [summary, setSummary] = useState({ succeeded: 0, failed: 0, pending: 0, needsReview: 0 });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true); setError("");
      getAdminPaymentsApi({ search, status, provider, page }).then((result) => {
        setItems(result.items); setProviders(result.providers); setSummary(result.summary); setPagination(result.pagination);
      }).catch((reason) => setError(reason instanceof Error ? reason.message : "پرداخت‌ها قابل دریافت نیستند.")).finally(() => setLoading(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [page, provider, search, status]);
  useEffect(() => { setPage(1); }, [provider, search, status]);

  return <div className="space-y-5">
    <AdminPageHeader title="دفتر پرداخت‌ها" description="مشاهده تلاش‌های پرداخت، نتیجه درگاه و مغایرت‌های مالی؛ این بخش اجازه موفق‌کردن دستی پرداخت را نمی‌دهد." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<CheckCircle2 size={16}/>} label="موفق" value={summary.succeeded} tone="success"/>
      <Metric icon={<XCircle size={16}/>} label="ناموفق" value={summary.failed} tone="error"/>
      <Metric icon={<Clock3 size={16}/>} label="در انتظار" value={summary.pending}/>
      <Metric icon={<AlertTriangle size={16}/>} label="نیازمند بررسی" value={summary.needsReview} tone="warning"/>
    </div>
    <AdminFilterBar onReset={() => { setSearch(""); setStatus(""); setProvider(""); }} hasActiveFilters={Boolean(search || status || provider)}>
      <label className="relative block min-w-0 xl:w-[340px]"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="شماره سفارش، کسب‌وکار یا کد پیگیری" className="font-ui h-10 w-full rounded-control border border-border bg-background pr-9 pl-3 text-xs outline-none"/></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه وضعیت‌ها</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={provider} onChange={(event) => setProvider(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه درگاه‌ها</option>{providers.map((item) => <option key={item} value={item}>{item}</option>)}</select>
    </AdminFilterBar>
    {error ? <div className="rounded-card border border-error/20 bg-error/[0.04] p-4 font-ui text-sm text-error">{error}</div> : loading ? <AdminTableSkeleton rows={7}/> : items.length ? <>
      <div className="grid gap-3 md:hidden">{items.map((payment) => <article key={payment.id} className="rounded-card border border-border bg-surface p-4 font-ui text-xs">
        <div className="flex items-start justify-between gap-3"><div><Link href={`/admin/orders/${payment.orderId}`} className="font-semibold text-primary">سفارش {payment.orderNumber}</Link><div className="mt-1 text-foreground-muted">{payment.businessName}</div></div><Badge variant={payment.status === "succeeded" ? "success" : payment.status === "failed" ? "error" : "default"}>{labels[payment.status]}</Badge></div>
        <dl className="mt-4 grid grid-cols-2 gap-3"><MobileFact label="مبلغ" value={toman(payment.amount)}/><MobileFact label="درگاه" value={payment.provider}/><MobileFact label="زمان" value={formatTehranPersianDateTime(payment.requestedAt)}/><MobileFact label="تطبیق" value={payment.reconciliation.status === "consistent" ? "سازگار" : "نیازمند بررسی"}/></dl>
        {payment.providerReference ? <div className="mt-3 break-all rounded-control bg-surface-raised p-2 text-[10px] text-foreground-muted">کد پیگیری: {payment.providerReference}</div> : null}
        {payment.reconciliation.issues.length ? <div className="mt-2 text-[10px] leading-5 text-warning">{payment.reconciliation.issues.join(" ")}</div> : null}
      </article>)}</div>
      <div className="hidden overflow-hidden rounded-card border border-border bg-surface md:block"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-right"><thead className="bg-surface-raised/70 font-ui text-[11px] text-foreground-subtle"><tr><th className="px-4 py-3">سفارش</th><th className="px-4 py-3">کسب‌وکار</th><th className="px-4 py-3">درگاه</th><th className="px-4 py-3">مبلغ</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">تطبیق</th><th className="px-4 py-3">زمان</th></tr></thead><tbody>{items.map((payment) => <tr key={payment.id} className="border-t border-border-subtle font-ui text-xs"><td className="px-4 py-3"><Link href={`/admin/orders/${payment.orderId}`} className="font-semibold text-primary">{payment.orderNumber}</Link>{payment.providerReference ? <div className="mt-1 max-w-44 truncate text-[10px] text-foreground-subtle">{payment.providerReference}</div> : null}</td><td className="px-4 py-3">{payment.businessName}</td><td className="px-4 py-3">{payment.provider}</td><td className="px-4 py-3">{toman(payment.amount)}</td><td className="px-4 py-3"><Badge variant={payment.status === "succeeded" ? "success" : payment.status === "failed" ? "error" : "default"}>{labels[payment.status]}</Badge></td><td className="px-4 py-3">{payment.reconciliation.status === "consistent" ? <Badge variant="success">سازگار</Badge> : <div><Badge variant="warning">نیازمند بررسی</Badge><div className="mt-1 max-w-56 text-[10px] text-warning">{payment.reconciliation.issues.join(" ")}</div></div>}</td><td className="px-4 py-3 text-foreground-muted">{formatTehranPersianDateTime(payment.requestedAt)}</td></tr>)}</tbody></table></div></div>
    </> : <div className="rounded-card border border-border bg-surface"><AdminEmptyState title="پرداختی ثبت نشده است" description="با شروع اولین تلاش پرداخت، اطلاعات آن اینجا نمایش داده می‌شود."/></div>}
    {pagination ? <AdminPagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} label="پرداخت" onPageChange={setPage}/> : null}
  </div>;
}

function MobileFact({ label, value }: { label: string; value: string }) { return <div><dt className="text-[10px] text-foreground-subtle">{label}</dt><dd className="mt-1 break-words text-foreground">{value}</dd></div>; }

function Metric({ icon, label, value, tone = "default" }: { icon: React.ReactNode; label: string; value: number; tone?: "default" | "success" | "error" | "warning" }) {
  const colors = tone === "success" ? "text-success" : tone === "error" ? "text-error" : tone === "warning" ? "text-warning" : "text-primary";
  return <div className="rounded-card border border-border bg-surface p-4"><div className={`flex items-center gap-2 font-ui text-xs ${colors}`}>{icon}{label}</div><div className="mt-2 font-ui text-xl font-bold">{value.toLocaleString("fa-IR")}</div></div>;
}
