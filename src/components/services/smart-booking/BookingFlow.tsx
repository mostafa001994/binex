"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const steps = [
  {
    number: "۰۱",
    icon: CalendarDays,
    title: "انتخاب خدمت",
    description: "مشتری خدمت موردنظر را انتخاب می‌کند.",
  },
  {
    number: "۰۲",
    icon: Clock3,
    title: "دیدن زمان‌های واقعی",
    description: "فقط بازه‌های آزاد مطابق ظرفیت نمایش داده می‌شوند.",
  },
  {
    number: "۰۳",
    icon: CheckCircle2,
    title: "ثبت و تأیید",
    description: "رزرو با اطلاعات لازم ثبت و وضعیت آن مشخص می‌شود.",
  },
  {
    number: "۰۴",
    icon: BellRing,
    title: "یادآوری و پیگیری",
    description: "پیش از مراجعه، مسیر یادآوری و تغییر نوبت مدیریت می‌شود.",
  },
];

export default function BookingFlow() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="booking-flow"
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,#050A13_0%,#07101D_50%,#050A13_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-service-accent/[0.035] blur-[120px]" />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            جریان رزرو
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            مشتری فقط زمان انتخاب نمی‌کند؛ قوانین واقعی کسب‌وکار هم باید رعایت شود
          </h2>
          <p className="font-ui mt-3 text-[12.5px] leading-7 text-marketing-text-muted">
            مدت خدمت، ظرفیت، ساعت کاری و تعطیلی باید قبل از نمایش گزینه‌های رزرو در محاسبه لحاظ شوند.
          </p>
        </div>

        <div className="relative mt-14 hidden lg:block">
          <div className="absolute left-[8%] right-[8%] top-[47px] h-px bg-gradient-to-l from-service-accent/10 via-service-accent/55 to-service-accent/10" />

          {!reduceMotion && (
            <motion.div
              animate={{ left: ["92%", "8%"] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: "linear" }}
              className="absolute top-[41px] z-20 size-3 -translate-x-1/2 rounded-full bg-service-accent shadow-[0_0_20px_rgba(var(--service-accent-rgb),.65)]"
            />
          )}

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08 }}
                  className="text-center"
                >
                  <div className="relative z-10 mx-auto flex size-[94px] items-center justify-center">
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : { scale: [1, 1.07, 1], opacity: [0.72, 1, 0.72] }
                      }
                      transition={{ duration: 4 + index * 0.4, repeat: Infinity }}
                      className="absolute size-[70px] rounded-full border border-service-accent/20 bg-marketing-background"
                    />
                    <Icon size={21} className="relative text-service-accent" />
                    <span className="font-ui absolute -top-1 text-[9px] text-marketing-text-subtle">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-base font-bold text-marketing-text">
                    {step.title}
                  </h3>
                  <p className="font-ui mx-auto mt-2 max-w-[230px] text-[11.5px] leading-6 text-marketing-text-muted">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-12 lg:hidden">
          <div className="absolute bottom-6 right-[20px] top-6 w-px bg-gradient-to-b from-service-accent/65 to-transparent" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 pb-9 last:pb-0"
              >
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-service-accent/25 bg-marketing-background text-service-accent">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="font-ui text-[9.5px] text-service-accent">{step.number}</div>
                  <h3 className="font-display mt-1 text-sm font-bold text-marketing-text">{step.title}</h3>
                  <p className="font-ui mt-1.5 text-[11.5px] leading-6 text-marketing-text-muted">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
