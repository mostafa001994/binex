"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Database,
} from "lucide-react";

const checks = [
  { icon: CheckCircle2, label: "ساختار جدول", value: "مناسب", tone: "success" },
  { icon: AlertTriangle, label: "مقادیر خالی", value: "۵ ردیف", tone: "warning" },
  { icon: CircleHelp, label: "ستون مبهم", value: "۲ ستون", tone: "warning" },
  { icon: Database, label: "تکرار داده", value: "بدون هشدار", tone: "success" },
];

export default function ExcelDataQuality() {
  return (
    <section dir="rtl" className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="relative mx-auto grid max-w-[1140px] gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            کیفیت داده
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            قبل از نتیجه، باید بدانیم داده چقدر قابل اعتماد است
          </h2>
          <p className="font-ui mt-4 max-w-[470px] text-[12.5px] leading-7 text-marketing-text-muted">
            این بخش عمداً شبیه کارت قابلیت طراحی نشده؛ چون نقش آن «کنترل کیفیت» است، نه معرفی ویژگی.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="overflow-hidden rounded-[28px] border border-marketing-border bg-marketing-surface/75"
        >
          <div className="flex items-center justify-between border-b border-marketing-border px-5 py-4">
            <div>
              <div className="font-display text-sm font-bold text-marketing-text">
                گزارش اولیه کیفیت فایل
              </div>
              <div className="font-ui mt-1 text-[9.5px] text-marketing-text-subtle">
                داده‌های نمونه
              </div>
            </div>
            <span className="font-ui rounded-full bg-amber-400/10 px-2.5 py-1 text-[9px] text-amber-300">
              نیازمند بررسی
            </span>
          </div>

          <div className="divide-y divide-marketing-border">
            {checks.map((item, index) => {
              const Icon = item.icon;
              const success = item.tone === "success";
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-[42px_1fr_auto] items-center gap-3 px-5 py-4"
                >
                  <div className={success ? "flex size-9 items-center justify-center rounded-control bg-emerald-400/10 text-emerald-300" : "flex size-9 items-center justify-center rounded-control bg-amber-400/10 text-amber-300"}>
                    <Icon size={16} />
                  </div>
                  <div className="font-ui text-[11px] text-marketing-text-muted">{item.label}</div>
                  <div className={success ? "font-display text-sm font-bold text-emerald-300" : "font-display text-sm font-bold text-amber-300"}>
                    {item.value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
