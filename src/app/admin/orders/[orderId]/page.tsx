"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAdminSession } from "@/components/admin/admin-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { formatTehranPersianDateTime } from "@/lib/persian-date";
import { getAdminOrderApi, transitionAdminUnpaidOrderApi, updateAdminOrderNoteApi, type AdminOrder } from "@/lib/api-client/admin";

const orderLabels: Record<AdminOrder["status"], string> = { "pending-payment": "در انتظار پرداخت", paid: "پرداخت‌شده", "payment-failed": "پرداخت ناموفق", canceled: "لغوشده", expired: "منقضی", refunded: "بازپرداخت‌شده", "partially-refunded": "بازپرداخت جزئی" };
const paymentLabels: Record<AdminOrder["payments"][number]["status"], string> = { initiated: "ایجادشده", pending: "در انتظار", succeeded: "موفق", failed: "ناموفق", canceled: "لغوشده", refunded: "بازپرداخت‌شده", "partially-refunded": "بازپرداخت جزئی" };
const itemLabels: Record<AdminOrder["items"][number]["type"], string> = { "new-subscription": "اشتراک جدید", renewal: "تمدید", upgrade: "ارتقا", "custom-service": "سرویس اختصاصی" };
function toman(value: string) { return `${(BigInt(value) / 10n).toLocaleString("fa-IR")} تومان`; }

