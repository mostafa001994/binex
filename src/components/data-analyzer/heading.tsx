import { BarChart3 } from "lucide-react";
import FeatureChips from "./feature-chips";

export default function Heading() {
  return (
    <div className="pt-20 text-center sm:pt-24">
      <div className="font-ui mx-auto inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/10 px-3 py-1.5 text-xs font-semibold text-service-accent"><BarChart3 size={14} />تحلیلگر اکسل Binix</div>
      <div className="mt-5 space-y-5 text-center">
        <h1 className="font-display text-3xl font-bold leading-[1.45] text-marketing-text md:text-4xl lg:text-5xl">از فایل خام اکسل، <span className="bg-gradient-to-l from-service-accent-secondary to-service-accent bg-clip-text text-transparent">بینش قابل تصمیم بسازید</span></h1>
        <p className="font-ui mx-auto max-w-2xl text-sm leading-8 text-marketing-text-muted">نوع فایل را انتخاب کنید، نمونه استاندارد را دریافت کنید و داده خود را برای ساخت گزارش مدیریتی آماده کنید.</p>
      </div>
      <FeatureChips />
    </div>
  );
}
