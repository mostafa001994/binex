"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock3, Copy, FileQuestion, Rows3 } from "lucide-react";

const items = [
  { icon: Rows3, title: "ردیف‌های زیاد", text: "فایل بزرگ شده و پیدا کردن الگو یا تغییر مهم دیگر با نگاه ممکن نیست." },
  { icon: Copy, title: "نسخه‌های متعدد", text: "چند کپی از فایل وجود دارد و معلوم نیست کدام نسخه مبنای گزارش است." },
  { icon: Clock3, title: "گزارش‌گیری دستی", text: "هر بار باید فیلتر، فرمول و نمودارها دوباره آماده شوند." },
  { icon: AlertTriangle, title: "خطای پنهان", text: "مقدار خالی، تکراری یا غیرعادی می‌تواند نتیجه را بی‌اعتبار کند." },
  { icon: FileQuestion, title: "داده بدون پاسخ", text: "عدد زیاد است، اما پاسخ سؤال مدیریتی هنوز روشن نیست." },
];

export default function ExcelPainPoints() {
  return <section dir="rtl" className="border-y border-marketing-border bg-marketing-surface/30 px-4 py-24 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1180px]"><div className="mx-auto max-w-3xl text-center"><div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">وقتی فایل دیگر کافی نیست</div><h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">مسئله شما کمبود داده نیست؛ رسیدن از داده به پاسخ است</h2></div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{items.map((item, index) => { const Icon=item.icon; return <motion.article key={item.title} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.06}} className="rounded-card border border-marketing-border bg-marketing-background/55 p-5"><div className="flex size-10 items-center justify-center rounded-control bg-service-accent/10 text-service-accent"><Icon size={19}/></div><h3 className="font-display mt-4 text-base font-bold text-marketing-text">{item.title}</h3><p className="font-ui mt-2 text-[11px] leading-7 text-marketing-text-muted">{item.text}</p></motion.article>;})}</div></div></section>;
}
