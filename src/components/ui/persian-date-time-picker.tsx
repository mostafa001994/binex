"use client";

import { useMemo } from "react";

type PersianParts = { year: number; month: number; day: number };

const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function persianParts(date: Date): PersianParts {
  const values = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
  );
  return { year: values.year, month: values.month, day: values.day };
}

function daysInPersianMonth(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  for (let day = 30; day >= 29; day -= 1) {
    if (persianToGregorian(year, month, day)) return day;
  }
  return 29;
}

function persianToGregorian(year: number, month: number, day: number) {
  const start = new Date(Date.UTC(year + 620, 11, 1));
  for (let offset = 0; offset < 500; offset += 1) {
    const candidate = new Date(start.getTime() + offset * 86400000);
    const parts = persianParts(candidate);
    if (parts.year === year && parts.month === month && parts.day === day) return candidate;
  }
  return null;
}

const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const selectClass = "font-ui h-10 rounded-control border border-border bg-background px-2 text-xs outline-none focus:border-primary/50";

export function PersianDateTimePicker({ value, onChange, min }: { value: string; onChange: (value: string) => void; min?: Date }) {
  const selected = useMemo(() => {
    const date = value ? new Date(value) : new Date();
    const safe = Number.isFinite(date.getTime()) ? date : new Date();
    return { ...persianParts(safe), hour: safe.getHours(), minute: safe.getMinutes() };
  }, [value]);
  const currentYear = persianParts(new Date()).year;
  const years = Array.from({ length: 8 }, (_, index) => currentYear + index);
  const days = Array.from({ length: daysInPersianMonth(selected.year, selected.month) }, (_, index) => index + 1);

  function update(next: Partial<typeof selected>) {
    const parts = { ...selected, ...next };
    const maxDay = daysInPersianMonth(parts.year, parts.month);
    const gregorian = persianToGregorian(parts.year, parts.month, Math.min(parts.day, maxDay));
    if (!gregorian) return;
    const local = new Date(gregorian.getUTCFullYear(), gregorian.getUTCMonth(), gregorian.getUTCDate(), parts.hour, parts.minute, 0, 0);
    if (min && local < min) return;
    onChange(local.toISOString());
  }

  return <div className="grid grid-cols-5 gap-2" dir="rtl">
    <select aria-label="سال شمسی" className={selectClass} value={selected.year} onChange={(event) => update({ year: Number(event.target.value) })}>{years.map((year) => <option key={year} value={year}>{year.toLocaleString("fa-IR", { useGrouping: false })}</option>)}</select>
    <select aria-label="ماه شمسی" className={selectClass} value={selected.month} onChange={(event) => update({ month: Number(event.target.value) })}>{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
    <select aria-label="روز شمسی" className={selectClass} value={Math.min(selected.day, days.length)} onChange={(event) => update({ day: Number(event.target.value) })}>{days.map((day) => <option key={day} value={day}>{day.toLocaleString("fa-IR")}</option>)}</select>
    <select aria-label="ساعت" className={selectClass} value={selected.hour} onChange={(event) => update({ hour: Number(event.target.value) })}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{hour.toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false })}</option>)}</select>
    <select aria-label="دقیقه" className={selectClass} value={selected.minute} onChange={(event) => update({ minute: Number(event.target.value) })}>{Array.from({ length: 12 }, (_, index) => index * 5).map((minute) => <option key={minute} value={minute}>{minute.toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false })}</option>)}</select>
    <p className="col-span-5 font-ui text-[11px] text-foreground-subtle">تاریخ بر اساس تقویم هجری شمسی و ساعت محلی ایران است.</p>
  </div>;
}
