"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, FlaskConical, Layers3 } from "lucide-react";

const roadmap = [
  {
    icon: CheckCircle2,
    title: "Foundation",
    status: "آماده در اکوسیستم",
    text: "ساختار سرویس‌ها، گزارش و داده‌های پایه Binix.",
    done: true,
  },
  {
    icon: FlaskConical,
    title: "BI Prototype",
    status: "در طراحی محصول",
    text: "تعریف KPI، هشدار و مدل‌های اولیه داشبورد.",
    done: false,
  },
  {
    icon: CircleDashed,
    title: "Pilot",
    status: "مرحله بعد",
    text: "آزمایش با چند سناریوی واقعی کسب‌وکار.",
    done: false,
  },
  {
    icon: Layers3,
    title: "Public Module",
    status: "بعداً",
    text: "ارائه ماژول BI به‌عنوان سرویس مستقل Binix.",
    done: false,
  },
];

export default function BIRoadmap() {
  return (
    <section
      id="bi-roadmap"
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,#06111F_0%,#071421_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1080px]">
        <div className="max-w-[680px]">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            نقشه راه
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            به‌جای وعده آماده بودن، مسیر توسعه را شفاف نشان می‌دهیم
          </h2>
        </div>

        <div className="relative mt-12">
          <div className="absolute bottom-0 right-[21px] top-0 w-px bg-gradient-to-b from-service-accent/55 via-service-accent/22 to-transparent" />

          <div className="space-y-8">
            {roadmap.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: index * 0.07 }}
                  className="relative grid gap-3 pr-14 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className={item.done ? "absolute right-0 top-0 z-10 flex size-11 items-center justify-center rounded-full border border-emerald-400/25 bg-marketing-background text-emerald-300" : "absolute right-0 top-0 z-10 flex size-11 items-center justify-center rounded-full border border-service-accent/25 bg-marketing-background text-service-accent"}>
                    <Icon size={17} />
                  </div>

                  <div>
                    <div className="font-display text-base font-bold text-marketing-text">{item.title}</div>
                    <p className="font-ui mt-1.5 text-[11.5px] leading-6 text-marketing-text-muted">{item.text}</p>
                  </div>

                  <span className={item.done ? "font-ui w-fit rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] text-emerald-300" : "font-ui w-fit rounded-full bg-service-accent/10 px-2.5 py-1 text-[9px] text-service-accent"}>
                    {item.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
