"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BarChart3, FileSpreadsheet, Gauge, LayoutDashboard, TrendingUp } from "lucide-react";

const highlights = [
  { icon: FileSpreadsheet, label: "منبع اولیه", value: "Excel" },
  { icon: LayoutDashboard, label: "محل نمایش", value: "داخل Binix" },
  { icon: BarChart3, label: "ماژول نخست", value: "فروش" },
  { icon: Gauge, label: "خروجی", value: "KPI و بینش" },
];

export default function BIHero() {
  const reduceMotion = useReducedMotion();
  return (
    <section dir="rtl" className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(var(--service-accent-rgb),.14),transparent_30%),radial-gradient(circle_at_18%_82%,rgba(var(--service-accent-rgb),.06),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="lg:order-2">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-service-accent"><TrendingUp size={14} /> هوش تجاری برای مدیریت فروش</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }} className="font-display mt-5 max-w-[790px] text-4xl font-black leading-[1.55] text-marketing-text sm:text-5xl lg:text-[56px]">
            فروش را فقط پایان ماه نبینید؛
            <span className="mx-2 bg-gradient-to-l from-service-accent to-service-accent-secondary bg-clip-text text-transparent">هر روز زیر نظر داشته باشید</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }} className="font-ui mt-5 max-w-[720px] text-[14px] leading-8 text-marketing-text-muted sm:text-[15px]">
            Binix اطلاعات فروش موجود در فایل‌های Excel شما را به شاخص‌های روشن، روندهای قابل مقایسه و یک داشبورد مدیریتی داخل پنل تبدیل می‌کند؛ تا سریع‌تر بفهمید چه چیزی تغییر کرده و کجا باید اقدام کنید.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-wrap gap-3">
            <Link href="#bi-request" className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-5 text-xs font-bold text-white shadow-[0_10px_35px_rgba(var(--service-accent-rgb),.18)] transition hover:-translate-y-0.5">درخواست بررسی رایگان BI <ArrowLeft size={15} /></Link>
            <Link href="#bi-preview" className="font-ui inline-flex h-12 items-center gap-2 rounded-control border border-marketing-border bg-white/[0.025] px-5 text-xs font-semibold text-marketing-text transition hover:bg-white/[0.05]">مشاهده نمونه داشبورد <LayoutDashboard size={15} /></Link>
          </motion.div>
          <div className="mt-9 grid max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-4">
            {highlights.map((item, index) => { const Icon = item.icon; return (
              <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + index * 0.06 }} className="rounded-card border border-marketing-border bg-marketing-surface/55 p-3">
                <Icon size={16} className="text-service-accent" /><div className="font-ui mt-2 text-[9px] text-marketing-text-subtle">{item.label}</div><div className="font-display mt-1 text-xs font-bold text-marketing-text">{item.value}</div>
              </motion.div>
            ); })}
          </div>
        </div>
        <div className="lg:order-1"><BIMiniPreview reduceMotion={Boolean(reduceMotion)} /></div>
      </div>
    </section>
  );
}

function BIMiniPreview({ reduceMotion }: { reduceMotion: boolean }) {
  const bars = [38, 48, 44, 61, 57, 69, 76, 84];
  return (
    <motion.div initial={{ opacity: 0, x: 26, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.1 }} className="relative mx-auto w-full max-w-[520px]">
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-service-accent/[0.1] blur-[90px]" />
      <motion.div animate={reduceMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }} className="relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-marketing-surface/95 shadow-[0_35px_100px_rgba(0,0,0,.4)]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><div className="font-display text-sm font-bold text-marketing-text">نمای فروش</div><div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">داشبورد داخل Binix</div></div><span className="font-ui rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[9px] text-emerald-300">نمونه نمایشی</span></div>
        <div className="grid grid-cols-3 gap-2 p-4">{[["فروش خالص", "۲۴۰ م.ت"], ["رشد دوره", "۱۸٪"], ["تعداد سفارش", "۱۳۴"]].map(([label, value]) => <div key={label} className="rounded-card border border-white/[0.055] bg-white/[0.025] p-3"><div className="font-ui text-[9px] text-marketing-text-subtle">{label}</div><div className="font-display mt-2 text-lg font-bold text-marketing-text">{value}</div></div>)}</div>
        <div className="px-4 pb-4"><div className="rounded-card border border-white/[0.055] bg-white/[0.02] p-4"><div className="font-ui mb-3 text-[9.5px] text-marketing-text-subtle">روند فروش دوره‌ای</div><div className="flex h-40 items-end gap-2">{bars.map((height, index) => <motion.div key={`${height}-${index}`} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: 0.4 + index * 0.04, duration: 0.45 }} className="flex-1 rounded-t-[5px] bg-gradient-to-t from-service-accent/55 to-service-accent-secondary" />)}</div></div></div>
        <div className="border-t border-white/[0.06] px-4 py-3"><div className="font-ui text-[9px] text-marketing-text-subtle">اعداد این تصویر نمایشی‌اند و داده واقعی هیچ کسب‌وکاری نیستند.</div></div>
      </motion.div>
    </motion.div>
  );
}
