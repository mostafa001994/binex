"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock3, Coins, Users } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const WORK_DAYS = 22;
const toFa = (value: number) => value.toLocaleString("fa-IR");

export default function RoiCalculator() {
  const [staff, setStaff] = useState(3);
  const [hours, setHours] = useState(4);
  const [salary, setSalary] = useState(20);

  const result = useMemo(() => {
    const monthlyHours = staff * hours * WORK_DAYS;
    const hourlyCost = (salary * 1_000_000) / (WORK_DAYS * 8);
    const monthlyManualCost = Math.round(monthlyHours * hourlyCost);
    const visualPercent = Math.min(92, Math.max(18, Math.round((monthlyHours / (30 * 8 * WORK_DAYS)) * 100)));
    return { monthlyHours, monthlyManualCost, visualPercent };
  }, [staff, hours, salary]);

  return (
    <section
      id="roi"
      dir="rtl"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#07101D_0%,#06111F_100%)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <motion.div
        animate={{ opacity: [0.25, 0.45, 0.25], x: [0, 18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-accent/[0.05] blur-[110px]"
      />

      <div className="relative mx-auto max-w-[1120px]">
        <SectionHeading
          badge="برآورد اولیه"
          title="کارهای تکراری ماهانه چقدر از زمان تیم شما را می‌گیرند؟"
          description="این ابزار فقط زمان و هزینه نیروی انسانی را تقریبی محاسبه می‌کند و ادعایی درباره افزایش قطعی درآمد ندارد."
          className="mb-10"
        />

        <div className="overflow-hidden rounded-panel border border-marketing-border bg-marketing-background/55 shadow-binix-lg">
          <div className="grid lg:grid-cols-[.92fr_1.08fr]">
            <div className="relative flex min-h-[430px] flex-col items-center justify-center border-b border-marketing-border p-6 text-center sm:p-8 lg:border-b-0 lg:border-l">
              <motion.div
                animate={{ boxShadow: ["0 0 0 rgba(0,213,232,0)", "0 0 45px rgba(0,213,232,.08)", "0 0 0 rgba(0,213,232,0)"] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative flex size-[220px] items-center justify-center rounded-full sm:size-[250px]"
                style={{
                  background: `conic-gradient(var(--accent) 0 ${result.visualPercent}%, rgba(255,255,255,.055) ${result.visualPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-[11px] rounded-full bg-marketing-background" />
                <div className="relative">
                  <Clock3 className="mx-auto text-accent" size={23} />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={result.monthlyHours}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.22 }}
                      className="font-display mt-3 text-4xl font-black text-marketing-text sm:text-5xl"
                    >
                      {toFa(result.monthlyHours)}
                    </motion.div>
                  </AnimatePresence>
                  <div className="font-ui mt-1 text-[12px] text-marketing-text-muted">
                    ساعت در ماه
                  </div>
                </div>
              </motion.div>

              <div className="mt-8 grid w-full max-w-[360px] grid-cols-2 gap-3">
                <motion.div whileHover={{ y: -3 }} className="rounded-card border border-accent/15 bg-accent/[0.045] p-4 text-right">
                  <Coins size={17} className="text-accent" />
                  <div className="font-ui mt-3 text-[10px] text-marketing-text-subtle">هزینه تقریبی این زمان</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={result.monthlyManualCost}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="font-display mt-1 text-base font-bold text-marketing-text"
                    >
                      {toFa(Math.round(result.monthlyManualCost / 1_000_000))} میلیون تومان
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="rounded-card border border-marketing-border bg-white/[0.02] p-4 text-right">
                  <Users size={17} className="text-marketing-text-muted" />
                  <div className="font-ui mt-3 text-[10px] text-marketing-text-subtle">تیم درگیر</div>
                  <div className="font-display mt-1 text-base font-bold text-marketing-text">
                    {toFa(staff)} نفر
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="font-display text-lg font-bold text-marketing-text">
                شرایط فعلی تیم را تنظیم کنید
              </div>
              <p className="font-ui mt-2 text-[12px] leading-7 text-marketing-text-muted">
                با تغییر اعداد، برآورد سمت مقابل همان لحظه به‌روز می‌شود.
              </p>

              <div className="mt-8 space-y-8">
                <Slider label="تعداد نیروهای درگیر پاسخ‌گویی" value={staff} min={1} max={30} onChange={setStaff} suffix="نفر" />
                <Slider label="ساعت پاسخ‌گویی روزانه هر نفر" value={hours} min={1} max={8} onChange={setHours} suffix="ساعت" />
                <Slider label="حقوق ماهانه هر نفر" value={salary} min={8} max={100} step={2} onChange={setSalary} suffix="میلیون" />
              </div>

              <motion.div
                animate={{ borderColor: ["rgba(255,255,255,.08)", "rgba(0,213,232,.18)", "rgba(255,255,255,.08)"] }}
                transition={{ duration: 4.5, repeat: Infinity }}
                className="font-ui mt-9 rounded-card border bg-white/[0.02] p-4 text-[11px] leading-6 text-marketing-text-subtle"
              >
                ظرفیت واقعی اتوماسیون به نوع کسب‌وکار، تعداد مکالمات و پیچیدگی پاسخ‌ها بستگی دارد. این محاسبه فقط برای برآورد اولیه است.
              </motion.div>

              <a href="#consultation" className="font-ui mt-4 flex h-11 items-center justify-center rounded-control border border-accent/25 bg-accent/[0.07] px-5 text-xs font-bold text-accent transition hover:bg-accent/[0.12]">
                بررسی این نتیجه با مشاور Binix
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <label className="font-ui text-[12px] text-marketing-text-muted">{label}</label>
        <span className="font-display text-sm font-bold text-accent">
          {toFa(value)} <span className="font-ui text-[10px] font-normal">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary/15 accent-[var(--accent)]"
      />
    </div>
  );
}
