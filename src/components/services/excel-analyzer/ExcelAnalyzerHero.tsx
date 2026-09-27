"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  FileSearch2,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

const items = [
  { icon: FileSpreadsheet, label: "XLSX / XLS / CSV" },
  { icon: FileSearch2, label: "بررسی کیفیت" },
  { icon: BarChart3, label: "گزارش مدیریتی" },
  { icon: ShieldCheck, label: "خروجی شفاف" },
];

export default function ExcelAnalyzerHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(var(--service-accent-rgb),.12),transparent_28%),radial-gradient(circle_at_18%_82%,rgba(var(--service-accent-rgb),.05),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[.15] [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:46px_46px]" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
        <div className="lg:order-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-service-accent"
          >
            <FileSpreadsheet size={14} />
            تحلیلگر اکسل Binix
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display mt-5 max-w-[760px] text-4xl font-black leading-[1.55] text-marketing-text sm:text-5xl lg:text-[56px]"
          >
            از فایل‌های شلوغ Excel،
            <span className="mx-2 bg-gradient-to-l from-service-accent to-service-accent-secondary bg-clip-text text-transparent">
              گزارش قابل تصمیم
            </span>
            بسازید
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="font-ui mt-5 max-w-[710px] text-[14px] leading-8 text-marketing-text-muted sm:text-[15px]"
          >
            تحلیلگر اکسل Binix برای فایل‌های ساختاریافته، کیفیت داده را بررسی می‌کند و روندها، موارد غیرعادی و خلاصه مدیریتی را در یک خروجی قابل‌فهم کنار هم قرار می‌دهد. پردازش واقعی در فاز آزمایشی و پس از بررسی فایل فعال می‌شود.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="#excel-pilot"
              className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-5 text-xs font-bold text-white shadow-[0_10px_35px_rgba(var(--service-accent-rgb),.18)] transition hover:-translate-y-0.5"
            >
              درخواست تحلیل آزمایشی
              <ArrowLeft size={15} />
            </Link>

            <Link
              href="#excel-report-preview"
              className="font-ui inline-flex h-12 items-center gap-2 rounded-control border border-marketing-border bg-white/[0.025] px-5 text-xs font-semibold text-marketing-text transition hover:bg-white/[0.05]"
            >
              مشاهده نمونه خروجی
              <Sparkles size={14} />
            </Link>
          </motion.div>

          <div className="mt-9 grid max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((item, index) => {
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
          <UploadPreview reduceMotion={Boolean(reduceMotion)} />
        </div>
      </div>
    </section>
  );
}

function UploadPreview({ reduceMotion }: { reduceMotion: boolean }) {
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
              تحلیل فایل جدید
            </div>
            <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
              نمونه رابط آپلود
            </div>
          </div>
          <FileSpreadsheet size={19} className="text-service-accent" />
        </div>

        <div className="p-5">
          <div className="rounded-[22px] border border-dashed border-service-accent/30 bg-service-accent/[0.045] px-5 py-8 text-center">
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -4, 0], scale: [1, 1.03, 1] }
              }
              transition={{ duration: 3.6, repeat: Infinity }}
              className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-service-accent/20 bg-service-accent/10 text-service-accent"
            >
              <UploadCloud size={24} />
            </motion.div>
            <div className="font-display mt-4 text-sm font-bold text-marketing-text">
              فایل فروش مرداد.xlsx
            </div>
            <div className="font-ui mt-2 text-[9.5px] text-marketing-text-subtle">
              XLSX • ۱.۸ مگابایت • داده نمایشی
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[
              ["ستون‌ها شناسایی شدند", "۱۲ ستون"],
              ["ردیف‌ها آماده بررسی", "۲,۸۴۰ ردیف"],
              ["هشدار اولیه کیفیت", "۷ مورد"],
            ].map(([label, value], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.08 }}
                className="flex items-center justify-between rounded-card border border-white/[0.055] bg-white/[0.025] px-3 py-3"
              >
                <span className="font-ui text-[10px] text-marketing-text-muted">{label}</span>
                <span className="font-display text-[11px] font-bold text-marketing-text">{value}</span>
              </motion.div>
            ))}
          </div>

          <div className="font-ui mt-4 flex h-11 items-center justify-center gap-2 rounded-control bg-service-accent text-[10.5px] font-bold text-white">
            <Sparkles size={14} />
            نمونه شروع تحلیل
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="font-ui text-[9px] text-marketing-text-subtle">
            این بخش نمونه نمایشی تجربه محصول است و فایل واقعی پردازش نمی‌کند.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
