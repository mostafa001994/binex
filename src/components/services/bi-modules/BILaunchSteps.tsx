import { CheckCircle2, FileCheck2, Gauge, LayoutDashboard } from "lucide-react";

const steps = [
  { icon: FileCheck2, title: "بررسی فایل و سؤال مدیریتی", text: "ساختار Excel و تصمیم‌هایی که گزارش باید پشتیبانی کند مرور می‌شوند." },
  { icon: Gauge, title: "توافق روی KPIها", text: "تعریف، فرمول و سطح دسترسی هر شاخص شفاف می‌شود." },
  { icon: LayoutDashboard, title: "ساخت و بازبینی داشبورد", text: "نمای فروش داخل Binix با داده آزمایشی کنترل و تأیید می‌شود." },
  { icon: CheckCircle2, title: "راه‌اندازی و آموزش", text: "روش به‌روزرسانی داده و استفاده از داشبورد به تیم تحویل داده می‌شود." },
];

export default function BILaunchSteps() {
  return <section dir="rtl" className="border-y border-marketing-border bg-marketing-surface/25 px-4 py-24 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1120px]"><div className="text-center"><div className="font-ui text-[10.5px] font-semibold text-service-accent">مسیر راه‌اندازی</div><h2 className="font-display mt-3 text-2xl font-black text-marketing-text sm:text-3xl">داشبورد از سؤال مدیریتی شروع می‌شود، نه از نمودار</h2></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map((step, index) => { const Icon = step.icon; return <article key={step.title} className="rounded-card border border-marketing-border bg-marketing-background/60 p-5"><div className="flex items-center justify-between"><Icon size={20} className="text-service-accent" /><span className="font-display text-xs text-marketing-text-subtle">مرحله {index + 1}</span></div><h3 className="font-display mt-5 text-base font-bold text-marketing-text">{step.title}</h3><p className="font-ui mt-2 text-[11px] leading-7 text-marketing-text-muted">{step.text}</p></article>; })}</div></div></section>;
}
