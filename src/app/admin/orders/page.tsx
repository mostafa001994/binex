"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTehranPersianDateTime } from "@/lib/persian-date";
import { getAdminCatalogServicesApi, getAdminOrdersApi, type AdminCatalogService, type AdminOrder, type AdminPagination as Pagination } from "@/lib/api-client/admin";

const orderLabels: Record<AdminOrder["status"], string> = {
  "pending-payment": "در انتظار پرداخت", paid: "پرداخت‌شده", "payment-failed": "پرداخت ناموفق",
  canceled: "لغوشده", expired: "منقضی", refunded: "بازپرداخت‌شده", "partially-refunded": "بازپرداخت جزئی",
};
const paymentLabels: Record<AdminOrder["payments"][number]["status"], string> = {
  initiated: "ایجادشده", pending: "در انتظار", succeeded: "موفق", failed: "ناموفق",
  canceled: "لغوشده", refunded: "بازپرداخت‌شده", "partially-refunded": "بازپرداخت جزئی",
};
const typeLabels: Record<AdminOrder["items"][number]["type"], string> = {
  "new-subscription": "اشتراک جدید", renewal: "تمدید", upgrade: "ارتقا", "custom-service": "سرویس اختصاصی",
};
const periodLabels: Record<AdminOrder["items"][number]["billingPeriod"], string> = {
  monthly: "ماهانه", quarterly: "سه‌ماهه", yearly: "سالانه", custom: "سفارشی",
};

function toman(value: string) { return `${(BigInt(value) / 10n).toLocaleString("fa-IR")} تومان`; }

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [services, setServices] = useState<AdminCatalogService[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderStatus(params.get("orderStatus") || "");
    setPaymentStatus(params.get("paymentStatus") || "");
    setServiceId(params.get("serviceId") || "");
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [result, catalog] = await Promise.all([
        getAdminOrdersApi({ search, orderStatus, paymentStatus, serviceId, page }),
        getAdminCatalogServicesApi(),
      ]);
      setItems(result.items); setPagination(result.pagination); setServices(catalog.services);
    } catch (reason) {
      toast.error("دریافت سفارش‌ها انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setLoading(false); }
  }, [orderStatus, page, paymentStatus, search, serviceId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { setPage(1); }, [search, orderStatus, paymentStatus, serviceId]);

  return <div className="space-y-5">
    <AdminPageHeader title="سفارش‌ها و پرداخت‌ها" description="پیگیری مالی خریدها، نتیجه درگاه و اقلام هر سفارش؛ وضعیت پرداخت فقط از رویداد معتبر درگاه تغییر می‌کند." />
    <div className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-4">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="شماره سفارش، کسب‌وکار، کاربر یا کد پیگیری" className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none" />
      <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه وضعیت‌های سفارش</option>{Object.entries(orderLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه وضعیت‌های پرداخت</option>{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه سرویس‌ها</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
    </div>
    {loading ? <AdminTableSkeleton rows={6} /> : items.length ? <div className="space-y-4">{items.map((order) => <OrderCard key={order.id} order={order} />)}</div> : <div className="rounded-card border border-border bg-surface"><AdminEmptyState title="سفارشی ثبت نشده است" description="پس از شروع اولین خرید، سفارش و تلاش‌های پرداخت آن در این بخش نمایش داده می‌شوند." /></div>}
    {pagination ? <AdminPagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} label="سفارش" onPageChange={setPage} /> : null}
  </div>;
}

function OrderCard({ order }: { order: AdminOrder }) {
  const latestPayment = order.payments[0];
  return <Card className="p-0 overflow-hidden">
    <div className="grid gap-4 p-5 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center">
      <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-ui text-sm font-bold">سفارش {order.orderNumber}</h2><Badge>{orderLabels[order.status]}</Badge></div><p className="mt-1 font-ui text-xs text-foreground-muted">{order.businessName} · {order.createdByName || order.createdByPhone || "کاربر نامشخص"}</p></div>
      <Fact label="مبلغ نهایی" value={toman(order.totalAmount)} />
      <Fact label="آخرین پرداخت" value={latestPayment ? paymentLabels[latestPayment.status] : "بدون تلاش پرداخت"} />
      <Fact label="زمان ایجاد" value={formatTehranPersianDateTime(order.createdAt)} />
    </div>
    <details className="border-t border-border-subtle px-5 py-3">
      <summary className="font-ui cursor-pointer text-xs font-semibold text-primary">مشاهده جزئیات سفارش و پرداخت</summary>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        <section><h3 className="font-ui mb-2 text-xs font-bold">اقلام سفارش</h3><div className="space-y-2">{order.items.map((item) => <div key={item.id} className="rounded-control bg-surface-raised p-3 font-ui text-xs"><div className="flex justify-between gap-3"><span className="font-semibold">{item.serviceName} · {item.planName}</span><span>{toman(item.totalAmount)}</span></div><div className="mt-1 text-foreground-subtle">{typeLabels[item.type]} · {periodLabels[item.billingPeriod]} · تعداد {item.quantity.toLocaleString("fa-IR")}</div></div>)}</div></section>
        <section><h3 className="font-ui mb-2 text-xs font-bold">تلاش‌های پرداخت</h3>{order.payments.length ? <div className="space-y-2">{order.payments.map((payment) => <div key={payment.id} className="rounded-control bg-surface-raised p-3 font-ui text-xs"><div className="flex justify-between gap-3"><span>{payment.provider}</span><Badge>{paymentLabels[payment.status]}</Badge></div><div className="mt-1 text-foreground-subtle">{toman(payment.amount)} · {formatTehranPersianDateTime(payment.requestedAt)}</div>{payment.providerReference ? <div className="mt-1 break-all text-foreground-muted">کد پیگیری: {payment.providerReference}</div> : null}{payment.failureCode ? <div className="mt-1 text-danger">کد خطا: {payment.failureCode}</div> : null}</div>)}</div> : <p className="font-ui rounded-control bg-surface-raised p-3 text-xs text-foreground-muted">هنوز تلاشی برای پرداخت ثبت نشده است.</p>}</section>
      </div>
      <div className="mt-4 grid gap-2 font-ui text-xs sm:grid-cols-4"><Fact label="جمع اقلام" value={toman(order.subtotalAmount)} /><Fact label="تخفیف" value={toman(order.discountAmount)} /><Fact label="مالیات" value={toman(order.taxAmount)} /><Fact label="پرداخت‌شده در" value={order.paidAt ? formatTehranPersianDateTime(order.paidAt) : "—"} /></div>
      <Link href={`/admin/orders/${order.id}`} className="mt-4 inline-flex items-center gap-1 font-ui text-xs font-semibold text-primary">مدیریت و جزئیات کامل <ArrowLeft size={13}/></Link>
    </details>
  </Card>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="font-ui min-w-0"><div className="text-[10px] text-foreground-subtle">{label}</div><div className="mt-1 truncate text-xs text-foreground">{value}</div></div>; }
