"use client";

import { use, useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowRight, LockKeyhole, Printer } from "lucide-react";
import Link from "next/link";
import { AppPage } from "@/components/app/app-page";
import { useBusiness } from "@/components/business/business-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getCustomerOrderApi,
  type CustomerOrderApiItem,
} from "@/lib/api-client/commerce";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

function formatMoney(amount: string, currency: string) {
  try {
    const value = BigInt(amount);
    if (currency === "IRR") {
      return `${(value / 10n).toLocaleString("fa-IR")} تومان`;
    }
    return `${value.toLocaleString("fa-IR")} ${currency}`;
  } catch {
    return "—";
  }
}

export default function CustomerOrderReceiptPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { business, membership } = useBusiness();
  const [order, setOrder] = useState<CustomerOrderApiItem | null>(null);
  const [error, setError] = useState("");
  const isOwner = membership.role === "owner";

  const load = useCallback(async () => {
    if (!isOwner) return;
    setError("");
    try {
      setOrder((await getCustomerOrderApi(orderId)).order);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "رسید قابل دریافت نیست.",
      );
    }
  }, [isOwner, orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isOwner) {
    return (
      <AppPage>
        <ReceiptMessage
          icon={<LockKeyhole size={23} />}
          title="رسید فقط برای مالک قابل مشاهده است"
          description="اطلاعات مالی این کسب‌وکار در اختیار اعضای غیرمالک قرار نمی‌گیرد."
        />
      </AppPage>
    );
  }

  if (error) {
    return (
      <AppPage>
        <ReceiptMessage
          icon={<AlertCircle size={23} />}
          title="رسید قابل دریافت نیست"
          description={error}
        />
      </AppPage>
    );
  }

  if (!order) {
    return (
      <AppPage>
        <div
          className="h-72 animate-pulse rounded-card bg-surface-raised"
          aria-busy="true"
          aria-label="در حال دریافت رسید"
        />
      </AppPage>
    );
  }

  if (!order.receiptAvailable) {
    return (
      <AppPage>
        <ReceiptMessage
          icon={<AlertCircle size={23} />}
          title="رسید هنوز قابل صدور نیست"
          description="وضعیت سفارش، پرداخت تأییدشده و مبلغ نهایی هنوز به‌طور کامل تطبیق ندارند."
        />
      </AppPage>
    );
  }

  const payment = order.payments.find(
    (item) =>
      ["succeeded", "refunded", "partially-refunded"].includes(item.status) &&
      item.amount === order.amounts.total,
  );

  return (
    <AppPage width="wide">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/app/billing"
          className="inline-flex items-center gap-1 font-ui text-sm text-foreground-muted hover:text-foreground"
        >
          <ArrowRight size={15} />
          بازگشت به صورت‌حساب
        </Link>
        <Button
          leadingIcon={<Printer size={15} />}
          onClick={() => window.print()}
        >
          چاپ رسید
        </Button>
      </div>

      <article className="rounded-card border border-border bg-surface p-5 sm:p-8 print:rounded-none print:border-black print:bg-white print:text-black">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 data-display-title="true" className="text-2xl font-bold">
              رسید سفارش Binix
            </h1>
            <p className="mt-2 font-ui text-xs leading-6 text-foreground-muted print:text-black">
              این سند رسید عملیاتی پرداخت است و جایگزین صورتحساب رسمی مالیاتی نیست.
            </p>
          </div>
          <div className="font-ui text-sm sm:text-left">
            <div className="text-xs text-foreground-subtle print:text-black">
              شماره سفارش
            </div>
            <strong dir="ltr" className="mt-1 block text-base">
              {order.orderNumber}
            </strong>
          </div>
        </header>

        <section className="grid gap-4 border-b border-border py-6 font-ui text-sm sm:grid-cols-2">
          <Fact label="کسب‌وکار" value={business.name} />
          <Fact
            label="زمان پرداخت"
            value={payment?.paidAt ? formatTehranPersianDateTime(payment.paidAt) : "—"}
          />
          <Fact label="درگاه" value={payment?.provider || "—"} />
          <Fact label="کد پیگیری" value={payment?.reference || "—"} ltr />
        </section>

        <section className="py-6">
          <h2 data-display-title="true" className="text-lg font-bold">
            اقلام سفارش
          </h2>
          <div className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 py-3 font-ui text-sm"
              >
                <div>
                  <strong>{item.serviceName}</strong>
                  <div className="mt-1 text-xs text-foreground-muted print:text-black">
                    {item.planName} · تعداد {item.quantity.toLocaleString("fa-IR")}
                  </div>
                </div>
                <span className="shrink-0">
                  {formatMoney(item.totalAmount, order.currency)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer className="space-y-2 border-t border-border pt-5 font-ui text-sm">
          {order.amounts.discount !== "0" && (
            <ReceiptAmount
              label="تخفیف"
              value={`− ${formatMoney(order.amounts.discount, order.currency)}`}
            />
          )}
          {order.amounts.tax !== "0" && (
            <ReceiptAmount
              label="مالیات"
              value={formatMoney(order.amounts.tax, order.currency)}
            />
          )}
          <ReceiptAmount
            label="مبلغ نهایی"
            value={formatMoney(order.amounts.total, order.currency)}
            strong
          />
        </footer>
      </article>
    </AppPage>
  );
}

function ReceiptMessage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-control border border-border bg-surface-muted text-warning">
        {icon}
      </div>
      <h1 data-display-title="true" className="mt-4 text-xl font-bold">
        {title}
      </h1>
      <p className="mt-2 max-w-lg font-ui text-sm leading-7 text-foreground-muted">
        {description}
      </p>
      <Link href="/app/billing" className="mt-5 font-ui text-sm text-primary">
        بازگشت به صورت‌حساب
      </Link>
    </Card>
  );
}

function Fact({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-foreground-subtle print:text-black">{label}</div>
      <div dir={ltr ? "ltr" : undefined} className="mt-1 font-semibold">
        {value}
      </div>
    </div>
  );
}

function ReceiptAmount({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className={strong ? "text-lg font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
