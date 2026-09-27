"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { AppSection } from "@/components/app/app-section";
import { EmptyState } from "@/components/binix/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getCustomerOrdersApi,
  type CustomerOrderApiItem,
  type CustomerOrderStatus,
  type CustomerOrdersResponse,
  type CustomerPaymentStatus,
} from "@/lib/api-client/commerce";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

const orderPresentation: Record<
  CustomerOrderStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "info" }
> = {
  "pending-payment": { label: "در انتظار پرداخت", variant: "warning" },
  paid: { label: "پرداخت‌شده", variant: "success" },
  "payment-failed": { label: "پرداخت ناموفق", variant: "error" },
  canceled: { label: "لغوشده", variant: "default" },
  expired: { label: "منقضی‌شده", variant: "default" },
  refunded: { label: "بازپرداخت‌شده", variant: "info" },
  "partially-refunded": { label: "بازپرداخت جزئی", variant: "info" },
};

const paymentLabels: Record<CustomerPaymentStatus, string> = {
  initiated: "شروع‌شده",
  pending: "در حال بررسی",
  succeeded: "موفق",
  failed: "ناموفق",
  canceled: "لغوشده",
  refunded: "بازپرداخت‌شده",
  "partially-refunded": "بازپرداخت جزئی",
};

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

export function CustomerOrdersSection() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CustomerOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getCustomerOrdersApi(page));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "اطلاعات سفارش‌ها قابل دریافت نیست.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppSection
      title="سفارش‌ها، پرداخت‌ها و رسیدها"
      description="سوابق واقعی سفارش و نتیجه ثبت‌شده درگاه؛ بدون تراکنش یا رسید آزمایشی."
    >
      {loading ? (
        <OrdersSkeleton />
      ) : error ? (
        <Card className="text-center" role="alert">
          <AlertCircle size={22} className="mx-auto text-error" />
          <h3 className="mt-3 font-ui text-base font-semibold">
            دریافت سوابق مالی انجام نشد
          </h3>
          <p className="mt-2 font-ui text-sm text-foreground-muted">{error}</p>
          <Button onClick={load} variant="secondary" className="mt-4">
            تلاش دوباره
          </Button>
        </Card>
      ) : data && data.orders.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            {data.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            onChange={setPage}
          />
        </div>
      ) : (
        <EmptyState
          icon={<ReceiptText size={21} />}
          title="هنوز سفارش یا پرداختی ندارید"
          description="بعد از ثبت اولین سفارش واقعی، مبلغ، وضعیت پرداخت و رسید تأییدشده در این بخش نمایش داده می‌شود."
        />
      )}
    </AppSection>
  );
}

function OrderCard({ order }: { order: CustomerOrderApiItem }) {
  const presentation = orderPresentation[order.status];
  const latestPayment = order.payments[0];

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-ui text-xs text-foreground-subtle">
            شماره سفارش
          </span>
          <h3 dir="ltr" className="mt-1 text-left font-ui text-base font-bold">
            {order.orderNumber}
          </h3>
        </div>
        <Badge variant={presentation.variant}>{presentation.label}</Badge>
      </div>

      <div className="mt-4 divide-y divide-border-subtle rounded-control bg-surface-muted px-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="font-ui text-sm font-semibold">{item.serviceName}</div>
              <div className="mt-1 font-ui text-xs text-foreground-muted">
                {item.planName} · تعداد {item.quantity.toLocaleString("fa-IR")}
              </div>
            </div>
            <span className="shrink-0 font-ui text-xs font-medium">
              {formatMoney(item.totalAmount, order.currency)}
            </span>
          </div>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 font-ui text-xs">
        <div>
          <dt className="text-foreground-subtle">تاریخ سفارش</dt>
          <dd className="mt-1 font-medium">
            {formatTehranPersianDateTime(order.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-foreground-subtle">آخرین وضعیت پرداخت</dt>
          <dd className="mt-1 font-medium">
            {latestPayment ? paymentLabels[latestPayment.status] : "پرداختی ثبت نشده"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border-subtle pt-4">
        <div>
          <div className="font-ui text-xs text-foreground-subtle">مبلغ نهایی</div>
          <div className="mt-1 font-ui text-base font-bold">
            {formatMoney(order.amounts.total, order.currency)}
          </div>
        </div>
        {order.receiptAvailable ? (
          <ButtonLink
            href={`/app/billing/orders/${order.id}/receipt`}
            size="sm"
            variant="secondary"
            leadingIcon={<ReceiptText size={15} />}
          >
            مشاهده رسید
          </ButtonLink>
        ) : (
          <span className="font-ui text-xs text-foreground-subtle">
            رسید پس از تأیید مالی صادر می‌شود
          </span>
        )}
      </div>
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
      <span className="font-ui text-xs text-foreground-muted">
        {total.toLocaleString("fa-IR")} سفارش · صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={page <= 1}
          aria-label="صفحه قبلی"
          onClick={() => onChange(page - 1)}
        >
          <ChevronRight size={16} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={page >= totalPages}
          aria-label="صفحه بعدی"
          onClick={() => onChange(page + 1)}
        >
          <ChevronLeft size={16} />
        </Button>
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div
      className="grid gap-4 xl:grid-cols-2"
      aria-busy="true"
      aria-label="در حال دریافت سفارش‌ها"
    >
      {[0, 1].map((item) => (
        <div
          key={item}
          className="h-72 animate-pulse rounded-card bg-surface-raised"
        />
      ))}
    </div>
  );
}
