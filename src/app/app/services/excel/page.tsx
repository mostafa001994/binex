import { BarChart3 } from "lucide-react";
import { AppSection } from "@/components/app/app-section";
import { AnalysisUploader } from "@/components/app/analysis-uploader";
import { ServiceWorkspace } from "@/components/app/service-workspace";
import { EmptyState } from "@/components/binix/empty-state";
import { ServiceSetupChecklist } from "@/components/binix/service-setup-checklist";

const modules = [
  {
    icon: "upload" as const,
    title: "آپلود و تحلیل",
    description: "ورود فایل و شروع جریان تحلیل داده.",
    status: "ready" as const,
  },
  {
    icon: "bar-chart" as const,
    title: "گزارش مدیریتی",
    description: "KPI، روندها، خلاصه مدیریتی و نکات کلیدی فایل.",
    status: "setup" as const,
  },
  {
    icon: "file-search" as const,
    title: "کیفیت داده",
    description: "شناسایی داده ناقص، مقدار غیرعادی و موارد نیازمند پاک‌سازی.",
    status: "setup" as const,
  },
  {
    icon: "message-more" as const,
    title: "سؤال از داده",
    description: "پرسیدن سؤال طبیعی درباره فایل و دریافت پاسخ قابل فهم.",
    status: "coming-soon" as const,
  },
];

export default function ExcelServicePage() {
  return (
    <ServiceWorkspace
      service="excel-analyzer"
      description="فایل خام را وارد کنید و پس از فعال شدن موتور تحلیل، گزارش مدیریتی و بینش‌های قابل اقدام دریافت کنید."
      stateDescription="آپلود فایل آماده است؛ گزارش واقعی فقط بعد از پردازش واقعی داده نمایش داده می‌شود."
      modules={modules}
    >
      <ServiceSetupChecklist
        title="آماده‌سازی اولین تحلیل"
        description="برای شروع فقط یک فایل ساختاریافته و معتبر نیاز دارید."
        steps={[
          {
            id: "file",
            title: "یک فایل XLSX، XLS یا CSV آماده کنید",
            description: "ستون‌ها عنوان مشخص و داده‌ها ساختار جدولی داشته باشند.",
            done: true,
          },
          {
            id: "upload",
            title: "فایل را بارگذاری کنید",
            description: "فرمت و حجم فایل قبل از پردازش بررسی می‌شود.",
          },
          {
            id: "report",
            title: "گزارش واقعی را دریافت کنید",
            description: "این مرحله فقط بعد از پردازش موفق داده فعال می‌شود.",
          },
        ]}
      />

      <AppSection
        title="شروع تحلیل"
        description="فایل‌های XLSX، XLS و CSV را از این بخش وارد کنید."
      >
        <AnalysisUploader />
      </AppSection>

      <AppSection
        title="گزارش‌های اخیر"
        description="فقط تحلیل‌های واقعی و تکمیل‌شده در تاریخچه نگهداری می‌شوند."
      >
        <EmptyState
          icon={<BarChart3 size={21} />}
          title="هنوز گزارشی ندارید"
          description="اولین گزارش بعد از تحلیل موفق فایل در این بخش قابل بازکردن و مقایسه خواهد بود."
        />
      </AppSection>
    </ServiceWorkspace>
  );
}
