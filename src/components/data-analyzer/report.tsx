"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  Download,
  Lightbulb,
  MessageSquareMore,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { AnalysisReport } from "@/types/analysis-report";

const sampleReport: AnalysisReport = {
  metrics: [
    { label: "فروش کل", value: "۱۲۸.۴ م", delta: "+۲۳.۹٪", tone: "success" },
    { label: "میانگین سفارش", value: "۳۲۷ هز.", delta: "+۱۰.۲٪", tone: "success" },
    { label: "سفارش‌ها", value: "۴۵۶", delta: "+۱۵.۷٪", tone: "success" },
    { label: "موارد نیازمند بررسی", value: "۷", delta: "هشدار", tone: "warning" },
  ],
  trend: [38, 52, 46, 63, 58, 72, 67, 81, 76, 88, 83, 96],
  executiveSummary:
    "داده‌های نمونه نشان می‌دهند عملکرد کلی رو به رشد است، اما بخشی از فروش روی تعداد محدودی محصول متمرکز شده و چند مورد کیفیت داده نیز نیازمند بررسی است.",
  qualityWarning:
    "پیش از تصمیم نهایی، ردیف‌های ناقص و داده‌های غیرعادی بررسی شوند.",
  insights: [
    "بیشترین رشد فروش در بازه پایانی ماه دیده می‌شود.",
    "سه محصول اصلی بخش بزرگی از درآمد را تشکیل می‌دهند.",
    "در چند ردیف داده، مقدارهای خالی یا غیرعادی مشاهده شده است.",
  ],
  recommendations: [
    "موجودی محصولات پرفروش را برای بازه پرتردد افزایش دهید.",
    "روی مشتریانی که بیش از یک خرید داشته‌اند کمپین بازگشت اجرا کنید.",
    "ردیف‌های دارای داده ناقص را پیش از گزارش نهایی پاک‌سازی کنید.",
  ],
};

