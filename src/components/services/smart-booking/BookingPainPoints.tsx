"use client";

import { motion } from "framer-motion";
import {
  CalendarX2,
  ClockAlert,
  MessageSquareMore,
  RefreshCcw,
} from "lucide-react";

const painPoints = [
  {
    icon: MessageSquareMore,
    title: "رفت‌وبرگشت در تماس و پیام",
    text: "برای پیدا کردن یک زمان خالی، چند بار با مشتری هماهنگ می‌کنید.",
    outcome: "مشتری زمان‌های قابل رزرو را خودش می‌بیند.",
  },
  {
    icon: ClockAlert,
    title: "درخواست خارج از ساعت کاری",
    text: "وقتی پاسخ‌گو نیستید، بخشی از درخواست‌های نوبت از دست می‌روند.",
    outcome: "مسیر ثبت نوبت به ساعت پاسخ‌گویی محدود نمی‌ماند.",
  },
  {
    icon: CalendarX2,
    title: "تداخل یا ثبت اشتباه",
    text: "تقویم دستی و پیام‌های پراکنده احتمال رزرو هم‌زمان را بالا می‌برند.",
    outcome: "ظرفیت و محدودیت‌های واقعی قبل از انتخاب اعمال می‌شوند.",
  },
  {
    icon: RefreshCcw,
    title: "لغو و جابه‌جایی نامنظم",
    text: "تغییر نوبت بدون فرایند مشخص، برنامه روزانه را به‌هم می‌زند.",
    outcome: "وضعیت هر نوبت و تغییرات آن قابل پیگیری می‌ماند.",
  },
];

export default function BookingPainPoints() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[#06101d] px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              مسئله‌ای که حل می‌شود
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              زمان شما نباید صرف هماهنگی تکراری نوبت شود
            </h2>
            <p className="font-ui mt-4 text-[12.5px] leading-8 text-marketing-text-muted">
              نوبت‌دهی هوشمند، کارهای تکراری قبل و بعد از رزرو را منظم می‌کند تا
              تیم شما روی ارائه خدمت تمرکز کند.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {painPoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-card border border-marketing-border bg-marketing-surface/65 p-5"
                >
                  <div className="flex size-10 items-center justify-center rounded-control border border-service-accent/15 bg-service-accent/8 text-service-accent">
                    <Icon size={17} />
                  </div>
                  <h3 className="font-display mt-4 text-base font-bold text-marketing-text">
                    {item.title}
                  </h3>
                  <p className="font-ui mt-2 text-[11px] leading-6 text-marketing-text-muted">
                    {item.text}
                  </p>
                  <p className="font-ui mt-3 border-r border-emerald-400/35 pr-3 text-[10.5px] leading-6 text-emerald-300">
                    {item.outcome}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

