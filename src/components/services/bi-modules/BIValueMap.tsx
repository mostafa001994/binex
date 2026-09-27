"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BellRing,
  Gauge,
  LineChart,
  Network,
} from "lucide-react";

const nodes = [
  { icon: Gauge, title: "KPI", className: "right-[4%] top-[16%]" },
  { icon: LineChart, title: "روند", className: "left-[6%] top-[17%]" },
  { icon: BarChart3, title: "گزارش", className: "right-[8%] bottom-[12%]" },
  { icon: BellRing, title: "هشدار", className: "left-[10%] bottom-[11%]" },
  { icon: Activity, title: "پایش", className: "right-[35%] top-[1%]" },
];

export default function BIValueMap() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden border-y border-marketing-border bg-[linear-gradient(180deg,#050A13_0%,#07101D_50%,#050A13_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="font-ui inline-flex rounded-full border border-service-accent/20 bg-service-accent/[0.07] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
            مسئله BI چیست؟
          </div>
          <h2 className="font-display mt-4 text-2xl font-black leading-relaxed text-marketing-text sm:text-3xl">
            هدف، جمع کردن نمودارها نیست؛ ساختن یک تصویر مشترک از کسب‌وکار است
          </h2>
        </div>

        <div className="relative mt-12 hidden min-h-[520px] lg:block">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1180 520">
            {[
              "M590 260 L1030 105",
              "M590 260 L155 108",
              "M590 260 L1000 445",
              "M590 260 L190 448",
              "M590 260 L720 42",
            ].map((d, index) => (
              <motion.path
                key={d}
                d={d}
                fill="none"
                stroke="rgba(var(--service-accent-rgb),.2)"
                strokeWidth="1"
                strokeDasharray="4 8"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: index * 0.08 }}
              />
            ))}
          </svg>

          <div className="absolute left-1/2 top-1/2 z-10 flex size-[190px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-service-accent/25 bg-marketing-surface shadow-[0_0_80px_rgba(var(--service-accent-rgb),.12)]">
            <Network size={24} className="text-service-accent" />
            <div className="font-display mt-3 text-2xl font-black text-marketing-text">
              دید مدیریتی
            </div>
            <div className="font-ui mt-2 text-[9.5px] text-marketing-text-subtle">
              یک منبع مشترک برای تصمیم
            </div>
          </div>

          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -4 }}
                className={`absolute z-10 w-[190px] rounded-card border border-marketing-border bg-marketing-surface/85 p-4 ${node.className}`}
              >
                <Icon size={18} className="text-service-accent" />
                <div className="font-display mt-3 text-sm font-bold text-marketing-text">{node.title}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:hidden">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-card border border-marketing-border bg-marketing-surface/70 p-4"
              >
                <Icon size={17} className="text-service-accent" />
                <div className="font-display mt-3 text-sm font-bold text-marketing-text">{node.title}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
