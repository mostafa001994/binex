import { BadgeCheck, LayoutDashboard, Puzzle, Route } from "lucide-react";

const items = [
  { icon: BadgeCheck, label: "مناسب کسب‌وکارهای ایرانی" },
  { icon: Puzzle, label: "قابل اتصال به فرایندهای فعلی" },
  { icon: LayoutDashboard, label: "مدیریت از پنل Binix" },
  { icon: Route, label: "شروع مرحله‌ای و متناسب با نیاز" },
];

export default function HomeTrustStrip() {
  return (
    <section dir="rtl" aria-label="مزیت‌های Binix" className="border-y border-marketing-border bg-marketing-surface/45 px-4 py-5 sm:px-6">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="font-ui flex items-center justify-center gap-2 rounded-control px-2 py-2 text-center text-[11px] leading-5 text-marketing-text-muted sm:text-xs">
            <Icon size={15} className="shrink-0 text-accent" aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
