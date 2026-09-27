"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Send, Sparkles } from "lucide-react";

const needs = [
  "افزایش و مدیریت فروش",
  "پاسخ‌گویی به مشتریان",
  "رزرو و نوبت‌دهی",
  "گزارش‌های مدیریتی",
  "تحلیل فایل‌های اکسل",
  "هنوز مطمئن نیستم",
];

const inputClass = "font-ui h-12 w-full rounded-control border border-marketing-border bg-marketing-background/70 px-3 text-sm text-marketing-text outline-none transition placeholder:text-marketing-text-subtle focus:border-accent/45 focus:ring-2 focus:ring-accent/10";

export default function ConsultationForm() {
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
          need: data.get("need"),
          channel: data.get("channel"),
          note: data.get("note"),
          website: data.get("website"),
          source: "homepage-consultation",
          consent: data.get("consent") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "ثبت درخواست انجام نشد.");
      form.reset();
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت درخواست انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="consultation" dir="rtl" className="scroll-mt-24 border-y border-marketing-border bg-[#06101d] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-[1120px] overflow-hidden rounded-panel border border-accent/20 bg-marketing-surface/60 shadow-binix-lg lg:grid-cols-[.8fr_1.2fr]">
        <div className="relative overflow-hidden border-b border-marketing-border p-7 sm:p-9 lg:border-b-0 lg:border-l">
          <div className="pointer-events-none absolute -right-20 -top-20 size-[280px] rounded-full bg-accent/[0.09] blur-[80px]" />
          <div className="relative">
            <div className="font-ui inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1.5 text-[11px] font-semibold text-accent"><Sparkles size={13} /> مشاوره اولیه</div>
            <h2 className="font-display mt-5 text-3xl font-black leading-relaxed text-marketing-text">از یک مسئله واقعی در کسب‌وکارتان شروع کنیم</h2>
            <p className="font-ui mt-4 text-sm leading-8 text-marketing-text-muted">اطلاعات اولیه را ثبت کنید تا مناسب‌ترین نقطه برای شروع هوشمندسازی کسب‌وکارتان بررسی شود.</p>
            <ul className="font-ui mt-7 space-y-3 text-xs text-marketing-text-muted">
              {["بررسی نیاز و فرایند فعلی", "انتخاب سرویس متناسب با مسئله", "توضیح شفاف مسیر راه‌اندازی"].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" />{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          {submitted ? (
            <div role="status" className="flex min-h-[430px] flex-col items-center justify-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400"><CheckCircle2 size={30} /></div>
              <h3 className="font-display mt-5 text-2xl font-bold text-marketing-text">درخواست شما ثبت شد</h3>
              <p className="font-ui mt-3 max-w-md text-sm leading-7 text-marketing-text-muted">اطلاعات درخواست در Binix ذخیره شد. جزئیات زمان و کانال پیگیری پس از نهایی‌شدن فرایند مشاوره در همین بخش اعلام خواهد شد.</p>
              <button type="button" onClick={() => setSubmitted(false)} className="font-ui mt-6 text-xs font-semibold text-accent">ثبت درخواست دیگر</button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی"><input name="name" maxLength={120} autoComplete="name" className={inputClass} placeholder="نام شما" /></Field>
              <Field label="شماره موبایل" required><input name="phone" required maxLength={11} inputMode="numeric" autoComplete="tel" dir="ltr" className={`${inputClass} text-left`} placeholder="09123456789" /></Field>
              <Field label="نام کسب‌وکار"><input name="businessName" maxLength={160} autoComplete="organization" className={inputClass} placeholder="اختیاری" /></Field>
              <Field label="نوع کسب‌وکار"><input name="businessType" maxLength={100} className={inputClass} placeholder="مثلاً فروشگاه آنلاین" /></Field>
              <Field label="مهم‌ترین نیاز" required><select name="need" required defaultValue="" className={inputClass}><option value="" disabled>انتخاب کنید</option>{needs.map((need) => <option key={need} value={need}>{need}</option>)}</select></Field>
              <Field label="کانال ارتباطی فعلی"><input name="channel" maxLength={100} className={inputClass} placeholder="مثلاً بله، تلفن یا سایت" /></Field>
              <div className="sm:col-span-2"><Field label="توضیح تکمیلی"><textarea name="note" maxLength={1000} rows={4} className={`${inputClass} h-auto min-h-28 py-3`} placeholder="اگر مسئله مشخصی دارید، کوتاه توضیح دهید." /></Field></div>
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="font-ui flex items-start gap-2 text-[11px] leading-6 text-marketing-text-muted sm:col-span-2"><input name="consent" type="checkbox" required className="mt-1 accent-[var(--accent)]" /><span>با ثبت درخواست، با تماس تیم Binix برای بررسی نیاز کسب‌وکارم موافقم.</span></label>
              {error ? <div role="alert" className="font-ui rounded-control border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200 sm:col-span-2">{error}</div> : null}
              <button type="submit" disabled={submitting} className="font-ui flex h-12 items-center justify-center gap-2 rounded-control bg-gradient-to-l from-primary to-accent px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{submitting ? "در حال ثبت..." : "ثبت درخواست مشاوره رایگان"}<Send size={15} /></button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="font-ui block text-xs text-marketing-text-muted"><span className="mb-2 block">{label}{required ? <span className="mr-1 text-accent">*</span> : null}</span>{children}</label>;
}