export default function Report({
  onReset,
  data,
}: {
  onReset: () => void;
  data?: AnalysisReport;
}) {
  const report = data ?? sampleReport;
  const isSample = !data;

  function downloadReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "binix-analysis-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full space-y-4"
    >
      <section className="relative overflow-hidden rounded-panel border border-marketing-border bg-marketing-surface/90 p-5 shadow-binix-lg backdrop-blur-3xl sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgb(var(--service-accent-rgb)/.13),transparent_70%)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-control border border-success/20 bg-success/10 text-success"><CheckCircle2 size={21} /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold text-marketing-text sm:text-2xl">گزارش تحلیل آماده است</h2>
                <span className="rounded-full border border-service-accent/20 bg-service-accent/10 px-2.5 py-1 font-ui text-[10px] font-bold text-service-accent">{isSample ? "نمونه خروجی" : "گزارش واقعی"}</span>
              </div>
              <p className="mt-1.5 max-w-2xl font-ui text-xs leading-6 text-marketing-text-muted sm:text-sm">
                {isSample ? "این ساختار، شکل نهایی تجربه گزارش را نمایش می‌دهد. مقادیر نمونه هستند و در نسخه تحلیل واقعی با نتیجه همان فایل جایگزین می‌شوند." : "این گزارش از داده تحلیل‌شده فایل ساخته شده است."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={downloadReport} className="font-ui flex h-10 items-center justify-center gap-2 rounded-control bg-gradient-to-l from-service-accent to-service-accent-secondary px-4 text-xs font-semibold text-white transition hover:opacity-90"><Download size={15} />دانلود JSON</button>
            <button type="button" onClick={onReset} aria-label="تحلیل فایل جدید" className="flex size-10 shrink-0 items-center justify-center rounded-control border border-marketing-border text-marketing-text-muted transition hover:bg-white/[0.05] hover:text-marketing-text"><RotateCcw size={15} /></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {report.metrics.map((metric) => (
          <div key={metric.label} className="rounded-card border border-marketing-border bg-white/[0.025] p-4">
            <div className="font-ui text-[10px] text-marketing-text-subtle sm:text-xs">{metric.label}</div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="font-display text-lg font-bold text-marketing-text sm:text-xl">{metric.value}</div>
              {metric.delta && <div className={metric.tone === "warning" ? "font-ui text-[10px] font-semibold text-warning" : metric.tone === "success" ? "font-ui text-[10px] font-semibold text-success" : "font-ui text-[10px] font-semibold text-marketing-text-subtle"}>{metric.delta}</div>}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-panel border border-marketing-border bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-2"><BarChart3 size={18} className="text-service-accent" /><h3 className="font-display text-lg font-bold text-marketing-text">روند کلی داده</h3></div>
          <div className="mt-5 flex h-48 items-end gap-2 rounded-card border border-marketing-border bg-marketing-surface/70 p-4">
            {report.trend.map((height, index) => <motion.div key={`${height}-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: `${Math.max(4, Math.min(100, height))}%`, opacity: 1 }} transition={{ duration: 0.45, delay: index * 0.035 }} className="min-w-0 flex-1 rounded-t-[5px] bg-gradient-to-t from-service-accent/60 to-service-accent-secondary" />)}
          </div>
          <div className="mt-3 flex items-center gap-2 font-ui text-[11px] text-success"><TrendingUp size={14} />روند نمایش‌داده‌شده بر اساس سری داده گزارش است.</div>
        </div>

        <div className="rounded-panel border border-marketing-border bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-service-accent" /><h3 className="font-display text-lg font-bold text-marketing-text">خلاصه مدیریتی</h3></div>
          <p className="mt-4 font-ui text-[13px] leading-7 text-marketing-text-muted">{report.executiveSummary}</p>
          {report.qualityWarning && <div className="mt-4 rounded-control border border-warning/15 bg-warning/[0.06] p-3"><div className="flex items-start gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" /><div><div className="font-ui text-xs font-semibold text-warning">کیفیت داده</div><div className="mt-1 font-ui text-[11px] leading-5 text-marketing-text-muted">{report.qualityWarning}</div></div></div></div>}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <InsightList icon={<Lightbulb size={18} />} title="بینش‌های کلیدی" items={report.insights} />
        <div className="rounded-panel border border-service-accent/15 bg-service-accent/[0.035] p-5 sm:p-6">
          <div className="flex items-center gap-2"><Sparkles size={18} className="text-service-accent" /><h3 className="font-display text-lg font-bold text-marketing-text">پیشنهادهای عملی Binix AI</h3></div>
          <div className="mt-4 space-y-3">{report.recommendations.map((item, index) => <div key={item} className="flex items-start gap-3 rounded-control border border-marketing-border bg-white/[0.025] p-3"><span className="font-display flex size-6 shrink-0 items-center justify-center rounded-full bg-service-accent/15 text-[11px] font-bold text-service-accent">{index + 1}</span><span className="font-ui text-[12.5px] leading-6 text-marketing-text">{item}</span></div>)}</div>
          <button type="button" disabled className="font-ui mt-4 flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-control border border-service-accent/15 bg-service-accent/[0.06] text-xs font-bold text-service-accent opacity-70"><MessageSquareMore size={14} />سؤال از داده‌ها — به‌زودی</button>
        </div>
      </section>
    </motion.div>
  );
}

function InsightList({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-panel border border-marketing-border bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-service-accent">{icon}<h3 className="font-display text-lg font-bold text-marketing-text">{title}</h3></div>
      <div className="mt-4 space-y-3">{items.map((item) => <div key={item} className="flex items-start gap-2.5 font-ui text-[12.5px] leading-6 text-marketing-text-muted"><span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-service-accent/10 text-service-accent"><Check size={12} /></span><span>{item}</span></div>)}</div>
    </div>
  );
}
