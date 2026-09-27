"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck2,
  ChevronLeft,
  Clock3,
  UserCheck,
} from "lucide-react";

const slots = [
  ["۱۰:۰۰", "مشاوره", "تأیید شده"],
  ["۱۱:۳۰", "خدمات ویژه", "در انتظار"],
  ["۱۳:۰۰", "مشاوره", "تأیید شده"],
  ["۱۵:۳۰", "خدمات ویژه", "لغو شده"],
];

export default function BookingManagerPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,#06111F_0%,#071421_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-[1180px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              سمت مدیر
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              برنامه امروز، ظرفیت خالی و نوبت‌های نیازمند پیگیری در یک نگاه
            </h2>
          </div>
          <p className="font-ui max-w-[620px] text-[12.5px] leading-7 text-marketing-text-muted">
            مدیر باید در یک نگاه بداند امروز چه زمانی پر شده، کجا ظرفیت دارد و کدام رزرو نیازمند پیگیری است.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-marketing-surface/90 shadow-[0_35px_100px_rgba(0,0,0,.35)]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <div className="font-display text-base font-bold text-marketing-text">تقویم امروز</div>
              <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">نمونه نمایشی</div>
            </div>
            <div className="flex gap-2">
              <span className="font-ui rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] text-emerald-300">۶ تأیید شده</span>
              <span className="font-ui rounded-full bg-service-accent/10 px-2.5 py-1 text-[9px] text-service-accent">۳ ظرفیت خالی</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_260px]">
            <div className="p-4 sm:p-5">
              <div className="mb-3 grid grid-cols-[64px_1fr_100px] gap-3 px-3">
                <div />
                <div className="font-ui text-[9px] text-marketing-text-subtle">خدمت</div>
                <div className="font-ui text-[9px] text-marketing-text-subtle">وضعیت</div>
              </div>

              <div className="space-y-2">
                {slots.map(([time, service, status], index) => (
                  <motion.div
                    key={`${time}-${service}`}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[64px_1fr_100px] items-center gap-3 rounded-card border border-white/[0.055] bg-white/[0.025] px-3 py-3"
                  >
                    <div className="font-display text-sm font-bold text-marketing-text">{time}</div>
                    <div className="font-ui text-[10px] text-marketing-text-muted">{service}</div>
                    <span
                      className={
                        status === "لغو شده"
                          ? "font-ui rounded-full bg-red-400/10 px-2 py-1 text-center text-[8.5px] text-red-300"
                          : status === "در انتظار"
                            ? "font-ui rounded-full bg-amber-400/10 px-2 py-1 text-center text-[8.5px] text-amber-300"
                            : "font-ui rounded-full bg-emerald-400/10 px-2 py-1 text-center text-[8.5px] text-emerald-300"
                      }
                    >
                      {status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.07] bg-white/[0.018] p-4 lg:border-r lg:border-t-0">
              <div className="font-ui text-[9.5px] text-marketing-text-subtle">خلاصه امروز</div>

              <div className="mt-4 space-y-4">
                <Summary icon={CalendarCheck2} label="رزروها" value="۸" />
                <Summary icon={Clock3} label="زمان آزاد" value="۳ بازه" />
                <Summary icon={UserCheck} label="تأیید شده" value="۶" />
              </div>

              <div className="font-ui mt-6 flex items-center justify-between rounded-card border border-service-accent/15 bg-service-accent/[0.04] p-3 text-[9.5px] text-service-accent">
                مشاهده برنامه کامل
                <ChevronLeft size={13} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-control bg-service-accent/8 text-service-accent">
        <Icon size={15} />
      </div>
      <div>
        <div className="font-ui text-[9px] text-marketing-text-subtle">{label}</div>
        <div className="font-display mt-0.5 text-sm font-bold text-marketing-text">{value}</div>
      </div>
    </div>
  );
}
