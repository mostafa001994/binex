"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { getMeApi } from "@/lib/api-client/auth";
import { getPurchasablePlansApi, type PurchasablePlan } from "@/lib/api-client/plans";
import { getPaymentGatewaysApi, type PaymentGateway } from "@/lib/api-client/payment-gateways";
import { createPaymentApi } from "@/lib/api-client/payment";
import { getPublicServicesApi, type PublicServiceItem } from "@/lib/api-client/service-catalog";

function formatPrice(plan: PurchasablePlan) {
  const raw = BigInt(plan.priceAmount);
  const amount = plan.currency === "IRR" ? raw / 10n : raw;
  return `${amount.toLocaleString("fa-IR")} ${plan.currency === "IRR" ? "تومان" : plan.currency}`;
}

function CheckoutContent() {
  const search = useSearchParams();
  const planId = search.get("plan") ?? "";
  const serviceId = search.get("service") ?? "";
  const [plans, setPlans] = useState<PurchasablePlan[] | null>(null);
  const [services, setServices] = useState<PublicServiceItem[]>([]);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [gatewayId, setGatewayId] = useState("");
  const [realPaymentConfirmed, setRealPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = useMemo(
    () => plans?.find((item) => item.id === planId && item.serviceId === serviceId) ?? null,
    [planId, plans, serviceId],
  );
  const service = useMemo(
    () => services.find((item) => item.id === serviceId) ?? null,
    [serviceId, services],
  );

  const selectedGateway = useMemo(
    () => gateways.find((item) => item.id === gatewayId) ?? null,
    [gatewayId, gateways],
  );
  const isRealGateway = Boolean(
    selectedGateway && selectedGateway.provider !== "local-test",
  );

  useEffect(() => {
    Promise.all([
      getPurchasablePlansApi().then((result) => setPlans(result.plans)),
      getPublicServicesApi()
        .then((result) => setServices(result.services))
        .catch(() => setServices([])),
      getMeApi().then(() => setAuthenticated(true)).catch(() => setAuthenticated(false)),
    ]).catch((reason) => {
      setError(reason instanceof Error ? reason.message : "اطلاعات خرید دریافت نشد.");
      setPlans([]);
    });
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    getPaymentGatewaysApi()
      .then(({ gateways: items }) => {
        setGateways(items);
        setGatewayId(items[0]?.id ?? "");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "درگاه پرداخت دریافت نشد."));
  }, [authenticated]);

  async function pay() {
    if (!plan || !gatewayId || loading || (isRealGateway && !realPaymentConfirmed)) return;
    setLoading(true);
    setError("");
    try {
      const result = await createPaymentApi({ planId: plan.id, gatewayId });
      window.location.assign(result.checkout.paymentUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "شروع پرداخت انجام نشد.");
      setLoading(false);
    }
  }

  const checkoutPath = `/checkout?service=${encodeURIComponent(serviceId)}&plan=${encodeURIComponent(planId)}`;
  const loginParams = new URLSearchParams({ service: serviceId, next: checkoutPath });
  const plansHref = `${service?.marketingHref || `/services/${encodeURIComponent(serviceId)}`}#plans`;
  const serviceName = service?.name || "سرویس انتخاب‌شده";

  return (
    <MarketingPageShell>
      <main dir="rtl" className="min-h-screen bg-marketing-background px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[920px]">
          <Link href={plansHref} className="font-ui inline-flex items-center gap-2 text-xs text-marketing-text-muted transition hover:text-marketing-text"><ArrowRight size={14} /> بازگشت به پلن‌های {serviceName}</Link>
          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_340px]">
            <section className="rounded-card border border-marketing-border bg-marketing-surface/70 p-6 sm:p-8">
              <div className="font-ui text-xs font-semibold text-service-accent">نهایی‌کردن خرید</div>
              <h1 className="font-display mt-3 text-3xl font-black text-marketing-text">اشتراک {serviceName}</h1>

              {plans === null || authenticated === null ? (
                <div className="mt-8 h-52 animate-pulse rounded-card bg-white/[0.04]" />
              ) : !plan ? (
                <div className="font-ui mt-8 rounded-card border border-amber-400/20 bg-amber-400/[0.05] p-5 text-sm leading-7 text-amber-100">پلن انتخاب‌شده معتبر یا قابل خرید نیست. لطفاً به صفحه سرویس برگردید و دوباره انتخاب کنید.</div>
              ) : authenticated ? (
                <div className="mt-8">
                  <h2 className="font-display text-lg font-bold text-marketing-text">درگاه پرداخت</h2>
                  <p className="font-ui mt-2 text-xs leading-6 text-marketing-text-muted">درگاه را انتخاب کنید و سپس پرداخت را ادامه دهید.</p>
                  <div className="mt-5 space-y-3">
                    {gateways.map((gateway) => (
                      <label key={gateway.id} className={`font-ui flex cursor-pointer items-center gap-3 rounded-control border p-4 text-sm transition ${gatewayId === gateway.id ? "border-service-accent bg-service-accent/[0.07] text-marketing-text" : "border-marketing-border text-marketing-text-muted"}`}>
                        <input type="radio" name="gateway" value={gateway.id} checked={gatewayId === gateway.id} onChange={() => { setGatewayId(gateway.id); setRealPaymentConfirmed(false); }} className="accent-[var(--service-accent)]" />
                        <CreditCard size={17} /> {gateway.name}
                        {gateway.provider !== "local-test" ? <span className="mr-auto rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">واقعی</span> : null}
                      </label>
                    ))}
                  </div>
                  {isRealGateway ? (
                    <div className="font-ui mt-5 rounded-control border border-amber-400/25 bg-amber-400/[0.07] p-4 text-xs leading-7 text-amber-100">
                      <p>این پرداخت واقعی است و مبلغ از حساب شما کسر می‌شود. callback به سایت اصلی Binix برمی‌گردد؛ چون سفارش در دیتابیس لوکال ساخته شده، تأیید نهایی آن در سایت اصلی قابل تطبیق نیست.</p>
                      <label className="mt-3 flex cursor-pointer items-start gap-2 font-semibold">
                        <input type="checkbox" checked={realPaymentConfirmed} onChange={(event) => setRealPaymentConfirmed(event.target.checked)} className="mt-1 accent-amber-400" />
                        متوجه هستم؛ می‌خواهم درگاه واقعی را آزمایش کنم.
                      </label>
                    </div>
                  ) : null}
                  {error ? <div role="alert" className="font-ui mt-5 rounded-control border border-red-400/20 bg-red-400/[0.05] p-3 text-xs text-red-200">{error}</div> : null}
                  <button type="button" onClick={pay} disabled={!gatewayId || loading || (isRealGateway && !realPaymentConfirmed)} className="font-ui mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-control bg-service-accent px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">
                    {loading ? "در حال انتقال به پرداخت..." : isRealGateway ? "ادامه به درگاه واقعی" : "پرداخت و فعال‌سازی سرویس"}<LockKeyhole size={14} />
                  </button>
                </div>
              ) : (
                <div className="mt-8 rounded-card border border-service-accent/20 bg-service-accent/[0.055] p-6">
                  <div className="flex items-start gap-3"><ShieldCheck className="mt-1 shrink-0 text-service-accent" size={22} /><div><h2 className="font-display text-lg font-bold text-marketing-text">ثبت‌نام فقط در مرحله آخر</h2><p className="font-ui mt-2 text-xs leading-7 text-marketing-text-muted">انتخاب شما ذخیره شده است. با شماره موبایل وارد شوید؛ اگر حساب ندارید همان‌جا ساخته می‌شود و بعد مستقیماً به همین خرید برمی‌گردید.</p></div></div>
                  <Link href={`/login?${loginParams.toString()}`} className="font-ui mt-6 flex h-12 items-center justify-center rounded-control bg-service-accent px-5 text-xs font-bold text-white">ورود یا ثبت‌نام و ادامه خرید</Link>
                </div>
              )}
            </section>

            <aside className="h-fit rounded-card border border-marketing-border bg-marketing-surface/70 p-6">
              <div className="font-ui text-xs text-marketing-text-muted">خلاصه سفارش</div>
              {plan ? <><h2 className="font-display mt-3 text-xl font-bold text-marketing-text">{plan.name}</h2><div className="font-display mt-5 text-2xl font-black text-service-accent">{formatPrice(plan)}</div><div className="mt-5 space-y-3">{plan.features.map((feature) => <div key={feature} className="font-ui flex items-start gap-2 text-xs leading-6 text-marketing-text-muted"><Check size={13} className="mt-1 shrink-0 text-service-accent" />{feature}</div>)}</div></> : <div className="mt-4 h-36 animate-pulse rounded-control bg-white/[0.04]" />}
            </aside>
          </div>
        </div>
      </main>
    </MarketingPageShell>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-marketing-background" />}><CheckoutContent /></Suspense>;
}
