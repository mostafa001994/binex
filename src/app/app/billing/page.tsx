"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  LockKeyhole,
  RefreshCw,
  RotateCw,
} from "lucide-react";
import { AppPage } from "@/components/app/app-page";
import { AppSection } from "@/components/app/app-section";
import { CustomerOrdersSection } from "@/components/app/customer-orders-section";
import { useBusiness } from "@/components/business/business-context";
import { EmptyState } from "@/components/binix/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getCustomerSubscriptionsApi,
  type CustomerSubscriptionApiItem,
  type CustomerSubscriptionLifecycle,
  type CustomerSubscriptionsResponse,
} from "@/lib/api-client/subscriptions";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

const lifecyclePresentation: Record<
  CustomerSubscriptionLifecycle,
  {
    label: string;
    variant: "default" | "success" | "warning" | "error" | "info";
  }
> = {
  pending: { label: "در انتظار فعال‌سازی", variant: "warning" },
  trial: { label: "دوره آزمایشی", variant: "info" },
  "setup-required": { label: "نیازمند راه‌اندازی", variant: "warning" },
  provisioning: { label: "در حال راه‌اندازی", variant: "info" },
  active: { label: "فعال", variant: "success" },
  "payment-required": { label: "نیازمند پرداخت", variant: "error" },
  "setup-failed": { label: "خطا در راه‌اندازی", variant: "error" },
  paused: { label: "متوقف", variant: "warning" },
  ended: { label: "پایان‌یافته", variant: "default" },
};

const billingPeriodLabels: Record<
  CustomerSubscriptionApiItem["billing"]["period"],
  string
> = {
  monthly: "ماهانه",
  quarterly: "سه‌ماهه",
  yearly: "سالانه",
  custom: "اختصاصی",
};

function formatPrice(amount: string, currency: string) {
  try {
    const value = BigInt(amount);
    if (value === 0n) return "رایگان";
    if (currency === "IRR") {
      return `${(value / 10n).toLocaleString("fa-IR")} تومان`;
    }
    return `${value.toLocaleString("fa-IR")} ${currency}`;
  } catch {
    return "—";
  }
}

function formatDate(value: string | null) {
  return value ? formatTehranPersianDateTime(value) : "تعیین نشده";
}

export default function BillingPage() {
  const { membership } = useBusiness();
  const isOwner = membership.role === "owner";
  const [data, setData] = useState<CustomerSubscriptionsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isOwner);

  const load = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true);
    setError("");

    try {
      setData(await getCustomerSubscriptionsApi());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "اطلاعات اشتراک قابل دریافت نیست.",
      );
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppPage width="wide">
      <PageHeader
        title="اشتراک و صورت‌حساب"
        description="وضعیت واقعی اشتراک‌ها، دوره سرویس و سوابق مالی همین کسب‌وکار."
        actions={
          <ButtonLink href="/app/services" variant="secondary">
            سرویس‌های من
          </ButtonLink>
        }
      />

      {!isOwner ? (
        <RestrictedBilling />
      ) : loading ? (
        <BillingSkeleton />
      ) : error ? (
        <BillingError message={error} onRetry={load} />
      ) : data ? (
        <BillingContent data={data} />
      ) : null}
    </AppPage>
  );
}

function BillingContent({ data }: { data: CustomerSubscriptionsResponse }) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3" aria-label="خلاصه اشتراک‌ها">
        <SummaryCard
          icon={<Layers3 size={17} />}
          label="کل اشتراک‌ها"
          value={data.summary.total.toLocaleString("fa-IR")}
        />
        <SummaryCard
          icon={<CheckCircle2 size={17} />}
          label="فعال یا آزمایشی"
          value={data.summary.active.toLocaleString("fa-IR")}
        />
        <SummaryCard
          icon={<AlertCircle size={17} />}
          label="نیازمند پیگیری"
          value={data.summary.needsAttention.toLocaleString("fa-IR")}
          attention={data.summary.needsAttention > 0}
        />
      </section>

      <AppSection
        title="اشتراک‌های کسب‌وکار"
        description="مبلغ‌ها فقط از پلن ثبت‌شده در دیتابیس نمایش داده می‌شوند."
      >
        {data.subscriptions.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Layers3 size={21} />}
            title="هنوز اشتراک فعالی ندارید"
            description="پس از ثبت خرید یا فعال‌سازی یک پلن واقعی، وضعیت اشتراک و دوره آن در این بخش نمایش داده می‌شود."
            actionLabel="مشاهده سرویس‌ها"
            actionHref="/app/services"
            secondaryActionLabel="درخواست مشاوره"
            secondaryActionHref="/#consultation"
          />
        )}
      </AppSection>

      <CustomerOrdersSection />
    </>
  );
}

