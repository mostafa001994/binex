import { siteConfig } from "@/lib/site-config";

export type ManagedSeoPageDefinition = {
  path: string;
  label: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
};

export const managedSeoPages: ManagedSeoPageDefinition[] = [
  {
    path: "/",
    label: "صفحه اصلی",
    title: siteConfig.title,
    description: siteConfig.description,
    absoluteTitle: true,
  },
  {
    path: "/services/ai-sales-agent",
    label: "ربات فروش بله",
    title: "ربات فروش بله و دستیار فروش هوشمند",
    description:
      "ربات فروش بله Binix برای پاسخ‌گویی هوشمند، معرفی محصول، بررسی موجودی و همراهی مشتری تا ثبت سفارش؛ با امکان ورود اپراتور انسانی.",
  },
  {
    path: "/services/smart-booking",
    label: "نوبت‌دهی آنلاین",
    title: "سیستم نوبت‌دهی آنلاین کسب‌وکارها",
    description:
      "سیستم نوبت‌دهی آنلاین Binix برای رزرو خدمت، مدیریت ظرفیت، ساعات کاری، تعطیلی و پیگیری نوبت کسب‌وکارهای خدماتی.",
  },
  {
    path: "/services/bi-modules",
    label: "داشبورد هوش تجاری",
    title: "داشبورد هوش تجاری فروش با Excel",
    description:
      "فایل‌های Excel فروش را به داشبورد هوش تجاری، KPIهای روشن و گزارش مدیریتی قابل اقدام در پنل Binix تبدیل کنید.",
  },
  {
    path: "/services/excel-analyzer",
    label: "تحلیلگر اکسل",
    title: "تحلیل فایل اکسل با هوش مصنوعی",
    description:
      "تحلیل فایل Excel یا CSV با هوش مصنوعی برای بررسی کیفیت داده، کشف روندها و تهیه گزارش مدیریتی؛ پردازش واقعی پس از بررسی فایل فعال می‌شود.",
  },
  {
    path: "/services/ai-content",
    label: "تولید محتوای هوشمند",
    title: "تولید محتوای هوشمند",
    description:
      "تولید محتوای هدفمند براساس کلمات کلیدی و منابع منتخب، با بازبینی و انتشار در سایت شما.",
  },
  {
    path: "/blog",
    label: "صفحه اصلی وبلاگ",
    title: "وبلاگ",
    description:
      "آموزش و تحلیل کاربردی درباره هوش مصنوعی، فروش، نوبت‌دهی و هوش تجاری برای کسب‌وکارها.",
  },
];

export function findManagedSeoPage(path: string) {
  return managedSeoPages.find((page) => page.path === path);
}
