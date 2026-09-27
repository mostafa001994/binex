"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Box,
  MessageSquareText,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

const sampleStats = [
  { icon: MessageSquareText, label: "گفتگوهای امروز", value: "۳۸" },
  { icon: ShoppingBag, label: "سفارش‌های ساخته‌شده", value: "۱۲" },
  { icon: PackageCheck, label: "محصولات قابل فروش", value: "۳۲۸" },
  { icon: Box, label: "نیازمند بررسی موجودی", value: "۴" },
];

export default function MerchantDashboard() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,#06111F_0%,#071421_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="pointer-events-none absolute left-0 top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-service-accent/[0.045] blur-[110px]" />

      <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1fr_.8fr]">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="relative"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-[26px] border border-white/[0.09] bg-marketing-surface/90 p-4 shadow-[0_30px_90px_rgba(0,0,0,.32)] sm:p-5"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div>
                <div className="font-display text-base font-bold text-marketing-text">
                  نمای مدیر فروش
                </div>
                <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
                  نمونه داشبورد — داده‌ها نمایشی هستند
                </div>
              </div>
              <span className="font-ui rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[9.5px] text-emerald-300">
                نمونه نمایشی
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {sampleStats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="rounded-card border border-white/[0.065] bg-white/[0.025] p-3.5"
                  >
                    <Icon size={16} className="text-service-accent" />
                    <div className="font-display mt-3 text-xl font-bold text-marketing-text">
                      {item.value}
                    </div>
                    <div className="font-ui mt-1 text-[9.5px] text-marketing-text-muted">
                      {item.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 rounded-card border border-service-accent/12 bg-service-accent/[0.035] p-4">
              <div className="font-ui flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold text-marketing-text">
                    آخرین سفارش نمایشی
                  </div>
                  <div className="mt-1 text-[9.5px] text-marketing-text-subtle">
                    هدفون بی‌سیم Pro • تعداد ۱
                  </div>
                </div>
                <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[9px] text-amber-300">
                  در انتظار پرداخت
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div>
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            سمت کسب‌وکار
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            فقط مشتری نباید تجربه بهتر بگیرد؛ مدیر هم باید بداند چه خبر است
          </h2>
          <p className="font-ui mt-4 text-[12.5px] leading-7 text-marketing-text-muted">
            مکالمه، سفارش، موجودی و موارد نیازمند توجه باید در یک نمای مدیریتی قابل پیگیری باشند؛ نه اینکه همه‌چیز داخل چت گم شود.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "مشاهده گفتگوهای نیازمند اپراتور",
              "پیگیری سفارش‌های ساخته‌شده",
              "تشخیص کالاهای ناموجود یا نیازمند بررسی",
              "مرور وضعیت فروش بدون ورود به پیام‌های پراکنده",
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="font-ui flex items-center gap-2 text-[11.5px] text-marketing-text-muted"
              >
                <span className="size-1.5 rounded-full bg-service-accent" />
                {item}
              </motion.div>
            ))}
          </div>

          <a
            href="#demo-request"
            className="font-ui mt-7 inline-flex items-center gap-2 text-[12px] font-bold text-service-accent transition hover:-translate-x-1"
          >
            درخواست دمو برای کسب‌وکار من
            <ArrowLeft size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
