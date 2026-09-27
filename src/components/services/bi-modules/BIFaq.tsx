const questions = [
  { question: "فایل Excel باید چه ساختاری داشته باشد؟", answer: "ساختار فایل در بررسی اولیه ارزیابی می‌شود. ستون‌های موردنیاز به مدل فروش و شاخص‌های مورد توافق بستگی دارند؛ بنابراین قبل از بررسی، قالب اجباری و یکسانی تحمیل نمی‌کنیم." },
  { question: "داشبورد کجا نمایش داده می‌شود؟", answer: "داشبورد BI در فضای کسب‌وکار شما داخل پنل Binix نمایش داده می‌شود و به یک فایل گزارش جداگانه محدود نیست." },
  { question: "اطلاعات با چه فاصله‌ای به‌روزرسانی می‌شوند؟", answer: "برنامه به‌روزرسانی براساس فرایند تأمین فایل و نیاز مدیریتی شما در مرحله راه‌اندازی تعیین می‌شود. صفحه معرفی وعده به‌روزرسانی لحظه‌ای نمی‌دهد." },
  { question: "آیا هر عدد قابل ردیابی است؟", answer: "تعریف KPI، منبع داده و زمان آخرین به‌روزرسانی باید روشن باشد تا مدیر بتواند به خروجی اعتماد کند و اختلاف‌ها را پیگیری کند." },
  { question: "چه کسانی داشبورد را می‌بینند؟", answer: "نمای BI در بستر کسب‌وکار Binix قرار می‌گیرد و دسترسی آن باید مطابق نقش‌ها و سطح دسترسی اعضای همان کسب‌وکار تنظیم شود." },
];

export default function BIFaq() {
  return <section dir="rtl" className="px-4 py-24 sm:px-6 lg:px-8"><div className="mx-auto max-w-[900px]"><div className="text-center"><div className="font-ui text-[10.5px] font-semibold text-service-accent">پرسش‌های متداول</div><h2 className="font-display mt-3 text-2xl font-black text-marketing-text sm:text-3xl">قبل از شروع BI چه چیزهایی باید روشن باشد؟</h2></div><div className="mt-10 space-y-3">{questions.map((item) => <details key={item.question} className="group rounded-card border border-marketing-border bg-marketing-surface/55 p-5"><summary className="font-display cursor-pointer list-none text-sm font-bold text-marketing-text marker:hidden"><span className="flex items-center justify-between gap-4">{item.question}<span className="font-ui text-lg font-normal text-service-accent transition group-open:rotate-45">+</span></span></summary><p className="font-ui mt-4 border-t border-marketing-border pt-4 text-[11.5px] leading-7 text-marketing-text-muted">{item.answer}</p></details>)}</div></div></section>;
}
