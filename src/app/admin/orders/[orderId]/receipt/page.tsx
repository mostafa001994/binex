"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { ArrowRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminOrderApi, type AdminOrder } from "@/lib/api-client/admin";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

function toman(value: string) { return `${(BigInt(value) / 10n).toLocaleString("fa-IR")} تومان`; }

export default function AdminOrderReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setOrder((await getAdminOrderApi(orderId)).order); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "رسید قابل دریافت نیست."); }
  }, [orderId]);
  useEffect(() => { void load(); }, [load]);
  if (error) return <Card className="font-ui text-sm text-error">{error}</Card>;
  if (!order) return <div className="h-64 animate-pulse rounded-card bg-surface-raised"/>;
  const payment = order.payments.find((item) => ["succeeded", "refunded", "partially-refunded"].includes(item.status));
  const validStatus = ["paid", "refunded", "partially-refunded"].includes(order.status);
  const verified = Boolean(payment && validStatus && payment.amount === order.totalAmount);
  if (!verified) return <Card><h1 className="text-xl font-bold">رسید قابل صدور نیست</h1><p className="mt-2 font-ui text-sm text-warning">وضعیت مالی سفارش، پرداخت موفق و مبلغ نهایی هنوز به‌طور کامل تطبیق ندارند.</p><Link href={`/admin/orders/${order.id}`} className="mt-4 inline-flex items-center gap-1 font-ui text-xs text-primary"><ArrowRight size={14}/>بازگشت به سفارش</Link></Card>;
  return <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:bg-white print:text-black">
    <div className="flex justify-between print:hidden"><Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 font-ui text-xs text-foreground-muted"><ArrowRight size={14}/>بازگشت به سفارش</Link><Button leadingIcon={<Printer size={15}/>} onClick={() => window.print()}>چاپ رسید</Button></div>
    <article className="rounded-card border border-border bg-surface p-8 print:rounded-none print:border-black print:bg-white">
      <header className="flex items-start justify-between border-b border-border pb-6"><div><h1 className="text-2xl font-bold">رسید سفارش Binix</h1><p className="mt-2 font-ui text-xs text-foreground-muted print:text-black">این سند رسید عملیاتی سفارش است و جایگزین صورتحساب رسمی مالیاتی نیست.</p></div><div className="text-left font-ui text-xs"><div>شماره سفارش</div><strong dir="ltr" className="mt-1 block text-base">{order.orderNumber}</strong></div></header>
      <section className="grid gap-4 border-b border-border py-6 font-ui text-sm sm:grid-cols-2"><Fact label="کسب‌وکار" value={order.businessName}/><Fact label="خریدار" value={order.createdByName || order.createdByPhone || "—"}/><Fact label="زمان پرداخت" value={payment?.paidAt ? formatTehranPersianDateTime(payment.paidAt) : "—"}/><Fact label="درگاه" value={payment?.provider || "—"}/><Fact label="کد پیگیری" value={payment?.providerReference || "—"}/><Fact label="وضعیت سفارش" value={order.status === "paid" ? "پرداخت‌شده" : order.status === "refunded" ? "بازپرداخت‌شده" : "بازپرداخت جزئی"}/></section>
      <section className="py-6"><h2 className="font-bold">اقلام</h2><div className="mt-4 divide-y divide-border">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-3 font-ui text-sm"><div><strong>{item.serviceName}</strong><div className="mt-1 text-xs text-foreground-muted print:text-black">{item.planName} · تعداد {item.quantity.toLocaleString("fa-IR")}</div></div><span>{toman(item.totalAmount)}</span></div>)}</div></section>
      <footer className="border-t border-border pt-5 font-ui text-sm"><div className="flex justify-between"><span>مبلغ نهایی</span><strong className="text-lg">{toman(order.totalAmount)}</strong></div></footer>
    </article>
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div><div className="text-xs text-foreground-subtle print:text-black">{label}</div><div className="mt-1 font-semibold">{value}</div></div>; }
