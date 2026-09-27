"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { CalendarCheck2, CheckCircle2, Send, ShieldCheck } from "lucide-react";

const inputClass =
  "font-ui h-12 w-full rounded-control border border-marketing-border bg-marketing-background/70 px-3 text-sm text-marketing-text outline-none transition placeholder:text-marketing-text-subtle focus:border-service-accent/50 focus:ring-2 focus:ring-service-accent/10";

export default function BookingConsultationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") ?? "").replace(/\s|-/g, "");

    if (!/^09\d{9}$/.test(phone)) {
      setError("لطفاً شماره موبایل معتبر وارد کنید.");
      return;
    }

    const currentMethod = String(data.get("currentMethod") ?? "");
    const bookingVolume = String(data.get("bookingVolume") ?? "");
    const userNote = String(data.get("note") ?? "").trim();
    const note = [
      currentMethod ? `روش فعلی ثبت نوبت: ${currentMethod}` : "",
      bookingVolume ? `تعداد تقریبی نوبت روزانه: ${bookingVolume}` : "",
      userNote ? `مسئله یا توضیح تکمیلی: ${userNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          phone,
          businessName: data.get("businessName"),
          businessType: data.get("businessType"),
          need: "درخواست راه‌اندازی نوبت‌دهی هوشمند",
          channel: currentMethod,
          note,
          website: data.get("website"),
          source: "smart-booking-consultation",
          consent: data.get("consent") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "ثبت درخواست انجام نشد.");
      }
      form.reset();
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت درخواست انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="booking-request"
      dir="rtl"
      className="scroll-mt-24 border-t border-marketing-border bg-[linear-gradient(180deg,#07101D,#050A13)] px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="relative mx-auto grid max-w-[1120px] overflow-hidden rounded-[30px] border border-service-accent/20 bg-marketing-surface/70 shadow-[0_35px_100px_rgba(0,0,0,.32)] lg:grid-cols-[.78fr_1.22fr]">
        <div className="relative overflow-hidden border-b border-marketing-border p-7 sm:p-9 lg:border-b-0 lg:border-l lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 size-[320px] rounded-full bg-service-accent/[0.1] blur-[90px]" />
          <div className="relative">
            <div className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/[0.08] px-3 py-1.5 text-[10.5px] font-semibold text-service-accent">
              <CalendarCheck2 size={14} /> بررسی نوبت‌دهی کسب‌وکار
            </div>
            <h2 className="font-display mt-5 text-3xl font-black leading-[1.65] text-marketing-text">
              ببینیم نوبت‌دهی هوشمند چطور با برنامه کاری شما هماهنگ می‌شود
            </h2>
            <p className="font-ui mt-4 text-[12.5px] leading-8 text-marketing-text-muted">
              چند اطلاعات اولیه ثبت کنید تا خدمات، ظرفیت و روش فعلی رزرو شما بررسی شود.
            </p>
            <ul className="mt-7 space-y-3">
              {["مرور روش فعلی ثبت و تغییر نوبت", "بررسی خدمات، مدت و ظرفیت", "توضیح مسیر تنظیم و راه‌اندازی"].map((item) => (
                <li key={item} className="font-ui flex items-center gap-2 text-[11.5px] text-marketing-text-muted">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="font-ui mt-7 flex items-start gap-2 rounded-card border border-marketing-border bg-white/[0.025] p-3 text-[10.5px] leading-6 text-marketing-text-subtle">
              <ShieldCheck size={15} className="mt-1 shrink-0 text-service-accent" />
              ثبت درخواست به‌معنی خرید یا فعال‌سازی خودکار سرویس نیست.
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          {submitted ? (
            <div role="status" className="flex min-h-[500px] flex-col items-center justify-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="font-display mt-5 text-2xl font-bold text-marketing-text">درخواست شما ثبت شد</h3>
              <p className="font-ui mt-3 max-w-md text-sm leading-7 text-marketing-text-muted">
                درخواست نوبت‌دهی در Binix ذخیره شد و از پنل مدیریت قابل پیگیری است.
              </p>
              <button type="button" onClick={() => setSubmitted(false)} className="font-ui mt-6 text-xs font-semibold text-service-accent">
                ثبت درخواست دیگر
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی">
                <input name="name" maxLength={120} autoComplete="name" className={inputClass} placeholder="نام شما" />
              </Field>
              <Field label="شماره موبایل" required>
                <input name="phone" required maxLength={11} inputMode="numeric" autoComplete="tel" dir="ltr" className={`${inputClass} text-left`} placeholder="09123456789" />
              </Field>
              <Field label="نام کسب‌وکار" required>
                <input name="businessName" required maxLength={160} autoComplete="organization" className={inputClass} placeholder="نام مجموعه یا برند" />
              </Field>
              <Field label="نوع کسب‌وکار" required>
                <select name="businessType" required defaultValue="" className={inputClass}>
                  <option value="" disabled>انتخاب کنید</option>
                  <option value="کلینیک و مطب">کلینیک و مطب</option>
                  <option value="سالن زیبایی">سالن زیبایی</option>
                  <option value="باشگاه و مربی">باشگاه و مربی</option>
                  <option value="آموزش و مشاوره">آموزش و مشاوره</option>
                  <option value="خدمات حضوری">خدمات حضوری</option>
                  <option value="سایر">سایر</option>
                </select>
              </Field>
              <Field label="روش فعلی ثبت نوبت" required>
                <select name="currentMethod" required defaultValue="" className={inputClass}>
                  <option value="" disabled>انتخاب کنید</option>
                  <option value="تلفن">تلفن</option>
                  <option value="پیام‌رسان">پیام‌رسان</option>
                  <option value="دفتر یا تقویم دستی">دفتر یا تقویم دستی</option>
                  <option value="نرم‌افزار دیگر">نرم‌افزار دیگر</option>
                  <option value="ترکیبی">ترکیبی</option>
                </select>
              </Field>
              <Field label="تعداد تقریبی نوبت روزانه">
                <select name="bookingVolume" defaultValue="" className={inputClass}>
                  <option value="">نامشخص</option>
                  <option value="کمتر از ۱۰ نوبت">کمتر از ۱۰ نوبت</option>
                  <option value="۱۰ تا ۳۰ نوبت">۱۰ تا ۳۰ نوبت</option>
                  <option value="۳۰ تا ۱۰۰ نوبت">۳۰ تا ۱۰۰ نوبت</option>
                  <option value="بیشتر از ۱۰۰ نوبت">بیشتر از ۱۰۰ نوبت</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="مهم‌ترین مسئله یا توضیح تکمیلی">
                  <textarea name="note" maxLength={700} rows={5} className={`${inputClass} h-auto min-h-32 py-3`} placeholder="مثلاً تداخل نوبت، پاسخ‌گویی زیاد یا فراموش‌شدن مراجعه" />
                </Field>
              </div>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="font-ui flex items-start gap-2 text-[11px] leading-6 text-marketing-text-muted sm:col-span-2">
                <input name="consent" type="checkbox" required className="mt-1 accent-[var(--service-accent)]" />
                <span>با تماس تیم Binix برای بررسی درخواست نوبت‌دهی موافقم.</span>
              </label>
              {error ? (
                <div role="alert" className="font-ui rounded-control border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200 sm:col-span-2">
                  {error}
                </div>
              ) : null}
              <button type="submit" disabled={submitting} className="font-ui flex h-12 items-center justify-center gap-2 rounded-control bg-service-accent px-5 text-sm font-bold text-white shadow-[var(--service-accent-glow)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
                {submitting ? "در حال ثبت…" : "ثبت درخواست بررسی رایگان"}
                <Send size={15} />
              </button>
              <p className="font-ui text-center text-[10.5px] text-marketing-text-subtle sm:col-span-2">
                قبلاً حساب ساخته‌اید؟{" "}
                <Link href="/login?service=smart-booking" className="font-semibold text-service-accent">ورود به پنل</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="font-ui block text-xs text-marketing-text-muted">
      <span className="mb-2 block">
        {label}
        {required ? <span className="mr-1 text-service-accent">*</span> : null}
      </span>
      {children}
    </label>
  );
}

