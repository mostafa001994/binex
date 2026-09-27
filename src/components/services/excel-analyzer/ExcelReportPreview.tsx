"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const bars = [34, 48, 42, 61, 55, 68, 64, 79, 73, 88, 82, 94];

export default function ExcelReportPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="excel-report-preview"
      dir="rtl"
      className="relative scroll-mt-24 overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,#06111F_0%,#071421_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="relative mx-auto max-w-[1180px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              خروجی مدیریتی
            </div>
            <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
              نتیجه فقط نمودار نیست
            </h2>
          </div>
          <p className="font-ui max-w-[620px] text-[12.5px] leading-7 text-marketing-text-muted">
            گزارش باید هم روند را نشان دهد، هم مشکل داده را بگوید و هم برای مدیر خلاصه‌ای قابل استفاده بسازد.
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
              <div className="font-display text-base font-bold text-marketing-text">
                گزارش تحلیل فروش
              </div>
              <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
                نمونه خروجی — اعداد نمایشی هستند
              </div>
            </div>
            <span className="font-ui rounded-full border border-service-accent/20 bg-service-accent/10 px-2.5 py-1 text-[9px] text-service-accent">
              نمونه خروجی
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.25fr_.75fr]">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-service-accent" />
                <div className="font-display text-sm font-bold text-marketing-text">روند فروش</div>
              </div>

              <div className="mt-5 flex h-56 items-end gap-2 rounded-card border border-white/[0.055] bg-white/[0.02] p-4">
                {bars.map((height, index) => (
                  <motion.div
                    key={`${height}-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: `${height}%`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.035, duration: 0.42 }}
                    className="min-w-0 flex-1 rounded-t-[5px] bg-gradient-to-t from-service-accent/55 to-service-accent-secondary"
                  />
                ))}
              </div>

              <div className="font-ui mt-3 flex items-center gap-2 text-[10px] text-emerald-300">
                <TrendingUp size={13} />
                روند نمونه، صرفاً برای نمایش تجربه گزارش است.
              </div>
            </div>

            <div className="border-t border-white/[0.07] bg-white/[0.018] p-5 lg:border-r lg:border-t-0">
              <div className="space-y-5">
                <ReportBlock icon={Sparkles} title="خلاصه مدیریتی">
                  فروش در نیمه دوم بازه رشد کرده، اما تمرکز روی چند محصول اصلی بالاست.
                </ReportBlock>

                <ReportBlock icon={AlertTriangle} title="هشدار کیفیت">
                  ۷ مورد داده ناقص یا غیرعادی قبل از تصمیم نهایی نیازمند بررسی‌اند.
                </ReportBlock>

                <ReportBlock icon={Lightbulb} title="پیشنهاد نمونه">
                  موجودی محصولات پرفروش و کیفیت ردیف‌های ناقص را در اولویت بررسی قرار دهید.
                </ReportBlock>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ReportBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-service-accent">
        <Icon size={15} />
        <div className="font-display text-sm font-bold text-marketing-text">{title}</div>
      </div>
      <p className="font-ui mt-2 text-[10.5px] leading-6 text-marketing-text-muted">
        {children}
      </p>
    </div>
  );
}
