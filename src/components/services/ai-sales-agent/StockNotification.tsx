"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BellRing, CheckCircle2, PackageX } from "lucide-react";

export default function StockNotification() {
  const reduceMotion = useReducedMotion();

  return (
    <section dir="rtl" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[28px] border border-service-accent/18 bg-gradient-to-l from-marketing-surface-raised to-marketing-surface p-6 sm:p-9 lg:p-12">
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.25, 0.5, 0.25], scale: [1, 1.07, 1] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 -top-24 size-[320px] rounded-full bg-service-accent/[0.09] blur-[85px]"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div className="lg:order-2">
            <div className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              <BellRing size={13} />
              پیگیری مشتری
            </div>

            <h2 className="font-display mt-5 text-2xl font-black leading-[1.65] text-marketing-text sm:text-3xl">
              ناموجود بودن نباید پایان گفتگو باشد
            </h2>

            <p className="font-ui mt-4 max-w-[520px] text-[12.5px] leading-7 text-marketing-text-muted">
              اگر محصول در دسترس نباشد، مشتری می‌تواند درخواست پیگیری ثبت کند تا بعداً بتوانید دوباره به همان تقاضا برگردید.
            </p>

            <div className="font-ui mt-5 rounded-card border border-marketing-border bg-white/[0.02] p-4 text-[10.5px] leading-6 text-marketing-text-subtle">
              نحوه و کانال اطلاع‌رسانی نهایی باید بر اساس اتصال واقعی سرویس شما تنظیم شود. این بخش نمونه تجربه موردنظر است.
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            className="lg:order-1"
          >
            <div className="rounded-[22px] border border-white/[0.08] bg-marketing-background/65 p-4 sm:p-5">
              <div className="font-ui mb-3 text-[9.5px] text-marketing-text-subtle">
                نمونه تجربه مشتری
              </div>

              <div className="flex gap-3 rounded-card border border-white/[0.05] bg-white/[0.03] p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
                  <PackageX size={18} />
                </div>
                <div>
                  <div className="font-ui text-[11.5px] font-semibold text-marketing-text">
                    این محصول فعلاً موجود نیست
                  </div>
                  <div className="font-ui mt-1 text-[9.5px] leading-5 text-marketing-text-subtle">
                    دوست دارید بعد از موجود شدن دوباره پیگیری شود؟
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="font-ui mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-service-accent/20 bg-service-accent/10 text-[10.5px] font-semibold text-service-accent"
              >
                <BellRing size={14} />
                وقتی موجود شد خبرم کن
              </div>

              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.55, 1, 0.55] }
                }
                transition={{ duration: 2.4, repeat: Infinity }}
                className="font-ui mt-3 flex items-center justify-center gap-2 text-[9.5px] text-emerald-300"
              >
                <CheckCircle2 size={13} />
                نمونه وضعیت ثبت درخواست
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