function SubscriptionCard({
  subscription,
}: {
  subscription: CustomerSubscriptionApiItem;
}) {
  const presentation = lifecyclePresentation[subscription.lifecycleStatus];

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-ui text-xs text-foreground-subtle">
            {subscription.plan.name}
          </p>
          <h2 data-display-title="true" className="mt-1 text-xl font-bold">
            {subscription.service.name}
          </h2>
        </div>
        <Badge variant={presentation.variant}>{presentation.label}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 font-ui text-xs sm:grid-cols-4">
        <Fact
          label="مبلغ دوره"
          value={formatPrice(
            subscription.billing.priceAmount,
            subscription.billing.currency,
          )}
        />
        <Fact
          label="دوره"
          value={billingPeriodLabels[subscription.billing.period]}
        />
        <Fact
          label="پایان دوره"
          value={formatDate(subscription.period.endsAt)}
        />
        <Fact
          label="تمدید خودکار"
          value={subscription.billing.autoRenew ? "فعال" : "غیرفعال"}
        />
      </div>

      {subscription.billing.cancelAtPeriodEnd && (
        <div className="mt-4 rounded-control border border-warning/20 bg-warning/[0.07] px-3 py-2 font-ui text-xs leading-6 text-warning">
          این اشتراک در پایان دوره جاری تمدید نمی‌شود.
        </div>
      )}

      <SubscriptionAction subscription={subscription} />
    </Card>
  );
}

function SubscriptionAction({
  subscription,
}: {
  subscription: CustomerSubscriptionApiItem;
}) {
  if (subscription.nextAction === "complete-setup") {
    return (
      <div className="mt-auto flex justify-end border-t border-border-subtle pt-4">
        <ButtonLink href="/app/services" size="sm">
          ادامه راه‌اندازی
        </ButtonLink>
      </div>
    );
  }

  if (
    subscription.nextAction === "resolve-payment" ||
    subscription.nextAction === "contact-support"
  ) {
    return (
      <div className="mt-auto flex justify-end border-t border-border-subtle pt-4">
        <ButtonLink href="/app/support" size="sm" variant="secondary">
          پیگیری با پشتیبانی
        </ButtonLink>
      </div>
    );
  }

  if (
    subscription.nextAction === "wait-for-activation" ||
    subscription.nextAction === "wait-for-provisioning"
  ) {
    return (
      <div className="mt-auto flex items-center gap-2 border-t border-border-subtle pt-4 font-ui text-xs text-foreground-muted">
        <Clock3 size={15} className="text-info" />
        پردازش این اشتراک در حال انجام است و نیاز به اقدام شما ندارد.
      </div>
    );
  }

  return null;
}

function RestrictedBilling() {
  return (
    <Card className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-control border border-border bg-surface-muted text-primary">
        <LockKeyhole size={21} />
      </div>
      <h2 data-display-title="true" className="mt-4 text-xl font-bold">
        اطلاعات مالی فقط برای مالک قابل مشاهده است
      </h2>
      <p className="mt-2 max-w-lg font-ui text-sm leading-7 text-foreground-muted">
        اعضای کسب‌وکار می‌توانند از سرویس‌های مجاز استفاده کنند، اما اشتراک‌ها، مبالغ و رسیدها فقط در حساب مالک نمایش داده می‌شوند.
      </p>
      <ButtonLink href="/app/services" variant="secondary" className="mt-5">
        بازگشت به سرویس‌ها
      </ButtonLink>
    </Card>
  );
}

function BillingError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card
      className="flex min-h-64 flex-col items-center justify-center px-5 text-center"
      role="alert"
    >
      <AlertCircle size={24} className="text-error" />
      <h2 data-display-title="true" className="mt-4 text-xl font-bold">
        دریافت اطلاعات اشتراک انجام نشد
      </h2>
      <p className="mt-2 max-w-lg font-ui text-sm leading-7 text-foreground-muted">
        {message}
      </p>
      <Button
        onClick={onRetry}
        variant="secondary"
        leadingIcon={<RefreshCw size={15} />}
        className="mt-5"
      >
        تلاش دوباره
      </Button>
    </Card>
  );
}

function BillingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="در حال دریافت اشتراک‌ها"
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-card bg-surface-raised"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-60 animate-pulse rounded-card bg-surface-raised"
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  attention = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  attention?: boolean;
}) {
  return (
    <Card className="p-4">
      <div
        className={
          attention
            ? "flex items-center gap-2 text-warning"
            : "flex items-center gap-2 text-primary"
        }
      >
        {icon}
        <span className="font-ui text-xs text-foreground-muted">{label}</span>
      </div>
      <div className="mt-3 font-ui text-xl font-bold">{value}</div>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const Icon =
    label === "پایان دوره"
      ? CalendarDays
      : label === "تمدید خودکار"
        ? RotateCw
        : null;

  return (
    <div className="rounded-control bg-surface-muted p-3">
      <div className="flex items-center gap-1 text-foreground-subtle">
        {Icon && <Icon size={12} />}
        <span>{label}</span>
      </div>
      <div className="mt-2 break-words font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}
