import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/binix/empty-state";
import { ServiceSetupChecklist } from "@/components/binix/service-setup-checklist";
import { ServiceWorkspace } from "@/components/app/service-workspace";

const modules = [
  {
    icon: "calendar-days" as const,
    title: "تقویم رزرو",
    description: "رزروهای روزانه و هفتگی با تمرکز روی ظرفیت‌های پر و خالی.",
    status: "setup" as const,
  },
  {
    icon: "list-checks" as const,
    title: "خدمات و ظرفیت",
    description: "تعریف خدمات، مدت زمان و ظرفیت قابل رزرو.",
    status: "setup" as const,
  },
  {
    icon: "clock" as const,
    title: "ساعات کاری",
    description: "ساعات کاری، تعطیلی‌ها و بازه‌های قابل رزرو.",
    status: "setup" as const,
  },
  {
    icon: "bell-ring" as const,
    title: "یادآوری‌ها",
    description: "زمان‌بندی یادآوری پیش از مراجعه و وضعیت ارسال.",
    status: "setup" as const,
  },
];

export default function BookingAppPage() {
  return (
    <ServiceWorkspace
      service="smart-booking"
      description="خدمات، ظرفیت، ساعات کاری و رزروهای مشتریان را از یک فضای واحد مدیریت کنید."
      stateDescription="برای انتشار رزرو، ابتدا خدمات، ساعات کاری و استثناها را مشخص کنید."
      modules={modules}
    >
      <ServiceSetupChecklist
        title="آماده‌سازی نوبت‌دهی"
        description="بعد از تکمیل این مراحل، لینک رزرو برای انتشار آماده می‌شود."
        steps={[
          {
            id: "services",
            title: "تعریف خدمات",
            description: "نام خدمت، مدت زمان و ظرفیت هر نوبت.",
          },
          {
            id: "hours",
            title: "تنظیم ساعات کاری",
            description: "روزها، ساعت‌ها و زمان‌های استراحت.",
          },
          {
            id: "holidays",
            title: "تعطیلی‌ها و استثناها",
            description: "روزهای تعطیل یا بازه‌هایی که رزرو بسته است.",
          },
          {
            id: "reminders",
            title: "یادآوری مراجعه",
            description: "زمان ارسال یادآوری قبل از نوبت.",
          },
          {
            id: "publish",
            title: "انتشار لینک رزرو",
            description: "بعد از بررسی نهایی، لینک را برای مشتریان منتشر کنید.",
          },
        ]}
      />

      <EmptyState
        icon={<CalendarDays size={21} />}
        title="هنوز رزرو واقعی ندارید"
        description="بعد از انتشار لینک رزرو، نوبت‌ها و ظرفیت باقی‌مانده در این صفحه نمایش داده می‌شوند."
        actionLabel="مشاهده سرویس‌های من"
        actionHref="/app/services"
      />
    </ServiceWorkspace>
  );
}
