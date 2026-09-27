import { KeyRound, LayoutDashboard, ShieldCheck, UserRoundCheck } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";

const items = [
  { icon: KeyRound, title: "دسترسی محدود و مشخص", text: "هر اتصال فقط در محدوده‌ای که برای راه‌اندازی سرویس لازم است تعریف می‌شود." },
  { icon: ShieldCheck, title: "محافظت از اطلاعات اتصال", text: "اطلاعات حساس اتصال سرویس‌ها به‌صورت رمزگذاری‌شده نگهداری می‌شوند." },
  { icon: LayoutDashboard, title: "کنترل از پنل Binix", text: "وضعیت سرویس، راه‌اندازی و اعلان‌های عملیاتی در پنل قابل مشاهده است." },
  { icon: UserRoundCheck, title: "حضور نیروی انسانی", text: "در نقاطی که تصمیم انسانی لازم است، فرایند برای پیگیری به اپراتور واگذار می‌شود." },
];

export default function HomeTrust() {
  return (
    <section dir="rtl" className="border-y border-marketing-border bg-marketing-surface/25 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <SectionHeading
          badge="امنیت و کنترل"
          title="هوشمندسازی بدون از دست دادن کنترل"
          description="سرویس هوشمند باید در محدوده روشن کار کند و وضعیت آن برای مدیر کسب‌وکار قابل پیگیری باشد."
          className="mb-10"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-card border border-marketing-border bg-marketing-background/55 p-5">
              <div className="flex size-11 items-center justify-center rounded-control border border-accent/15 bg-accent/[0.06] text-accent"><Icon size={19} /></div>
              <h3 className="font-display mt-4 text-base font-bold text-marketing-text">{title}</h3>
              <p className="font-ui mt-2 text-[11.5px] leading-6 text-marketing-text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
