"use client";

import {
  ClipboardEvent,
  KeyboardEvent,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { GlassAuthShell } from "@/components/auth/glass-auth-shell";
import { requestOtpApi, verifyOtpApi } from "@/lib/api-client/auth";
import { useServiceIntent } from "@/hooks/use-service-intent";
import { safeAuthReturnPath } from "@/lib/auth-return";

const OTP_LENGTH = 5;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}


function OtpPageContent() {
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
  const phone =
    search.get("phone") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("binix-auth-phone")
      : "") ||
    "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devCode, setDevCode] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const submittingRef = useRef(false);

  useEffect(() => {
    refs.current[0]?.focus();
    setDevCode(sessionStorage.getItem("binix-dev-otp-code") || "");
    const stored = Number(sessionStorage.getItem("binix-otp-resend-after") || "60");
    setSeconds(Number.isFinite(stored) ? stored : 60);
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  function setDigit(index: number, raw: string) {
    const value = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;

    setDigits(next);
    setError("");
    setMessage("");

    if (value && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }

    if (value && next.every(Boolean)) {
      queueMicrotask(() => {
        void verifyCode(next.join(""));
      });
    }
  }

  function keyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function paste(event: ClipboardEvent<HTMLDivElement>) {
    const values = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (!values.length) return;
    event.preventDefault();

    const next = Array(OTP_LENGTH).fill("");
    values.forEach((value, index) => {
      next[index] = value;
    });

    setDigits(next);
    setError("");
    refs.current[Math.min(values.length, OTP_LENGTH) - 1]?.focus();
  }

  const complete = digits.every(Boolean);

  const verifyCode = useCallback(
    async (code: string) => {
      if (
        code.length !== OTP_LENGTH ||
        submittingRef.current ||
        !phone ||
        (Boolean(
          serviceCandidate,
        ) &&
          !serviceIntentReady)
      ) {
        return;
      }

      submittingRef.current = true;
      setLoading(true);
      setError("");
      setMessage("");

      try {
        await verifyOtpApi(phone, code);

        sessionStorage.removeItem("binix-dev-otp-code");
        sessionStorage.removeItem("binix-otp-resend-after");

        toast.success("ورود موفق بود", {
          description: "در حال انتقال به پنل Binix...",
        });

        router.push(returnPath ?? (service ? `/app?service=${service}` : "/app"));
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "کد تأیید بررسی نشد.";

        setError(message);
        toast.error("ورود انجام نشد", {
          description: message,
        });

        submittingRef.current = false;
        setLoading(false);
      }
    },
    [
      phone,
      router,
      service,
      serviceCandidate,
      serviceIntentReady,
      returnPath,
    ],
  );

  async function submitOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!complete) return;

    await verifyCode(digits.join(""));
  }

  async function resend() {
    if (seconds > 0 || resending || !phone) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      const result = await requestOtpApi(phone);
      setSeconds(result.resendAfterSeconds);
      setDevCode(result.devCode || "");

      sessionStorage.setItem(
        "binix-otp-resend-after",
        String(result.resendAfterSeconds),
      );

      if (result.devCode) {
        sessionStorage.setItem("binix-dev-otp-code", result.devCode);
      }

      setDigits(Array(OTP_LENGTH).fill(""));
      setMessage("کد جدید آماده شد.");

      toast.success("کد جدید آماده شد", {
        description:
          result.devCode
            ? `در حالت تست از کد ${result.devCode} استفاده کنید.`
            : "کد تأیید جدید ارسال شد.",
      });

      refs.current[0]?.focus();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ارسال مجدد انجام نشد.";
      setError(message);
      toast.error("ارسال مجدد انجام نشد", { description: message });
    } finally {
      setResending(false);
    }
  }

  const loginParams = new URLSearchParams();
  if (service) loginParams.set("service", service);
  if (returnPath) loginParams.set("next", returnPath);
  const loginHref = loginParams.size ? `/login?${loginParams.toString()}` : "/login";

  return (
    <GlassAuthShell
      eyebrow="تأیید ورود"
      title="کد تأیید را وارد کنید"
      description={
        <>
          کد ۵ رقمی مربوط به شماره{" "}
          <span dir="ltr" className="font-medium text-white/70">
            {formatPhone(phone)}
          </span>{" "}
          را وارد کنید.
        </>
      }
      secondaryHref={loginHref}
      secondaryLabel="تغییر شماره"
      visualTitle={
        <>
          یک قدم تا ورود
          <span className="mx-2 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
            امن
          </span>
          به Binix
        </>
      }
      visualDescription="نشست شما بعد از تأیید کد با Cookie امن و HttpOnly ساخته می‌شود و دسترسی پنل بر اساس همان نشست کنترل می‌شود."
      visualIcon={<ShieldCheck size={27} />}
    >
      <form onSubmit={submitOtp} className="space-y-5">
        <div dir="ltr" onPaste={paste} className="grid grid-cols-5 gap-2.5">
          {digits.map((digit, index) => (
            <motion.input
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              value={digit}
              onChange={(event) => setDigit(index, event.target.value)}
              onKeyDown={(event) => keyDown(index, event)}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`رقم ${index + 1}`}
              aria-invalid={Boolean(error)}
              whileFocus={{ y: -1 }}
              className={
                error
                  ? "font-display h-14 min-w-0 rounded-xl border border-red-400/35 bg-white/[0.035] text-center text-xl font-bold text-white outline-none backdrop-blur-xl transition focus:ring-2 focus:ring-red-300/10"
                  : "font-display h-14 min-w-0 rounded-xl border border-white/[0.09] bg-white/[0.035] text-center text-xl font-bold text-white outline-none backdrop-blur-xl transition hover:border-white/[0.13] focus:border-primary/45 focus:ring-2 focus:ring-primary/10"
              }
            />
          ))}
        </div>

        {(error || message) && (
          <div
            className={
              error
                ? "font-ui rounded-xl border border-red-400/20 bg-red-400/[0.055] px-3.5 py-3 text-[9.5px] leading-5 text-red-200 backdrop-blur-xl"
                : "font-ui flex items-center gap-2 rounded-xl border border-emerald-400/18 bg-emerald-400/[0.05] px-3.5 py-3 text-[9.5px] leading-5 text-emerald-200 backdrop-blur-xl"
            }
          >
            {!error && <CheckCircle2 size={13} />}
            {error || message}
          </div>
        )}

        <button
          type="submit"
          disabled={!complete || loading}
          className="font-ui flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[11px] font-bold text-white shadow-[0_12px_28px_rgba(7,139,255,.18)] transition hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_16px_34px_rgba(7,139,255,.24)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
              در حال بررسی...
            </>
          ) : (
            <>
              ورود به پنل
              <ArrowLeft size={14} />
            </>
          )}
        </button>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.055] pt-4">
          <button
            type="button"
            onClick={resend}
            disabled={seconds > 0 || resending}
            className="font-ui inline-flex items-center gap-2 text-[9.5px] text-white/40 transition hover:text-white/72 disabled:cursor-not-allowed disabled:text-white/20"
          >
            <RotateCcw size={12} />
            {resending
              ? "در حال ارسال..."
              : seconds > 0
                ? `ارسال مجدد تا ${seconds.toLocaleString("fa-IR")} ثانیه`
                : "ارسال مجدد کد"}
          </button>

          <Link
            href={loginHref}
            className="font-ui text-[9.5px] text-white/35 transition hover:text-white/70"
          >
            تغییر شماره
          </Link>
        </div>

        {devCode && (
          <div className="font-ui flex items-center justify-center gap-2 pt-1 text-[8.5px] text-white/24">
            <LockKeyhole size={11} />
            کد تست:
            <span dir="ltr" className="text-amber-200">
              {devCode}
            </span>
          </div>
        )}
      </form>
    </GlassAuthShell>
  );
}


export default function OtpPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <OtpPageContent />
    </Suspense>
  );
}

function AuthPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020817] px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="mx-auto h-10 w-28 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="grid grid-cols-5 gap-2.5">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-14 animate-pulse rounded-xl bg-white/[0.05]"
            />
          ))}
        </div>
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  );
}
