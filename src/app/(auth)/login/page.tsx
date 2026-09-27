"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, LockKeyhole, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GlassAuthShell } from "@/components/auth/glass-auth-shell";
import { requestOtpApi } from "@/lib/api-client/auth";
import { useServiceIntent } from "@/hooks/use-service-intent";
import { safeAuthReturnPath } from "@/lib/auth-return";


function LoginPageContent() {
  const router = useRouter();
  const search = useSearchParams();
  const serviceCandidate =
    search.get("service");
  const returnPath = safeAuthReturnPath(search.get("next"));
  const {
    serviceId: service,
    ready: serviceIntentReady,
  } = useServiceIntent(
    serviceCandidate,
  );
  const serviceIntentPending =
    Boolean(serviceCandidate) &&
    !serviceIntentReady;

  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const normalized = phone.replace(/\D/g, "");
  const valid = /^09\d{9}$/.test(normalized);
  const showError = touched && phone.length > 0 && !valid;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    setServerError("");

    if (
      !valid ||
      loading ||
      serviceIntentPending
    ) {
      return;
    }
    setLoading(true);

    try {
      const result = await requestOtpApi(normalized);

      sessionStorage.setItem("binix-auth-phone", normalized);
      sessionStorage.setItem(
        "binix-otp-resend-after",
        String(result.resendAfterSeconds),
      );

      if (result.devCode) {
        sessionStorage.setItem("binix-dev-otp-code", result.devCode);
      }

      if (service) {
        sessionStorage.setItem("binix-auth-service-intent", service);
      }

      toast.success("کد تأیید آماده شد", {
        description:
          result.devCode
            ? `در حالت تست از کد ${result.devCode} استفاده کنید.`
            : "کد تأیید برای شماره شما ارسال شد.",
      });

      const params = new URLSearchParams();
      params.set("phone", normalized);
      if (service) params.set("service", service);
      if (returnPath) params.set("next", returnPath);
      router.push(`/otp?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ارسال کد تأیید انجام نشد.";
      setServerError(message);
      toast.error("ارسال کد انجام نشد", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassAuthShell
      eyebrow="ورود امن"
      title="ورود به Binix"
      description="شماره موبایل را وارد کنید تا کد تأیید یک‌بارمصرف برایتان آماده شود."
      visualTitle={
        <>
          کسب‌وکارتان را
          <span className="mx-2 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            هوشمندتر
          </span>
          مدیریت کنید
        </>
      }
      visualDescription="Binix ابزارهای هوشمند کسب‌وکار را در یک تجربه ساده، آرام و قابل کنترل کنار هم قرار می‌دهد."
      visualIcon={<Sparkles size={26} />}
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="login-phone" className="font-ui mb-2 block text-[10.5px] font-semibold text-white/60">
            شماره موبایل
          </label>

          <div
            className={
              showError
                ? "relative overflow-hidden rounded-xl border border-red-400/35 bg-white/[0.035] backdrop-blur-xl transition focus-within:ring-2 focus-within:ring-red-300/10"
                : "relative overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl transition hover:border-white/[0.13] focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/10"
            }
          >
            <div className="absolute right-0 top-0 flex h-full w-12 items-center justify-center border-l border-white/[0.055] text-white/28">
              <Phone size={16} />
            </div>

            <input
              id="login-phone"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onBlur={() => setTouched(true)}
              onChange={(event) => {
                setPhone(event.target.value);
                setServerError("");
              }}
              placeholder="09xxxxxxxxx"
              aria-invalid={showError}
              className="font-ui h-12 w-full bg-transparent px-4 pl-14 pr-14 text-left text-[13px] text-white outline-none placeholder:text-white/18"
            />

            {valid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute left-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"
              >
                <CheckCircle2 size={14} />
              </motion.div>
            )}
          </div>

          {showError && (
            <p className="font-ui mt-2 text-[9.5px] leading-5 text-red-300">
              شماره را به شکل 09xxxxxxxxx وارد کنید.
            </p>
          )}
        </div>

        {serverError && (
          <div className="font-ui rounded-xl border border-red-400/20 bg-red-400/[0.055] px-3.5 py-3 text-[9.5px] leading-5 text-red-200 backdrop-blur-xl">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={
            !valid ||
            loading ||
            serviceIntentPending
          }
          className="font-ui flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[11px] font-bold text-white shadow-[0_12px_28px_rgba(7,139,255,.18)] transition hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_16px_34px_rgba(7,139,255,.24)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              در حال ارسال...
            </>
          ) : (
            <>
              دریافت کد تأیید
              <ArrowLeft size={14} />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 pt-1 font-ui text-[8.5px] leading-5 text-white/24">
          <LockKeyhole size={11} />
          ورود با کد یک‌بارمصرف و نشست امن HttpOnly
        </div>
      </form>
    </GlassAuthShell>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function AuthPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020817] px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="mx-auto h-10 w-28 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  );
}
