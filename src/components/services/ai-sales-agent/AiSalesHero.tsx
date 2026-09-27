"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Check,
  CreditCard,
  MessageSquareText,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const journey = [
  { icon: Search, label: "پیدا کردن محصول" },
  { icon: PackageCheck, label: "بررسی موجودی" },
  { icon: ShoppingBag, label: "ثبت سفارش" },
  { icon: CreditCard, label: "پرداخت" },
];

export default function AiSalesHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(var(--service-accent-rgb),.11),transparent_28%),radial-gradient(circle_at_20%_78%,rgba(var(--service-accent-rgb),.055),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[.18] [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="lg:order-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-service-accent"
          >
            <Bot size={14} />
            فروشنده هوشمند در بله
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display mt-5 max-w-[720px] text-4xl font-black leading-[1.55] text-marketing-text sm:text-5xl lg:text-[56px]"
          >
            گفتگو را به
            <span className="mx-2 bg-gradient-to-l from-service-accent to-service-accent-secondary bg-clip-text text-transparent">
              مسیر خرید
            </span>
            تبدیل کنید
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="font-ui mt-5 max-w-[680px] text-[14px] leading-8 text-marketing-text-muted sm:text-[15px]"
          >
            مشتری در بله سؤال می‌پرسد؛ Binix محصول را پیدا می‌کند، موجودی را
            بررسی می‌کند، تعداد را می‌گیرد و مسیر پرداخت را برای نهایی کردن
            سفارش جلو می‌برد.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {["فقط بله در نسخه فعلی", "کنترل توسط کسب‌وکار", "قابل ارجاع به اپراتور"].map(
              (item) => (
                <span
                  key={item}
                  className="font-ui inline-flex items-center gap-1.5 rounded-full border border-marketing-border bg-white/[0.025] px-3 py-1.5 text-[10.5px] text-marketing-text-muted"
                >
                  <Check size={11} className="text-service-accent" />
                  {item}
                </span>
              ),
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#demo-request"
              className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-5 text-xs font-bold text-white shadow-[0_10px_35px_rgba(var(--service-accent-rgb),.18)] transition hover:-translate-y-0.5"
            >
              درخواست دموی فروشنده هوشمند
              <ArrowLeft size={15} />
            </a>

            <a
              href="#sales-flow"
              className="font-ui inline-flex h-12 items-center rounded-control border border-marketing-border bg-white/[0.025] px-5 text-xs font-semibold text-marketing-text transition hover:bg-white/[0.05]"
            >
              دیدن مسیر خرید
            </a>
          </motion.div>

          <div className="mt-9 grid max-w-[620px] grid-cols-2 gap-2 sm:grid-cols-4">
            {journey.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + index * 0.06 }}
                  className="relative rounded-card border border-marketing-border bg-marketing-surface/55 p-3"
                >
                  <Icon size={16} className="text-service-accent" />
                  <div className="font-ui mt-2 text-[10.5px] text-marketing-text-muted">
                    {item.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="lg:order-1">
          <SalesConversationPreview reduceMotion={Boolean(reduceMotion)} />
        </div>
      </div>
    </section>
  );
}

function SalesConversationPreview({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 26, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.1 }}
      className="relative mx-auto w-full max-w-[500px]"
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.05, 1], opacity: [0.35, 0.6, 0.35] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -inset-8 rounded-full bg-service-accent/[0.1] blur-[90px]"
      />

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-marketing-surface/95 shadow-[0_35px_100px_rgba(0,0,0,.42)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-service-accent/25 bg-service-accent/10 text-service-accent">
              <Bot size={20} />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-marketing-text">
                فروشنده هوشمند Binix
              </div>
              <div className="font-ui mt-1 flex items-center gap-1.5 text-[9.5px] text-emerald-300">
                <motion.span
                  animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="size-1.5 rounded-full bg-emerald-400"
                />
                آنلاین در بله
              </div>
            </div>
          </div>
          <MessageSquareText size={18} className="text-service-accent" />
        </div>

        <div className="min-h-[460px] space-y-3 p-4 sm:p-5">
          <ChatBubble side="customer" delay={0.35}>
            هدفون بی‌سیم دارید؟
          </ChatBubble>

          <ChatBubble delay={0.55}>
            بله 👋 چند مدل موجود داریم. این مدل برای استفاده روزانه مناسب است.
          </ChatBubble>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mr-auto w-[92%] rounded-2xl border border-service-accent/15 bg-service-accent/[0.055] p-3"
          >
            <div className="flex gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white/[0.045] text-3xl">
                🎧
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-ui text-[11.5px] font-bold text-marketing-text">
                  هدفون بی‌سیم Pro
                </div>
                <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
                  موجود • اطلاعات نمایشی
                </div>
                <div className="font-display mt-2 text-[12px] font-bold text-service-accent">
                  ۲,۴۹۰,۰۰۰ تومان
                </div>
              </div>
            </div>
          </motion.div>

          <ChatBubble side="customer" delay={0.95}>
            یکی می‌خوام.
          </ChatBubble>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.12 }}
            className="mr-auto w-[92%] rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"
          >
            <div className="font-ui text-[10.5px] leading-6 text-marketing-text-muted">
              سفارش آماده ثبت است. بعد از تأیید، لینک پرداخت برای مشتری ارسال می‌شود.
            </div>
            <div className="mt-3 flex h-10 items-center justify-center gap-2 rounded-control bg-service-accent text-[10.5px] font-bold text-white">
              <CreditCard size={14} />
              نمونه مسیر پرداخت
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="font-ui flex items-center gap-2 text-[9.5px] text-marketing-text-subtle">
            <Sparkles size={12} className="text-service-accent" />
            این گفتگو نمونه نمایشی تجربه مشتری است.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChatBubble({
  children,
  side = "assistant",
  delay,
}: {
  children: React.ReactNode;
  side?: "assistant" | "customer";
  delay: number;
}) {
  const customer = side === "customer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={
        customer
          ? "font-ui mr-auto max-w-[78%] rounded-2xl rounded-tr-md bg-service-accent px-3 py-2.5 text-[10.5px] leading-6 text-white"
          : "font-ui ml-auto max-w-[84%] rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-[10.5px] leading-6 text-marketing-text-muted"
      }
    >
      {children}
    </motion.div>
  );
}
