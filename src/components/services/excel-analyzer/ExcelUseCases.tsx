"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeDollarSign,
  Boxes,
  Megaphone,
  ReceiptText,
} from "lucide-react";

const cases = [
  {
    icon: BadgeDollarSign,
    title: "فروش",
    description: "روند فروش، میانگین سفارش، محصولات اصلی و تغییرات دوره‌ای.",
    example: "فروش ماهانه، سفارش‌ها، مبلغ، محصول",
  },
  {
    icon: Boxes,
    title: "موجودی",
    description: "کالاهای کم‌گردش، موجودی پایین و تمرکز سرمایه در انبار.",
    example: "SKU، موجودی، گردش، تاریخ ورود",
  },
  {
    icon: ReceiptText,
    title: "مالی عملیاتی",
    description: "هزینه‌ها، دریافت‌ها و مقایسه دوره‌های مختلف.",
    example: "هزینه، درآمد، دسته‌بندی، تاریخ",
  },
  {
    icon: Megaphone,
    title: "کمپین و مشتری",
    description: "عملکرد کمپین، مشتریان بازگشتی و رفتار خرید.",
    example: "مشتری، کمپین، خرید، کانال",
  },
];

export default function ExcelUseCases() {
  const [active, setActive] = useState(0);
  const current = cases[active];
  const Icon = current.icon;

  return (
    <section dir="rtl" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto max-w-[730px] text-center">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            چه فایل‌هایی ارزش تحلیل دارند؟
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            تحلیلگر باید با مسئله شروع شود، نه با نمودار
          </h2>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[28px] border border-marketing-border bg-marketing-surface/60 lg:grid-cols-[270px_1fr]">
          <div className="border-b border-marketing-border p-3 lg:border-b-0 lg:border-l">
            <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-1.5 lg:overflow-visible">
              {cases.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActive(index)}
                    className={
                      active === index
                        ? "font-ui flex min-w-[160px] items-center gap-3 rounded-card border border-service-accent/20 bg-service-accent/8 p-3 text-right lg:w-full lg:min-w-0"
                        : "font-ui flex min-w-[160px] items-center gap-3 rounded-card border border-transparent p-3 text-right text-marketing-text-muted transition hover:bg-white/[0.025] lg:w-full lg:min-w-0"
                    }
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-control border border-service-accent/15 bg-service-accent/8 text-service-accent">
                      <ItemIcon size={16} />
                    </div>
                    <span className="text-[11px] font-semibold">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
              className="relative min-h-[320px] p-6 sm:p-8 lg:p-10"
            >
              <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-service-accent/[0.08] blur-[70px]" />
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-service-accent/20 bg-service-accent/10 text-service-accent">
                  <Icon size={24} />
                </div>
                <h3 className="font-display mt-5 text-2xl font-bold text-marketing-text">
                  {current.title}
                </h3>
                <p className="font-ui mt-3 max-w-[560px] text-[13px] leading-8 text-marketing-text-muted">
                  {current.description}
                </p>

                <div className="mt-7 rounded-card border border-marketing-border bg-white/[0.02] p-4">
                  <div className="font-ui text-[9.5px] text-marketing-text-subtle">
                    ستون‌های نمونه
                  </div>
                  <div className="font-display mt-2 text-sm font-bold text-marketing-text">
                    {current.example}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
