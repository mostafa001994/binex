"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { iconRegistry } from "@/constants/icon-registry";
import { usePublicServices } from "@/hooks/use-public-services";
import {
  type LucideIcon,
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type AuthStep = "phone" | "otp" | "profile";
type ServiceIntent = string | null;

const steps: Array<{ id: AuthStep; label: string }> = [
  { id: "phone", label: "شماره موبایل" },
  { id: "otp", label: "تأیید شماره" },
  { id: "profile", label: "آماده‌سازی حساب" },
];

export function AuthExperienceShell({
  step,
  title,
  description,
  children,
  serviceIntent,
}: {
  step: AuthStep;
  title: string;
  description: string;
  children: React.ReactNode;
  serviceIntent?: ServiceIntent;
}) {
  const reduceMotion = useReducedMotion();
  const { services } = usePublicServices();
  const service = serviceIntent
    ? services?.find(
        (item) =>
          item.id ===
          serviceIntent,
      ) ?? null
    : null;
  const activeIndex = steps.findIndex((item) => item.id === step);

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[.18] [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:56px_56px]" />

      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.35, 0.52, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 top-0 size-[360px] rounded-full bg-primary/10 blur-[110px]"
      />
      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.18, 0.32, 0.18], x: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 left-0 size-[320px] rounded-full bg-accent/[0.07] blur-[100px]"
      />

      <div className="relative mx-auto grid min-h-screen max-w-[1380px] lg:grid-cols-[.95fr_1.05fr]">
        <aside className="relative hidden border-l border-white/[0.06] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08]">
                <Sparkles size={18} className="text-primary" />
                <span className="absolute -left-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#020817] bg-emerald-400" />
              </div>
              <div>
                <div className="font-display text-lg font-black tracking-wide">BINIX</div>
                <div className="font-ui mt-0.5 text-[9px] text-white/35">AI Business Platform</div>
              </div>
            </Link>

            <div className="mt-20 max-w-[500px]">
              <div className="font-ui inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/[0.055] px-3 py-1.5 text-[10.5px] font-semibold text-accent">
                <ShieldCheck size={13} />
                ورود سریع و امن به Binix
              </div>

              <h2 className="font-display mt-5 text-3xl font-black leading-[1.8] text-white xl:text-[40px]">
                ساده، خلوت و
                <span className="mx-2 bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                  زنده
                </span>
                مثل یک محصول حرفه‌ای
              </h2>

              <p className="font-ui mt-4 max-w-[470px] text-[12.5px] leading-8 text-white/52">
                از همین صفحه کاربر باید حس کند وارد یک محصول هوشمند و سریع شده است؛
                نه فقط یک فرم ورود ساده.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mt-12 max-w-[520px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.03] p-5"
            >
              <motion.div
                animate={reduceMotion ? undefined : { x: [0, 10, 0], opacity: [0.28, 0.46, 0.28] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute left-6 top-6 h-20 w-20 rounded-full bg-accent/[0.08] blur-3xl"
              />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-base font-bold text-white">شروع کار در Binix</div>
                  <div className="font-ui mt-1 text-[9px] text-white/35">ورود ← تأیید ← شروع سرویس</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.06] px-2.5 py-1 text-[9px] text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Live Flow
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {(services || [])
                  .filter(
                    (item) =>
                      item.availability ===
                      "available",
                  )
                  .slice(0, 3)
                  .map(
                    (item, index) => {
                      const CurrentIcon =
                        iconRegistry[
                          item.iconKey
                        ] ??
                        iconRegistry[
                          "layout-grid"
                        ];

                      return (
                        <motion.div
                          key={item.id}
                          animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
                          transition={{ duration: 4.6 + index, repeat: Infinity, ease: "easeInOut" }}
                          className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <CurrentIcon size={16} />
                            </div>
                            <div className="font-ui text-[11px] text-white/70">
                              {item.name}
                            </div>
                          </div>
                          <div className="font-ui text-[9px] text-white/28">
                            آماده ورود
                          </div>
                        </motion.div>
                      );
                    },
                  )}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-white/35">
            <TrustChip icon={LockKeyhole} label="OTP امن" />
            <TrustChip icon={ShieldCheck} label="بدون رمز ثابت" />
          </div>
        </aside>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[520px]">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <Link href="/" className="font-display text-lg font-black text-white">BINIX</Link>
              <Link href="/" className="font-ui flex items-center gap-1.5 text-[11px] text-white/45">
                بازگشت
                <ArrowLeft size={13} />
              </Link>
            </div>

            <StepIndicator activeIndex={activeIndex} />

            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
              className="mt-6 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#06111F]/92 shadow-[0_35px_100px_rgba(0,0,0,.35)] backdrop-blur-xl"
            >
              <div className="border-b border-white/[0.06] px-5 py-6 sm:px-7 sm:py-7">
                <h1 className="font-display text-2xl font-black leading-relaxed text-white sm:text-[29px]">{title}</h1>
                <p className="font-ui mt-2 text-[12px] leading-7 text-white/48">{description}</p>
              </div>

              {service && (
                <ServiceIntentBanner
                  icon={
                    iconRegistry[
                      service.iconKey
                    ] ??
                    iconRegistry[
                      "layout-grid"
                    ]
                  }
                  title={
                    service.name
                  }
                  text={`بعد از ورود می‌توانید راه‌اندازی «${service.shortName}» را ادامه دهید.`}
                />
              )}

              <div className="p-5 sm:p-7">{children}</div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StepIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <div
              className={
                done
                  ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"
                  : active
                    ? "flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
                    : "flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/30"
              }
            >
              {done ? <CheckCircle2 size={14} /> : <span className="font-ui text-[9px]">{index + 1}</span>}
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className={active ? "font-ui truncate text-[9.5px] font-semibold text-white/75" : "font-ui truncate text-[9.5px] text-white/30"}>
                {step.label}
              </div>
            </div>
            {index < steps.length - 1 && <div className="h-px min-w-4 flex-1 bg-white/[0.07]" />}
          </div>
        );
      })}
    </div>
  );
}

function TrustChip({ icon: Icon, label }: { icon: typeof LockKeyhole; label: string }) {
  return (
    <div className="font-ui inline-flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-[10px] text-white/42">
      <Icon size={13} className="text-primary" />
      {label}
    </div>
  );
}

function ServiceIntentBanner({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="border-b border-white/[0.06] bg-accent/[0.035] px-5 py-4 sm:px-7">
      <div className="flex gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/[0.07] text-accent">
          <Icon size={16} />
        </div>
        <div>
          <div className="font-ui text-[10px] font-semibold text-accent">ادامه برای {title}</div>
          <div className="font-ui mt-1 text-[9.5px] leading-5 text-white/40">{text}</div>
        </div>
      </div>
    </div>
  );
}