export default function AdminOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { user } = useAdminSession();
  const canManage = hasAdminPermission(user.permissions, "admin.orders.manage");
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<"cancel" | "expire" | null>(null);

  const refresh = useCallback(async () => {
    try { const result = await getAdminOrderApi(orderId); setOrder(result.order); setNote(result.order.internalNote ?? ""); }
    catch (reason) { toast.error("سفارش دریافت نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setLoading(false); }
  }, [orderId]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function saveNote() {
    setSaving(true);
    try { await updateAdminOrderNoteApi(orderId, note); toast.success("یادداشت ذخیره شد"); await refresh(); }
    catch (reason) { toast.error("ذخیره یادداشت انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setSaving(false); }
  }

  async function transition(operation: "cancel" | "expire") {
    setSaving(true);
    try { await transitionAdminUnpaidOrderApi(orderId, operation); toast.success(operation === "cancel" ? "سفارش لغو شد" : "سفارش منقضی شد"); await refresh(); }
    catch (reason) { toast.error("تغییر وضعیت سفارش انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setSaving(false); }
  }

  if (loading || !order) return <div className="h-64 animate-pulse rounded-card bg-surface-raised"/>;
  const mutable = ["pending-payment", "payment-failed"].includes(order.status) && !order.payments.some((payment) => payment.status === "succeeded");
  const succeededPayment = order.payments.find((payment) => ["succeeded", "refunded", "partially-refunded"].includes(payment.status));
  const financialStatus = ["paid", "refunded", "partially-refunded"].includes(order.status);
  const reconciliationIssues = [
    ...(succeededPayment && !financialStatus ? ["پرداخت مالی ثبت شده اما وضعیت سفارش مالی نیست."] : []),
    ...(succeededPayment && succeededPayment.amount !== order.totalAmount ? ["مبلغ پرداخت موفق با مبلغ نهایی سفارش برابر نیست."] : []),
    ...(financialStatus && !succeededPayment ? ["سفارش وضعیت مالی دارد اما پرداخت تأییدشده‌ای ثبت نشده است."] : []),
  ];
  const receiptReady = financialStatus && Boolean(succeededPayment) && !reconciliationIssues.length;

  return <div className="space-y-5">
    <Link href="/admin/orders" className="inline-flex items-center gap-1 font-ui text-xs text-foreground-muted"><ArrowRight size={14}/>بازگشت به سفارش‌ها</Link>
    <Card><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h1 data-display-title="true" className="text-2xl font-bold">سفارش {order.orderNumber}</h1><Badge>{orderLabels[order.status]}</Badge></div><p className="mt-2 font-ui text-sm text-foreground-muted">{order.businessName} · {order.createdByName || order.createdByPhone || "کاربر نامشخص"}</p></div><div className="flex items-end gap-3"><div className="text-left"><div className="font-ui text-xs text-foreground-subtle">مبلغ نهایی</div><div className="mt-1 text-xl font-bold">{toman(order.totalAmount)}</div></div>{receiptReady ? <Link href={`/admin/orders/${order.id}/receipt`}><Button variant="secondary" leadingIcon={<Printer size={14}/>}>رسید سفارش</Button></Link> : null}</div></div></Card>
    <Card className={reconciliationIssues.length ? "border-warning/30 bg-warning/[0.04]" : "border-success/20 bg-success/[0.03]"}><div className="flex items-start gap-3">{reconciliationIssues.length ? <AlertTriangle className="mt-0.5 text-warning" size={18}/> : <div className="mt-1 size-2 rounded-full bg-success"/>}<div><h2 className="font-ui text-sm font-bold">تطبیق سفارش و پرداخت: {reconciliationIssues.length ? "نیازمند بررسی" : "سازگار"}</h2>{reconciliationIssues.length ? <ul className="mt-2 list-disc space-y-1 pr-4 font-ui text-xs text-warning">{reconciliationIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : <p className="mt-1 font-ui text-xs text-foreground-muted">وضعیت سفارش، پرداخت موفق و مبلغ نهایی با یکدیگر سازگارند.</p>}</div></div></Card>
    <div className="grid gap-5 xl:grid-cols-2"><Card><h2 className="font-bold">اقلام سفارش</h2><div className="mt-4 space-y-3">{order.items.map((item) => <div key={item.id} className="rounded-control bg-surface-raised p-3 font-ui text-xs"><div className="flex justify-between gap-3"><span className="font-semibold">{item.serviceName} · {item.planName}</span><span>{toman(item.totalAmount)}</span></div><div className="mt-1 text-foreground-subtle">{itemLabels[item.type]} · تعداد {item.quantity.toLocaleString("fa-IR")}</div></div>)}</div><div className="mt-4 grid grid-cols-2 gap-2 font-ui text-xs"><Fact label="جمع اقلام" value={toman(order.subtotalAmount)}/><Fact label="تخفیف" value={toman(order.discountAmount)}/><Fact label="مالیات" value={toman(order.taxAmount)}/><Fact label="ایجاد" value={formatTehranPersianDateTime(order.createdAt)}/></div></Card>
    <Card><h2 className="font-bold">تلاش‌های پرداخت</h2>{order.payments.length ? <div className="mt-4 space-y-3">{order.payments.map((payment) => <div key={payment.id} className="rounded-control bg-surface-raised p-3 font-ui text-xs"><div className="flex justify-between"><span>{payment.provider}</span><Badge variant={payment.status === "succeeded" ? "success" : payment.status === "failed" ? "error" : "default"}>{paymentLabels[payment.status]}</Badge></div><div className="mt-2 text-foreground-muted">{toman(payment.amount)} · {formatTehranPersianDateTime(payment.requestedAt)}</div>{payment.providerPaymentId ? <div className="mt-1 break-all">شناسه پرداخت درگاه: {payment.providerPaymentId}</div> : null}{payment.providerReference ? <div className="mt-1 break-all">کد پیگیری: {payment.providerReference}</div> : null}{payment.failureCode ? <div className="mt-1 text-error">کد خطا: {payment.failureCode}</div> : null}{payment.failureMessage ? <div className="mt-1 text-error">شرح خطا: {payment.failureMessage}</div> : null}</div>)}</div> : <p className="mt-4 rounded-control bg-surface-raised p-3 font-ui text-xs text-foreground-muted">هیچ تلاش پرداختی ثبت نشده است.</p>}</Card></div>
    <Card><h2 className="font-bold">یادداشت داخلی</h2><p className="mt-1 font-ui text-xs text-foreground-muted">این متن فقط در پنل مدیریت نمایش داده می‌شود.</p><textarea disabled={!canManage} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} className="mt-4 min-h-28 w-full rounded-control border border-border bg-background p-3 font-ui text-sm disabled:opacity-60"/>{canManage ? <Button className="mt-3" loading={saving} onClick={() => void saveNote()}>ذخیره یادداشت</Button> : null}</Card>
    {canManage && mutable ? <Card><h2 className="font-bold">عملیات سفارش پرداخت‌نشده</h2><p className="mt-1 font-ui text-xs text-foreground-muted">این عملیات هیچ پرداختی را موفق اعلام نمی‌کند و فقط سفارش باز را می‌بندد.</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="danger" loading={saving} onClick={() => setPendingTransition("cancel")}>لغو سفارش</Button><Button variant="secondary" loading={saving} onClick={() => setPendingTransition("expire")}>منقضی‌کردن</Button></div></Card> : null}
    <ConfirmDialog
      open={Boolean(pendingTransition)}
      onClose={() => setPendingTransition(null)}
      onConfirm={() => { if (pendingTransition) { const operation = pendingTransition; setPendingTransition(null); void transition(operation); } }}
      title={pendingTransition === "cancel" ? "لغو سفارش" : "منقضی‌کردن سفارش"}
      description={`وضعیت سفارش ${order.orderNumber} تغییر خواهد کرد.`}
      consequences={["هیچ پرداختی موفق یا بازپرداخت‌شده اعلام نمی‌شود.", "سفارش از چرخه پرداخت باز خارج می‌شود.", "این عملیات در گزارش تغییرات ثبت خواهد شد."]}
      confirmLabel={pendingTransition === "cancel" ? "لغو سفارش" : "منقضی‌کردن"}
      tone="warning"
    />
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-control bg-surface-raised p-3"><div className="text-[10px] text-foreground-subtle">{label}</div><div className="mt-1">{value}</div></div>; }
