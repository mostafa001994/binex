"use client";

import { motion } from "framer-motion";
import { CalendarCog, CheckCircle2, ClipboardCheck, Rocket } from "lucide-react";

const steps = [
  {
    number: "۰۱",
    icon: ClipboardCheck,
    title: "بررسی فرایند فعلی",
    text: "خدمات، روش ثبت نوبت و گلوگاه‌های فعلی کسب‌وکار مرور می‌شوند.",
  },
  {
    number: "۰۲",
    icon: CalendarCog,
    title: "تعریف قوانین رزرو",
    text: "مدت، ظرفیت، ساعات کاری، تعطیلی و شرایط تغییر نوبت مشخص می‌شوند.",
  },
  {
    number: "۰۳",
    icon: CheckCircle2,
    title: "آزمایش سناریوها",
    text: "رزرو، تکمیل ظرفیت، لغو و جابه‌جایی پیش از تحویل بررسی می‌شوند.",
  },
  {
    number: "۰۴",
    icon: Rocket,
    title: "راه‌اندازی و همراهی",
    text: "سرویس فعال می‌شود و مدیریت وضعیت آن از Binix ادامه پیدا می‌کند.",
  },
];

export default function BookingLaunchSteps() {
  return (
    <section dir="rtl" className="relative overflow-hidden border-y border-marketing-border bg-[#06101d] px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[720px] -translate-x-1/2 rounded-full bg-service-accent/[0.05] blur-[110px]" />
      <div className="relative mx-auto max-w-[1120px]">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            مسیر همکاری
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            از قوانین واقعی کسب‌وکار تا نوبت‌دهی قابل استفاده
          </h2>
          <p className="font-ui mt-3 text-[12.5px] leading-7 text-marketing-text-muted">
            راه‌اندازی با شناخت فرایند شما شروع می‌شود، نه با تحویل یک تقویم آماده.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06 }}
                className="relative rounded-card border border-marketing-border bg-marketing-surface/65 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/8 text-service-accent">
                    <Icon size={17} />
                  </div>
                  <span className="font-ui text-[10px] text-service-accent">{step.number}</span>
                </div>
                <h3 className="font-display mt-5 text-base font-bold text-marketing-text">
                  {step.title}
                </h3>
                <p className="font-ui mt-2 text-[11px] leading-6 text-marketing-text-muted">
                  {step.text}
                </p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#booking-request"
            className="font-ui inline-flex h-12 items-center justify-center rounded-control bg-service-accent px-6 text-xs font-bold text-white shadow-[var(--service-accent-glow)] transition hover:-translate-y-0.5"
          >
            بررسی نوبت‌دهی برای کسب‌وکار من
          </a>
        </div>
      </div>
    </section>
  );
}

