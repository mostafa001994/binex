"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Bot, CheckCircle2, MessageSquareText, PackageSearch, UserRoundCheck } from "lucide-react";
import Link from "next/link";

const flow = [
  { icon: MessageSquareText, label: "پیام مشتری" },
  { icon: Bot, label: "تشخیص نیاز" },
  { icon: PackageSearch, label: "معرفی محصول مرتبط" },
  { icon: CheckCircle2, label: "هدایت به سفارش" },
  { icon: UserRoundCheck, label: "ارجاع به اپراتور در صورت نیاز" },
];

export default function AiSalesSpotlight() {
  return (
    <section dir="rtl" className="relative overflow-hidden border-y border-marketing-border bg-[#06101d] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <span className="font-ui inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[11px] font-semibold text-emerald-300">آماده دمو</span>
          <h2 className="font-display mt-5 text-3xl font-black leading-relaxed text-marketing-text sm:text-4xl">فروش در پیام‌رسان را به یک مسیر منظم تبدیل کنید</h2>
          <p className="font-ui mt-4 max-w-[580px] text-sm leading-8 text-marketing-text-muted">فروشنده هوشمند Binix اطلاعات محصولات کسب‌وکار شما را دریافت می‌کند، به پرسش‌های مشتری پاسخ می‌دهد و او را در مسیر انتخاب و سفارش همراهی می‌کند.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/services/ai-sales-agent#demo-request" className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-gradient-to-l from-primary to-accent px-5 text-xs font-bold text-white shadow-[0_12px_32px_rgba(7,139,255,.2)]">درخواست دموی فروشنده هوشمند <ArrowLeft size={14} /></Link>
            <Link href="/services/ai-sales-agent#sales-flow" className="font-ui inline-flex h-12 items-center rounded-control border border-marketing-border px-5 text-xs font-semibold text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text">مشاهده نحوه کار</Link>
          </div>
          <p className="font-ui mt-5 text-[11px] leading-6 text-marketing-text-subtle">قواعد پاسخ‌گویی و محدوده عملکرد سرویس متناسب با اطلاعات تأییدشده کسب‌وکار تنظیم می‌شود.</p>
        </div>

        <div className="rounded-panel border border-marketing-border bg-marketing-surface/70 p-5 sm:p-7">
          <div className="font-ui mb-6 text-xs font-semibold text-marketing-text-muted">یک مسیر نمونه از پیام تا اقدام</div>
          <div className="grid gap-3 sm:grid-cols-5">
            {flow.map(({ icon: Icon, label }, index) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }} className="relative rounded-card border border-marketing-border bg-white/[0.025] p-4 text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/[0.09] text-accent"><Icon size={17} /></div>
                <div className="font-ui mt-3 text-[10.5px] leading-5 text-marketing-text-muted">{label}</div>
                {index < flow.length - 1 ? <ArrowLeft aria-hidden="true" size={13} className="absolute -left-2 top-1/2 hidden -translate-y-1/2 text-accent/50 sm:block" /> : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
