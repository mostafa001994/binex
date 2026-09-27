"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarClock, FileSpreadsheet, MessageCircleMore, ShoppingBag } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const problems = [
  { icon: MessageCircleMore, title: "پاسخ‌گویی تکراری", text: "پرسش‌های مشابه مشتریان، زمان تیم را مصرف می‌کند." },
  { icon: ShoppingBag, title: "فروش در پیام‌رسان", text: "مشتری میان سؤال، انتخاب محصول و سفارش از مسیر خارج می‌شود." },
  { icon: CalendarClock, title: "مدیریت دستی نوبت", text: "هماهنگی ظرفیت و زمان‌های خالی با تماس و پیام انجام می‌شود." },
  { icon: BarChart3, title: "گزارش‌های مدیریتی", text: "آماده‌سازی گزارش منظم، به چند نفر و چند منبع وابسته است." },
  { icon: FileSpreadsheet, title: "فایل‌های پراکنده اکسل", text: "کیفیت داده و تهیه خروجی قابل تصمیم‌گیری زمان‌بر است." },
];

export default function BusinessProblems() {
  return (
    <section dir="rtl" className="relative bg-marketing-background px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <SectionHeading
          badge="از مسئله شروع می‌کنیم"
          title="کدام بخش کسب‌وکارتان هنوز زمان زیادی می‌گیرد؟"
          description="Binix قرار نیست همه‌چیز را یک‌باره تغییر دهد؛ ابتدا همان فرایندی را پیدا می‌کنیم که بیشترین اثر را دارد."
          className="mb-10"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {problems.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-card border border-marketing-border bg-marketing-surface/70 p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-control border border-accent/15 bg-accent/[0.06] text-accent"><Icon size={18} /></div>
              <h3 className="font-display mt-4 text-base font-bold text-marketing-text">{title}</h3>
              <p className="font-ui mt-2 text-[11.5px] leading-6 text-marketing-text-muted">{text}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="#consultation" className="font-ui inline-flex h-11 items-center rounded-control border border-accent/25 bg-accent/[0.07] px-5 text-xs font-bold text-accent transition hover:bg-accent/[0.12]">
            مسئله کسب‌وکارم را بررسی کنید
          </a>
        </div>
      </div>
    </section>
  );
}
