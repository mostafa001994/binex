"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, CreditCard, Sparkles } from "lucide-react";
import {
  getPurchasablePlansApi,
  type PurchasablePlan,
} from "@/lib/api-client/plans";

function periodLabel(plan: PurchasablePlan) {
  if (plan.billingPeriod === "monthly") return "ماهانه";
  if (plan.billingPeriod === "quarterly") return "سه‌ماهه";
  if (plan.billingPeriod === "yearly") return "سالانه";
  return plan.customDurationDays
    ? `${plan.customDurationDays.toLocaleString("fa-IR")} روزه`
    : "اختصاصی";
}

function priceLabel(plan: PurchasablePlan) {
  const amount = BigInt(plan.priceAmount);
  const displayAmount = plan.currency === "IRR" ? amount / 10n : amount;
  return `${displayAmount.toLocaleString("fa-IR")} ${plan.currency === "IRR" ? "تومان" : plan.currency}`;
}

export default function ServicePlans({
  serviceId,
  serviceName,
  showWhenEmpty = false,
}: {
  serviceId: string;
  serviceName: string;
  showWhenEmpty?: boolean;
}) {
  const [plans, setPlans] = useState<PurchasablePlan[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPurchasablePlansApi()
      .then(({ plans: items }) => {
        if (active) {
          setPlans(items.filter((item) => item.serviceId === serviceId));
        }
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "پلن‌ها قابل دریافت نیستند.",
          );
          setPlans([]);
        }
      });

    return () => {
      active = false;
    };
  }, [serviceId]);

  if (plans?.length === 0 && !error && !showWhenEmpty) {
    return null;
  }

  return (
    <section
      id="plans"
      dir="rtl"
      className="scroll-mt-24 border-y border-marketing-border bg-marketing-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-service-accent">
            <CreditCard size={14} /> انتخاب اشتراک
          </div>
          <h2 className="font-display mt-5 text-3xl font-black text-marketing-text sm:text-4xl">
            پلن مناسب {serviceName} را انتخاب کنید
          </h2>
          <p className="font-ui mt-4 text-sm leading-8 text-marketing-text-muted">
            برای دیدن سرویس و مقایسه پلن‌ها نیازی به ثبت‌نام نیست. ورود با
            شماره موبایل فقط هنگام نهایی‌کردن خرید انجام می‌شود.
          </p>
        </div>

        {plans === null ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-card border border-marketing-border bg-marketing-surface"
              />
            ))}
          </div>
        ) : error ? (
          <div className="font-ui mx-auto mt-10 max-w-xl rounded-card border border-red-400/20 bg-red-400/[0.05] p-5 text-center text-sm text-red-200">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <div className="font-ui mx-auto mt-10 max-w-xl rounded-card border border-marketing-border bg-marketing-surface p-6 text-center text-sm leading-7 text-marketing-text-muted">
            پلن‌های این سرویس در حال آماده‌سازی هستند. برای دریافت پیشنهاد
            متناسب با حجم محتوای موردنیازتان، درخواست راه‌اندازی ثبت کنید.
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="flex rounded-card border border-marketing-border bg-marketing-surface/70 p-6"
              >
                <div className="flex w-full flex-col">
                  <div className="font-ui text-xs font-semibold text-service-accent">
                    {periodLabel(plan)}
                  </div>
                  <h3 className="font-display mt-3 text-xl font-bold text-marketing-text">
                    {plan.name}
                  </h3>
                  {plan.description ? (
                    <p className="font-ui mt-3 text-xs leading-7 text-marketing-text-muted">
                      {plan.description}
                    </p>
                  ) : null}
                  <div className="font-display mt-6 text-2xl font-black text-marketing-text">
                    {priceLabel(plan)}
                  </div>
                  {plan.trialDays > 0 ? (
                    <div className="font-ui mt-4 flex items-center gap-2 text-xs font-semibold text-service-accent">
                      <Sparkles size={14} />
                      {plan.trialDays.toLocaleString("fa-IR")} روز دوره آزمایشی
                    </div>
                  ) : null}
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="font-ui flex items-start gap-2 text-xs leading-6 text-marketing-text-muted"
                      >
                        <Check
                          size={14}
                          className="mt-1 shrink-0 text-service-accent"
                        />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/checkout?service=${encodeURIComponent(serviceId)}&plan=${encodeURIComponent(plan.id)}`}
                    className="font-ui mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-control bg-service-accent px-5 text-xs font-bold text-white transition hover:-translate-y-0.5"
                  >
                    انتخاب این اشتراک <ArrowLeft size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
