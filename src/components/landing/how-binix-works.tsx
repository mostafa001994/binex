"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowLeft, ChartNoAxesCombined, ClipboardCheck, PlugZap, Rocket } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { useRef } from "react";

const steps = [
  {
    number: "۰۱",
    icon: ClipboardCheck,
    title: "نیاز کسب‌وکار را بررسی می‌کنیم",
    description:
      "فرایند فعلی، چالش‌ها و نتیجه‌ای که انتظار دارید در یک مسیر روشن بررسی می‌شود.",
  },
  {
    number: "۰۲",
    icon: PlugZap,
    title: "سرویس را آماده می‌کنیم",
    description:
      "اطلاعات و اتصال‌های موردنیاز با تأیید شما مشخص و برای سناریوی واقعی آماده می‌شوند.",
  },
  {
    number: "۰۳",
    icon: Rocket,
    title: "راه‌اندازی و مدیریت می‌کنید",
    description:
      "سرویس در زیرساخت اتوماسیون اجرا می‌شود و وضعیت آن از پنل Binix قابل پیگیری است.",
  },
  {
    number: "۰۴",
    icon: ChartNoAxesCombined,
    title: "عملکرد را بهبود می‌دهیم",
    description:
      "بازخورد و وضعیت واقعی سرویس بررسی می‌شود تا تنظیمات آن متناسب با کسب‌وکار کامل‌تر شود.",
  },
];

export default function HowBinixWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const glowY = useTransform(scrollYProgress, [0, 1], [-30, 45]);

  return (
    <section
      dir="rtl"
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#050A13_0%,#07101D_52%,#040812_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />

      <motion.div
        style={reduceMotion ? undefined : { y: glowY }}
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.035] blur-[100px]"
      />

      <div className="relative mx-auto max-w-[1180px]">
        <SectionHeading
          badge="ساده از انتخاب تا نتیجه"
          title="از شناخت مسئله تا راه‌اندازی سرویس"
          description="شما مسئله و اطلاعات لازم را مشخص می‌کنید؛ Binix مسیر آماده‌سازی، اتصال و مدیریت سرویس را منظم می‌کند."
          className="mb-14 sm:mb-16"
        />

        <div className="relative hidden lg:block">
          <div className="absolute left-[8%] right-[8%] top-[49px] h-px bg-gradient-to-l from-primary/10 via-accent/70 to-primary/10" />

          {!reduceMotion && (
            <motion.div
              animate={{ left: ["92%", "8%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute top-[43px] z-20 size-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_18px_rgba(0,213,232,.7)]"
            />
          )}

          <div className="grid grid-cols-4 gap-7">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto flex size-[98px] items-center justify-center">
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
                      }
                      transition={{
                        duration: 4 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute size-[74px] rounded-full border border-accent/20 bg-marketing-background shadow-[0_0_45px_rgba(0,213,232,.08)]"
                    />
                    <div className="absolute size-[54px] rounded-full bg-accent/[0.08]" />
                    <Icon className="relative text-accent" size={22} />
                    <span className="font-display absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-marketing-text-subtle">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-display mt-5 text-lg font-bold text-marketing-text">
                    {step.title}
                  </h3>
                  <p className="font-ui mx-auto mt-3 max-w-[300px] text-[12.5px] leading-7 text-marketing-text-muted">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 flex justify-center"
          >
            <div className="font-ui inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/[0.05] px-4 py-2 text-[11px] text-accent">
              نیازسنجی
              <ArrowLeft size={13} />
              آماده‌سازی
              <ArrowLeft size={13} />
              راه‌اندازی
              <ArrowLeft size={13} />
              بهبود مستمر
            </div>
          </motion.div>
        </div>

        <div className="relative space-y-0 lg:hidden">
          <div className="absolute bottom-8 right-[22px] top-8 w-px bg-gradient-to-b from-accent/70 via-accent/25 to-transparent" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="relative flex gap-5 pb-10 last:pb-0"
              >
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          boxShadow: [
                            "0 0 0 rgba(0,213,232,0)",
                            "0 0 18px rgba(0,213,232,.18)",
                            "0 0 0 rgba(0,213,232,0)",
                          ],
                        }
                  }
                  transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.25 }}
                  className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-marketing-background text-accent"
                >
                  <Icon size={17} />
                </motion.div>

                <div className="pt-0.5">
                  <div className="font-ui text-[10px] font-semibold text-accent">
                    {step.number}
                  </div>
                  <h3 className="font-display mt-1 text-base font-bold text-marketing-text">
                    {step.title}
                  </h3>
                  <p className="font-ui mt-2 text-[12px] leading-7 text-marketing-text-muted">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
