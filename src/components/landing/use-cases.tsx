"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseBusiness,
  HeartPulse,
  ShoppingBag,
  FileSpreadsheet,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const cases = [
  { icon: ShoppingBag, title: "فروشگاه‌های فعال در پیام‌رسان", text: "پاسخ‌گویی، معرفی محصول و هدایت مشتری در مسیر سفارش." },
  { icon: HeartPulse, title: "مراکز خدماتی و نوبت‌محور", text: "مدیریت درخواست‌های رزرو، ظرفیت و زمان‌های کاری." },
  { icon: BriefcaseBusiness, title: "مدیران و تیم‌های عملیاتی", text: "دسترسی منظم‌تر به گزارش‌ها و شاخص‌های موردنیاز تصمیم‌گیری." },
  { icon: FileSpreadsheet, title: "تیم‌های وابسته به Excel", text: "بررسی کیفیت داده و آماده‌سازی خروجی‌های مدیریتی." },
];

const desktopPositions = [
  "right-[3%] top-[10%]",
  "left-[4%] top-[12%]",
  "right-[7%] bottom-[9%]",
  "left-[8%] bottom-[8%]",
  "right-[34%] top-[2%]",
  "left-[34%] bottom-[1%]",
];

export default function UseCases() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="rtl"
      id="use-cases"
      className="relative overflow-hidden border-y border-marketing-border bg-marketing-background px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.22, 0.35, 0.22] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(0,213,232,.08)_1px,transparent_1px)] [background-size:42px_42px]"
      />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.07, 1], opacity: [0.3, 0.5, 0.3] }
        }
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-[60%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1220px]">
        <SectionHeading
          badge="برای چه کسب‌وکارهایی؟"
          title="Binix برای چه کسب‌وکارهایی مناسب است؟"
          description="هر کسب‌وکار مسئله متفاوتی دارد؛ سرویس مناسب باید بر اساس فرایند واقعی و نیاز همان مجموعه انتخاب شود."
          className="mb-12"
        />

        <div className="relative hidden min-h-[560px] lg:block">
          <NetworkLines reduceMotion={Boolean(reduceMotion)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            className="absolute left-1/2 top-1/2 z-20 flex size-[188px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-accent/25 bg-marketing-surface shadow-[0_0_80px_rgba(0,213,232,.09)]"
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }
              }
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-3 rounded-full border border-accent/10"
            />
            <motion.div
              animate={reduceMotion ? undefined : { scale: [1, 0.94, 1] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-7 rounded-full bg-accent/[0.04]"
            />
            <span className="font-display relative text-3xl font-black text-marketing-text">
              BINIX
            </span>
            <span className="font-ui relative mt-2 text-[10px] text-accent">
              AI Business Platform
            </span>
          </motion.div>

          {cases.map((item, index) => {
            const Icon = item.icon;
            const float = index % 2 === 0 ? -6 : 6;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06 }}
                animate={reduceMotion ? undefined : { translateY: [0, float, 0] }}
                whileHover={{ scale: 1.015 }}
                className={`absolute z-10 w-[235px] rounded-card border border-marketing-border bg-marketing-surface/85 p-4 backdrop-blur-xl ${desktopPositions[index]}`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            boxShadow: [
                              "0 0 0 rgba(0,213,232,0)",
                              "0 0 22px rgba(0,213,232,.12)",
                              "0 0 0 rgba(0,213,232,0)",
                            ],
                          }
                    }
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.25 }}
                    className="flex size-10 shrink-0 items-center justify-center rounded-control border border-accent/15 bg-accent/[0.06] text-accent"
                  >
                    <Icon size={18} />
                  </motion.div>
                  <h3 className="font-display text-sm font-bold text-marketing-text">
                    {item.title}
                  </h3>
                </div>
                <p className="font-ui mt-3 text-[11.5px] leading-6 text-marketing-text-muted">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {cases.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -3 }}
                className="rounded-card border border-marketing-border bg-marketing-surface/80 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-control border border-accent/15 bg-accent/[0.06] text-accent">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-display text-sm font-bold text-marketing-text">
                    {item.title}
                  </h3>
                </div>
                <p className="font-ui mt-3 text-[11.5px] leading-6 text-marketing-text-muted">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a href="#consultation" className="font-ui inline-flex h-11 items-center rounded-control border border-accent/25 bg-accent/[0.07] px-5 text-xs font-bold text-accent transition hover:bg-accent/[0.12]">
            بررسی تناسب Binix با کسب‌وکار من
          </a>
        </div>
      </div>
    </section>
  );
}

function NetworkLines({ reduceMotion }: { reduceMotion: boolean }) {
  const paths = [
    "M600 280 L1040 100",
    "M600 280 L165 110",
    "M600 280 L1010 465",
    "M600 280 L190 470",
    "M600 280 L760 55",
    "M600 280 L430 520",
  ];

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 560"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="network-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(0,213,232,0)" />
          <stop offset="50%" stopColor="rgba(0,213,232,.24)" />
          <stop offset="100%" stopColor="rgba(0,213,232,0)" />
        </linearGradient>
      </defs>

      {paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          stroke="url(#network-line)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: index * 0.08 }}
          strokeDasharray={reduceMotion ? undefined : "4 8"}
          animate={
            reduceMotion
              ? undefined
              : { strokeDashoffset: [0, -48] }
          }
        />
      ))}

      {[["1040","100"],["165","110"],["1010","465"],["190","470"],["760","55"],["430","520"]].map(([cx, cy], index) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="3"
          fill="rgba(0,213,232,.5)"
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.35, 1, 0.35], r: [3, 4, 3] }
          }
          transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.25 }}
        />
      ))}
    </svg>
  );
}
