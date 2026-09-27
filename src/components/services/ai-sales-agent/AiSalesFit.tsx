"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageCircleMore, PackageSearch, UserRoundCheck } from "lucide-react";

const audiences = [
  {
    icon: MessageCircleMore,
    title: "فروش شما با گفتگو شروع می‌شود",
    description: "مشتری قبل از خرید درباره محصول، قیمت، موجودی یا شرایط ارسال سؤال می‌پرسد.",
  },
  {
    icon: PackageSearch,
    title: "اطلاعات محصول قابل اتصال دارید",
    description: "کاتالوگ، قیمت و موجودی شما در یک منبع مشخص نگهداری می‌شود یا امکان آماده‌سازی آن وجود دارد.",
  },
  {
    icon: UserRoundCheck,
    title: "برای موارد خاص اپراتور دارید",
    description: "می‌خواهید پاسخ‌های تکراری خودکار شوند، اما کنترل موقعیت‌های حساس همچنان دست تیم شما بماند.",
  },
];

const readiness = [
  "محصولات و اطلاعات اصلی آن‌ها مشخص است",
  "قیمت و موجودی از یک منبع قابل کنترل خوانده می‌شود",
  "قواعد فروش، ارسال و مرجوعی قابل تعریف است",
  "مسئول رسیدگی به موارد ارجاع‌شده مشخص است",
];

export default function AiSalesFit() {
  return (
    <section dir="rtl" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="pointer-events-none absolute -left-36 top-1/3 size-[420px] rounded-full bg-service-accent/[0.05] blur-[110px]" />
      <div className="relative mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">تناسب با کسب‌وکار شما</div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">فروشنده هوشمند برای هر فروشگاهی یک نسخه یکسان نیست</h2>
          <p className="font-ui mt-3 text-[12.5px] leading-7 text-marketing-text-muted">در دمو ابتدا فرایند واقعی فروش شما بررسی می‌شود تا مشخص شود این سرویس کجا می‌تواند بخشی از کار را ساده‌تر کند.</p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return <motion.article key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .06 }} className="rounded-panel border border-marketing-border bg-marketing-surface/65 p-5">
              <div className="flex size-11 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent"><Icon size={19} /></div>
              <h3 className="font-display mt-5 text-lg font-bold text-marketing-text">{item.title}</h3>
              <p className="font-ui mt-2 text-[12px] leading-7 text-marketing-text-muted">{item.description}</p>
            </motion.article>;
          })}
        </div>

        <div className="mt-5 grid gap-6 rounded-panel border border-service-accent/15 bg-service-accent/[0.035] p-5 sm:p-7 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <div className="font-ui text-[10.5px] font-semibold text-service-accent">آمادگی برای راه‌اندازی</div>
            <h3 className="font-display mt-2 text-xl font-bold leading-relaxed text-marketing-text">برای یک دموی مفید، لازم نیست همه‌چیز از قبل کامل باشد</h3>
            <p className="font-ui mt-3 text-[11.5px] leading-7 text-marketing-text-muted">این موارد در جلسه بررسی می‌شوند و اگر بخشی آماده نباشد، مسیر آماده‌سازی آن شفاف می‌شود.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {readiness.map((item) => <li key={item} className="font-ui flex items-start gap-2 rounded-card border border-white/[0.055] bg-marketing-background/35 p-3 text-[11px] leading-6 text-marketing-text-muted"><CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-400" />{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
