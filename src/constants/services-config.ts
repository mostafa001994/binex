import type { IconKey } from "@/constants/icon-registry";

/**
 * Specialized UI configuration for built-in custom pages/workspaces only.
 * Do NOT use this list for global lists, BusinessContext, Sidebar,
 * Billing, Reports, auth intent, or generic service navigation.
 * Those must come from the dynamic Service Catalog APIs.
 */

export type ServiceId =
  | "sales-agent"
  | "smart-booking"
  | "excel-analyzer"
  | "bi"
  | "content-generator";

export type ServiceIconKey = Extract<IconKey, "bot" | "calendar" | "bar-chart" | "dashboard" | "sparkles">;

export type ServiceThemeConfig = {
  accent: string;
  accentSecondary: string;
  accentRgb: string;
};

export type ServiceConfig = {
  id: ServiceId;
  name: string;
  shortName: string;
  category: string;
  description: string;
  href: string;
  appHref?: string;
  icon: ServiceIconKey;
  theme: ServiceThemeConfig;
  billingLabel: string;
  availability: "available" | "coming-soon";
  features: string[];
};

export const servicesConfig: ServiceConfig[] = [
  {
    id: "sales-agent",
    name: "فروشنده هوشمند",
    shortName: "فروشنده هوشمند",
    category: "اپلیکیشن بله",
    description: "دستیار فروش AI برای پاسخ‌گویی، معرفی محصول و پیگیری سفارش در بله.",
    href: "/services/ai-sales-agent",
    appHref: "/app/services/sales-agent",
    icon: "bot",
    theme: { accent: "#8B6CFF", accentSecondary: "#47C7FF", accentRgb: "139 108 255" },
    billingLabel: "فعال‌سازی مستقل",
    availability: "available",
    features: ["پاسخ‌گویی ۲۴ ساعته", "معرفی محصول", "پیگیری سفارش"],
  },
  {
    id: "smart-booking",
    name: "نوبت‌دهی هوشمند",
    shortName: "نوبت‌دهی",
    category: "رزرو آنلاین",
    description: "رزرو آنلاین، مدیریت ظرفیت و یادآوری خودکار برای کسب‌وکارهای خدماتی.",
    href: "/services/smart-booking",
    appHref: "/app/services/booking",
    icon: "calendar",
    theme: { accent: "#2F8FFF", accentSecondary: "#56D8FF", accentRgb: "47 143 255" },
    billingLabel: "فعال‌سازی مستقل",
    availability: "available",
    features: ["رزرو آنلاین", "مدیریت ظرفیت", "یادآور خودکار"],
  },
  {
    id: "excel-analyzer",
    name: "تحلیلگر اکسل",
    shortName: "تحلیلگر اکسل",
    category: "تحلیل داده",
    description: "تبدیل فایل اکسل به خلاصه مدیریتی، بینش‌های کلیدی و پیشنهادهای عملی.",
    href: "/services/excel-analyzer",
    appHref: "/app/services/excel",
    icon: "bar-chart",
    theme: { accent: "#00C6BD", accentSecondary: "#00D5E8", accentRgb: "0 198 189" },
    billingLabel: "فعال‌سازی مستقل",
    availability: "coming-soon",
    features: ["تحلیل فایل", "خلاصه مدیریتی", "پیشنهادهای AI"],
  },
  {
    id: "bi",
    name: "ماژول‌های BI",
    shortName: "BI",
    category: "هوش تجاری",
    description: "داشبوردهای مدیریتی برای پایش شاخص‌ها و تصمیم‌گیری داده‌محور.",
    href: "/services/bi-modules",
    appHref: "/app/services/bi",
    icon: "dashboard",
    theme: { accent: "#6366F1", accentSecondary: "#00C8FF", accentRgb: "99 102 241" },
    billingLabel: "متناسب با نیاز کسب‌وکار",
    availability: "available",
    features: ["داشبورد مدیریتی", "پایش KPI", "گزارش تصمیم‌محور"],
  },
  {
    id: "content-generator",
    name: "تولید محتوای هوشمند",
    shortName: "تولید محتوا",
    category: "بازاریابی محتوایی",
    description: "تولید محتوای هدفمند براساس کلمات کلیدی و منابع منتخب و آماده‌سازی برای انتشار در سایت شما.",
    href: "/services/ai-content",
    appHref: "/app/services/content-generator",
    icon: "sparkles",
    theme: { accent: "#F97316", accentSecondary: "#FACC15", accentRgb: "249 115 22" },
    billingLabel: "فعال‌سازی مستقل",
    availability: "available",
    features: ["تعریف کلمات کلیدی", "ثبت منابع محتوا", "اتصال امن به سایت مقصد"],
  },
];

export const serviceById = Object.fromEntries(
  servicesConfig.map((service) => [service.id, service]),
) as Record<ServiceId, ServiceConfig>;
