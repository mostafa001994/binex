"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCheck, FileSpreadsheet, Gauge, LayoutDashboard, Lightbulb } from "lucide-react";

const steps = [
  { icon: FileSpreadsheet, title: "فایل‌های Excel فروش", text: "منبع فعلی اطلاعات شما" },
  { icon: CheckCheck, title: "بررسی و یکپارچه‌سازی", text: "ساختار ستون‌ها و کیفیت داده" },
  { icon: Gauge, title: "تعریف KPI فروش", text: "شاخص‌های متناسب با تصمیم شما" },
  { icon: LayoutDashboard, title: "داشبورد داخل Binix", text: "یک نمای مشترک و قابل دسترس" },
  { icon: Lightbulb, title: "بینش و اقدام", text: "تغییرات و نقاط نیازمند توجه" },
];

export default function BIDataFlow() {
  return (
    <section dir="rtl" className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-3xl"><div className="font-ui text-[10.5px] font-semibold text-service-accent">از فایل تا تصمیم</div><h2 className="font-display mt-3 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">یک مسیر روشن برای تبدیل داده فروش به دید مدیریتی</h2><p className="font-ui mt-3 text-[12.5px] leading-8 text-marketing-text-muted">ساختار دقیق دریافت و به‌روزرسانی فایل در مرحله راه‌اندازی و متناسب با فرایند کسب‌وکار شما مشخص می‌شود.</p></div>
        <div className="mt-12 grid gap-3 lg:grid-cols-5">{steps.map((step, index) => { const Icon = step.icon; return <div key={step.title} className="relative"><motion.article initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} className="h-full rounded-card border border-marketing-border bg-marketing-surface/65 p-5"><div className="flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-control bg-service-accent/10 text-service-accent"><Icon size={19} /></div><span className="font-display text-xs text-marketing-text-subtle">۰{index + 1}</span></div><h3 className="font-display mt-4 text-sm font-bold text-marketing-text">{step.title}</h3><p className="font-ui mt-2 text-[10.5px] leading-6 text-marketing-text-muted">{step.text}</p></motion.article>{index < steps.length - 1 ? <ArrowLeft size={16} className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 text-service-accent lg:block" /> : null}</div>; })}</div>
      </div>
    </section>
  );
}
