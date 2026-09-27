"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, Gauge, LineChart, TrendingUp } from "lucide-react";

export default function BIPreview() {
  return (
    <section id="bi-preview" dir="rtl" className="relative scroll-mt-24 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              نمونه داشبورد فروش
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              وضعیت، روند و نقطه نیازمند توجه در یک نمای مدیریتی
            </h2>
          </div>
          <p className="font-ui max-w-[620px] text-[12.5px] leading-7 text-marketing-text-muted">
            این نمونه با داده نمایشی ساخته شده تا ساختار خروجی را نشان دهد؛ شاخص‌های نهایی براساس فایل و مدل فروش شما تعریف می‌شوند.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-marketing-surface/90 shadow-[0_35px_100px_rgba(0,0,0,.35)]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <div className="font-display text-base font-bold text-marketing-text">داشبورد مدیریت فروش</div>
              <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">نمونه داده نمایشی — داخل پنل Binix</div>
            </div>
            <span className="font-ui rounded-full bg-service-accent/10 px-2.5 py-1 text-[9px] text-service-accent">به‌روزرسانی دوره‌ای</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric icon={Gauge} label="فروش خالص" value="۲۴۰ م.ت" />
                <Metric icon={TrendingUp} label="رشد نسبت به دوره قبل" value="۱۸٪" />
                <Metric icon={AlertTriangle} label="موارد نیازمند توجه" value="۳" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_.6fr]">
                <div className="rounded-card border border-white/[0.055] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <LineChart size={16} className="text-service-accent" />
                    <div className="font-display text-sm font-bold text-marketing-text">روند دوره‌ای</div>
                  </div>
                  <div className="mt-4 h-44 rounded-xl bg-[linear-gradient(180deg,rgba(var(--service-accent-rgb),.08),transparent)]">
                    <svg className="h-full w-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                      <motion.path
                        d="M0 145 C80 120,110 135,170 100 S280 88,330 105 S430 62,500 78 S560 46,600 52"
                        fill="none"
                        stroke="rgba(var(--service-accent-rgb),.8)"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1 }}
                      />
                    </svg>
                  </div>
                </div>

                <div className="rounded-card border border-white/[0.055] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-service-accent" />
                    <div className="font-display text-sm font-bold text-marketing-text">سهم بخش‌ها</div>
                  </div>
                  <div className="mt-5 space-y-4">
                    {[72, 48, 31].map((width, index) => (
                      <div key={width}>
                        <div className="mb-2 h-2 rounded-full bg-white/[0.04]">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${width}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 + index * 0.1 }}
                            className="h-full rounded-full bg-service-accent/70"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.07] bg-white/[0.018] p-5 lg:border-r lg:border-t-0">
              <div className="font-ui text-[9.5px] text-marketing-text-subtle">تمرکز مدیر</div>

              <div className="mt-5 space-y-5">
                {[
                  ["۱", "چه چیزی تغییر کرده؟"],
                  ["۲", "چرا مهم است؟"],
                  ["۳", "کجا نیاز به اقدام داریم؟"],
                ].map(([number, text]) => (
                  <div key={number} className="flex gap-3">
                    <div className="font-display flex size-8 shrink-0 items-center justify-center rounded-full border border-service-accent/20 bg-service-accent/8 text-xs font-bold text-service-accent">
                      {number}
                    </div>
                    <div className="font-ui pt-1 text-[10.5px] leading-6 text-marketing-text-muted">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card border border-white/[0.055] bg-white/[0.025] p-4">
      <Icon size={16} className="text-service-accent" />
      <div className="font-display mt-3 text-xl font-bold text-marketing-text">{value}</div>
      <div className="font-ui mt-1 text-[9px] text-marketing-text-subtle">{label}</div>
    </div>
  );
}
