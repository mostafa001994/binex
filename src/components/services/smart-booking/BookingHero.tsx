"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BellRing,
  CalendarCheck2,
  Check,
  Clock3,
  Link2,
  UsersRound,
} from "lucide-react";

const highlights = [
  { icon: CalendarCheck2, label: "رزرو آنلاین" },
  { icon: Clock3, label: "کنترل ساعات کاری" },
  { icon: UsersRound, label: "مدیریت ظرفیت" },
  { icon: BellRing, label: "یادآوری" },
];

export default function BookingHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_73%_20%,rgba(var(--service-accent-rgb),.12),transparent_28%),radial-gradient(circle_at_18%_82%,rgba(var(--service-accent-rgb),.05),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[.16] [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="lg:order-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-service-accent"
          >
            <CalendarCheck2 size={14} />
            نوبت‌دهی هوشمند
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display mt-5 max-w-[760px] text-4xl font-black leading-[1.5] text-marketing-text sm:text-5xl lg:text-[52px]"
          >
            مشتری آنلاین نوبت می‌گیرد؛
            <span className="mx-2 bg-gradient-to-l from-service-accent to-service-accent-secondary bg-clip-text text-transparent">
              شما برنامه را مدیریت
            </span>
            می‌کنید
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="font-ui mt-5 max-w-[700px] text-[14px] leading-8 text-marketing-text-muted sm:text-[15px]"
          >
            Binix رزروهای پراکنده در تماس و پیام را به یک مسیر روشن تبدیل
            می‌کند؛ مشتری زمان مناسب را می‌بیند و شما خدمات، ظرفیت، ساعت کاری
            و برنامه روزانه را مدیریت می‌کنید.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {["رزرو بدون رفت‌وبرگشت پیام", "ظرفیت و ساعت کاری واقعی", "کنترل کامل در دست مدیر"].map(
              (item) => (
                <span
                  key={item}
                  className="font-ui inline-flex items-center gap-1.5 rounded-full border border-marketing-border bg-white/[0.025] px-3 py-1.5 text-[10.5px] text-marketing-text-muted"
                >
                  <Check size={11} className="text-service-accent" />
                  {item}
                </span>
              ),
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#booking-request"
              className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-5 text-xs font-bold text-white shadow-[0_10px_35px_rgba(var(--service-accent-rgb),.18)] transition hover:-translate-y-0.5"
            >
              درخواست بررسی رایگان
              <ArrowLeft size={15} />
            </a>

            <a
              href="#booking-flow"
              className="font-ui inline-flex h-12 items-center gap-2 rounded-control border border-marketing-border bg-white/[0.025] px-5 text-xs font-semibold text-marketing-text transition hover:bg-white/[0.05]"
            >
              دیدن جریان رزرو
              <Link2 size={14} />
            </a>
          </motion.div>

          <div className="mt-9 grid max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-4">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + index * 0.06 }}
                  className="rounded-card border border-marketing-border bg-marketing-surface/55 p-3"
                >
                  <Icon size={16} className="text-service-accent" />
                  <div className="font-ui mt-2 text-[10.5px] text-marketing-text-muted">
                    {item.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="lg:order-1">
          <BookingPreview reduceMotion={Boolean(reduceMotion)} />
        </div>
      </div>
    </section>
  );
}

function BookingPreview({ reduceMotion }: { reduceMotion: boolean }) {
  const days = [
    ["ش", "۳۰"],
    ["ی", "۳۱"],
    ["د", "۱"],
    ["س", "۲"],
    ["چ", "۳"],
  ];

  const times = ["۱۰:۰۰", "۱۱:۳۰", "۱۳:۰۰", "۱۵:۳۰", "۱۷:۰۰", "۱۸:۳۰"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 26, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.1 }}
      className="relative mx-auto w-full max-w-[510px]"
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.05, 1], opacity: [0.35, 0.6, 0.35] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -inset-8 rounded-full bg-service-accent/[0.1] blur-[90px]"
      />

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-marketing-surface/95 shadow-[0_35px_100px_rgba(0,0,0,.4)]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <div className="font-display text-sm font-bold text-marketing-text">
              رزرو جدید
            </div>
            <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
              نمونه تجربه مشتری
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-full border border-service-accent/20 bg-service-accent/10 text-service-accent">
            <CalendarCheck2 size={18} />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="rounded-card border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="font-ui text-[9.5px] text-marketing-text-subtle">خدمت</div>
            <div className="font-display mt-1.5 text-sm font-bold text-marketing-text">
              مشاوره تخصصی
            </div>
            <div className="font-ui mt-1 text-[9.5px] text-marketing-text-muted">
              ۴۵ دقیقه
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {days.map(([day, date], index) => (
              <motion.div
                key={`${day}-${date}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className={
                  index === 1
                    ? "rounded-card border border-service-accent/30 bg-service-accent/10 px-2 py-3 text-center"
                    : "rounded-card border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center"
                }
              >
                <div className="font-ui text-[9px] text-marketing-text-subtle">{day}</div>
                <div className="font-display mt-1 text-sm font-bold text-marketing-text">{date}</div>
              </motion.div>
            ))}
          </div>

          <div className="font-ui mt-5 mb-2 text-[9.5px] text-marketing-text-subtle">
            ساعت‌های آزاد
          </div>

          <div className="grid grid-cols-3 gap-2">
            {times.map((time, index) => (
              <motion.div
                key={time}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.04 }}
                className={
                  index === 3
                    ? "font-ui rounded-control border border-service-accent/30 bg-service-accent/10 px-2 py-2.5 text-center text-[10.5px] text-service-accent"
                    : "font-ui rounded-control border border-white/[0.06] bg-white/[0.02] px-2 py-2.5 text-center text-[10.5px] text-marketing-text-muted"
                }
              >
                {time}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="font-ui mt-4 flex h-11 items-center justify-center rounded-control bg-service-accent text-[10.5px] font-bold text-white"
          >
            نمونه ثبت رزرو
          </motion.div>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="font-ui text-[9px] text-marketing-text-subtle">
            این رابط نمونه نمایشی جریان رزرو است.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
