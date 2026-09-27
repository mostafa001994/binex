"use client";

import { motion } from "framer-motion";
import { DatabaseZap, Eye, ShieldCheck, Target } from "lucide-react";

const principles = [
  {
    icon: Target,
    title: "KPI باید تعریف روشن داشته باشد",
    text: "اگر معنی شاخص مشخص نباشد، داشبورد فقط ظاهر حرفه‌ای پیدا می‌کند.",
  },
  {
    icon: DatabaseZap,
    title: "منبع داده باید مشخص باشد",
    text: "هر عدد باید قابل ردیابی به داده و سیستم منبع باشد.",
  },
  {
    icon: Eye,
    title: "هشدار باید قابل توضیح باشد",
    text: "مدیر باید بداند چرا یک تغییر مهم تشخیص داده شده است.",
  },
  {
    icon: ShieldCheck,
    title: "BI نباید واقعیت را حدس بزند",
    text: "خروجی مدیریتی باید بر داده واقعی تکیه کند، نه عدد یا ادعای ساختگی.",
  },
];

export default function BITrust() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-t border-marketing-border bg-[linear-gradient(180deg,#050A13,#07101D)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              اصول طراحی BI
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              قبل از هوشمندی، باید روی معنی داده توافق کنیم
            </h2>
            <p className="font-ui mt-4 max-w-[470px] text-[12.5px] leading-7 text-marketing-text-muted">
              BI زمانی ارزش دارد که مدیر به عدد اعتماد کند و بداند هر شاخص دقیقاً از کجا آمده است.
            </p>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 right-[19px] top-0 w-px bg-gradient-to-b from-service-accent/45 via-service-accent/20 to-transparent" />
            <div className="space-y-7">
              {principles.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.06 }}
                    className="relative flex gap-4"
                  >
                    <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-service-accent/25 bg-marketing-background text-service-accent">
                      <Icon size={17} />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-display text-base font-bold text-marketing-text">{item.title}</h3>
                      <p className="font-ui mt-1.5 text-[11.5px] leading-6 text-marketing-text-muted">{item.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
