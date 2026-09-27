"use client";

import { motion } from "framer-motion";
import {
  BellRing,
  CalendarClock,
  CalendarOff,
  Clock3,
  Link2,
  UsersRound,
} from "lucide-react";

const rules = [
  { icon: CalendarClock, label: "مدت خدمت", value: "۴۵ دقیقه" },
  { icon: Clock3, label: "ساعات کاری", value: "۹ تا ۱۸" },
  { icon: UsersRound, label: "ظرفیت هم‌زمان", value: "۲ نفر" },
  { icon: CalendarOff, label: "تعطیلی", value: "قابل تعریف" },
  { icon: BellRing, label: "یادآوری", value: "فعال" },
  { icon: Link2, label: "لینک رزرو", value: "اختصاصی" },
];

export default function BookingCapabilities() {
  return (
    <section dir="rtl" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="pointer-events-none absolute -right-20 top-20 size-[380px] rounded-full bg-service-accent/[0.045] blur-[105px]" />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="grid items-start gap-12 lg:grid-cols-[.78fr_1.22fr]">
          <div className="lg:sticky lg:top-28">
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              منطق رزرو
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              تقویم فقط ظاهر کار است؛ اصل ماجرا قوانین پشت آن است
            </h2>
            <p className="font-ui mt-4 max-w-[460px] text-[12.5px] leading-7 text-marketing-text-muted">
              هر خدمت می‌تواند زمان، ظرفیت، ساعات مجاز و استثناهای خودش را داشته باشد.
            </p>

            <div className="font-ui mt-6 border-r border-service-accent/30 pr-4 text-[11px] leading-7 text-marketing-text-subtle">
              نتیجه این تنظیمات، زمان‌های قابل اعتماد برای مشتری و برنامه‌ای
              قابل کنترل برای مدیر است؛ نه یک تقویم جدا از واقعیت کسب‌وکار.
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative overflow-hidden rounded-[30px] border border-marketing-border bg-marketing-surface/75"
          >
            <div className="border-b border-marketing-border px-5 py-4">
              <div className="font-display text-sm font-bold text-marketing-text">
                تنظیمات نمونه یک خدمت
              </div>
              <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
                مشاوره تخصصی
              </div>
            </div>

            <div className="divide-y divide-marketing-border">
              {rules.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[42px_1fr_auto] items-center gap-3 px-5 py-4"
                  >
                    <div className="flex size-9 items-center justify-center rounded-control border border-service-accent/15 bg-service-accent/8 text-service-accent">
                      <Icon size={16} />
                    </div>
                    <div className="font-ui text-[11px] text-marketing-text-muted">
                      {item.label}
                    </div>
                    <div className="font-display text-sm font-bold text-marketing-text">
                      {item.value}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
