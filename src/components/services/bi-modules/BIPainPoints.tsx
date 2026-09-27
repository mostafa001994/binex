"use client";

import { motion } from "framer-motion";
import { Clock3, Files, HelpCircle, KeyRound, RefreshCw } from "lucide-react";

const items = [
  { icon: Files, title: "فایل‌های پراکنده", text: "گزارش فروش بین چند Excel و نسخه‌های مختلف پخش شده است." },
  { icon: Clock3, title: "گزارش دیرهنگام", text: "وقتی گزارش آماده می‌شود، فرصت واکنش به تغییرات از دست رفته است." },
  { icon: RefreshCw, title: "کار تکراری", text: "هر هفته یا ماه همان جمع‌زدن، فیلتر کردن و ساخت نمودار تکرار می‌شود." },
  { icon: HelpCircle, title: "KPI نامشخص", text: "افراد مختلف از فروش، رشد و عملکرد تعریف یکسانی ندارند." },
  { icon: KeyRound, title: "وابستگی به یک نفر", text: "دانش ساخت گزارش فقط نزد یک همکار است و تصمیم‌گیری متوقف می‌ماند." },
];

export default function BIPainPoints() {
  return (
    <section dir="rtl" className="border-y border-marketing-border bg-marketing-surface/30 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-3xl text-center"><div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">نشانه‌های نیاز به BI فروش</div><h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">اگر گزارش‌گیری انرژی بیشتری از تصمیم‌گیری می‌گیرد، مسئله فقط Excel نیست</h2></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{items.map((item, index) => { const Icon = item.icon; return <motion.article key={item.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-card border border-marketing-border bg-marketing-background/55 p-5"><div className="flex size-10 items-center justify-center rounded-control bg-service-accent/10 text-service-accent"><Icon size={19} /></div><h3 className="font-display mt-4 text-base font-bold text-marketing-text">{item.title}</h3><p className="font-ui mt-2 text-[11px] leading-7 text-marketing-text-muted">{item.text}</p></motion.article>; })}</div>
      </div>
    </section>
  );
}
