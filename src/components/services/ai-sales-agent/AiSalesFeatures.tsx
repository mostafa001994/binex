"use client";

import { motion } from "framer-motion";
import {
  BellRing,
  CreditCard,
  PackageCheck,
  Search,
  ShoppingCart,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "جستجوی محصول",
    description: "مشتری با زبان ساده محصول را می‌خواهد و Binix نزدیک‌ترین نتیجه را از کاتالوگ پیدا می‌کند.",
    className: "md:col-span-2",
  },
  {
    icon: PackageCheck,
    title: "موجودی قابل اتکا",
    description: "پاسخ موجودی باید به منبع قابل کنترل کسب‌وکار متصل باشد.",
    className: "",
  },
  {
    icon: ShoppingCart,
    title: "ساخت سفارش در گفتگو",
    description: "محصول و تعداد بدون خروج از جریان مکالمه مشخص می‌شود.",
    className: "",
  },
  {
    icon: CreditCard,
    title: "مسیر پرداخت",
    description: "بعد از تأیید سفارش، مسیر پرداخت برای تکمیل خرید ارائه می‌شود.",
    className: "md:col-span-2",
  },
  {
    icon: BellRing,
    title: "پیگیری ناموجود",
    description: "مشتری می‌تواند برای موجود شدن دوباره محصول درخواست پیگیری ثبت کند.",
    className: "",
  },
  {
    icon: Zap,
    title: "کاهش رفت‌وبرگشت",
    description: "پاسخ، انتخاب و اقدام در یک مسیر کوتاه‌تر کنار هم قرار می‌گیرند.",
    className: "",
  },
];

export default function AiSalesFeatures() {
  return (
    <section dir="rtl" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="pointer-events-none absolute -right-24 top-20 size-[360px] rounded-full bg-service-accent/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              تجربه مشتری
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              هر قابلیت باید یک مانع خرید را کم کند
            </h2>
            <p className="font-ui mt-3 max-w-[460px] text-[12.5px] leading-7 text-marketing-text-muted">
              به‌جای اضافه کردن امکانات پراکنده، جریان فروش حول چند اقدام اصلی مشتری ساخته می‌شود.
            </p>
          </div>

          <div className="font-ui rounded-card border border-marketing-border bg-white/[0.02] p-4 text-[11px] leading-6 text-marketing-text-subtle">
            طراحی این سرویس باید به داده واقعی محصول، قیمت و موجودی متصل شود. Binix نباید چیزی را که در منبع کسب‌وکار وجود ندارد، قطعی نمایش دهد.
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className={`group relative min-h-[190px] overflow-hidden rounded-panel border border-marketing-border bg-marketing-surface/70 p-5 transition hover:border-service-accent/25 ${feature.className}`}
              >
                <div className="pointer-events-none absolute -left-14 -top-14 size-36 rounded-full bg-service-accent/[0.06] blur-[45px]" />
                <div className="relative flex size-11 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent">
                  <Icon size={19} />
                </div>
                <h3 className="font-display relative mt-5 text-lg font-bold text-marketing-text">
                  {feature.title}
                </h3>
                <p className="font-ui relative mt-2 max-w-[520px] text-[12px] leading-7 text-marketing-text-muted">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
