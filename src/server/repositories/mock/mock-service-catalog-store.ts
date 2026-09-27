import fs from "node:fs";
import path from "node:path";
import type { ServiceDefinition } from "@/server/services/service-types";
import {
  createDefaultServiceMarketingContent,
  normalizeServiceMarketingContent,
} from "@/types/service-marketing";

const storePath = path.join(
  process.cwd(),
  ".binix",
  "mock-service-catalog.json",
);

const now = "2026-08-23T00:00:00.000Z";

const seedServiceBase: Omit<ServiceDefinition, "marketingContent">[] = [
  {
    id: "sales-agent",
    slug: "ai-sales-agent",
    name: "فروشنده هوشمند",
    shortName: "فروشنده هوشمند",
    category: "فروش و پاسخ‌گویی",
    description:
      "دستیار فروش هوشمند برای پاسخ‌گویی و مدیریت فروش در بله.",
    appHref: "/app/services/sales-agent",
    marketingHref:
      "/services/ai-sales-agent",
    availability: "available",
    status: "active",
    visibility: "public",
    accent: "#8B6CFF",
    iconKey: "bot",
    sortOrder: 10,
    features: [
      "پاسخ‌گویی ۲۴ ساعته",
      "معرفی محصول",
      "پیگیری سفارش",
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "smart-booking",
    slug: "smart-booking",
    name: "نوبت‌دهی هوشمند",
    shortName: "نوبت‌دهی",
    category: "رزرو و نوبت",
    description:
      "مدیریت خدمات، ظرفیت، ساعات کاری و رزروهای مشتریان.",
    appHref: "/app/services/booking",
    marketingHref:
      "/services/smart-booking",
    availability: "available",
    status: "active",
    visibility: "public",
    accent: "#2F8FFF",
    iconKey: "calendar",
    sortOrder: 20,
    features: [
      "رزرو آنلاین",
      "مدیریت ظرفیت",
      "یادآور خودکار",
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "excel-analyzer",
    slug: "excel-analyzer",
    name: "تحلیلگر اکسل",
    shortName: "تحلیلگر اکسل",
    category: "تحلیل داده",
    description:
      "ورود فایل‌های اکسل و آماده‌سازی گزارش مدیریتی و کیفیت داده.",
    appHref: "/app/services/excel",
    marketingHref:
      "/services/excel-analyzer",
    availability: "coming-soon",
    status: "active",
    visibility: "public",
    accent: "#00C6BD",
    iconKey: "bar-chart",
    sortOrder: 30,
    features: [
      "تحلیل فایل",
      "خلاصه مدیریتی",
      "پیشنهادهای AI",
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "bi",
    slug: "bi-modules",
    name: "ماژول‌های BI",
    shortName: "BI",
    category: "هوش تجاری",
    description:
      "داشبوردها و ماژول‌های هوش تجاری Binix برای تصمیم‌گیری مدیریتی.",
    appHref: "/app/services/bi",
    marketingHref:
      "/services/bi-modules",
    availability: "available",
    status: "active",
    visibility: "public",
    accent: "#6366F1",
    iconKey: "dashboard",
    sortOrder: 40,
    features: [
      "داشبورد مدیریتی",
      "پایش KPI",
      "گزارش تصمیم‌محور",
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "content-generator",
    slug: "ai-content",
    name: "تولید محتوای هوشمند",
    shortName: "تولید محتوا",
    category: "بازاریابی محتوایی",
    description:
      "تولید محتوای هدفمند براساس کلمات کلیدی و منابع منتخب و آماده‌سازی برای انتشار در سایت شما.",
    appHref: "/app/services/content-generator",
    marketingHref: "/services/ai-content",
    availability: "available",
    status: "active",
    visibility: "public",
    accent: "#F97316",
    iconKey: "sparkles",
    sortOrder: 50,
    features: [
      "تعریف کلمات کلیدی هدف",
      "ثبت URL منابع منتخب",
      "اتصال امن به سایت مقصد",
      "آماده‌سازی محتوا برای انتشار",
    ],
    createdAt: now,
    updatedAt: now,
  },
];

const seedServices: ServiceDefinition[] = seedServiceBase.map((service) => ({
  ...service,
  marketingContent: createDefaultServiceMarketingContent(service),
}));

declare global {
  var __binixMockServiceCatalog:
    | ServiceDefinition[]
    | undefined;
}

function readDiskStore() {
  try {
    if (!fs.existsSync(storePath)) {
      return null;
    }

    const parsed = JSON.parse(
      fs.readFileSync(
        storePath,
        "utf8",
      ),
    ) as ServiceDefinition[];

    return Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function getMockServiceCatalogStore() {
  if (
    !globalThis.__binixMockServiceCatalog
  ) {
    const source = readDiskStore() ?? seedServices;
    globalThis.__binixMockServiceCatalog = source.map((item) => ({
        ...item,
        features: [...item.features],
        marketingContent: normalizeServiceMarketingContent(
          item.marketingContent,
          item,
        ),
      }));
  }

  return globalThis.__binixMockServiceCatalog;
}

export function persistMockServiceCatalogStore() {
  const directory =
    path.dirname(storePath);

  fs.mkdirSync(directory, {
    recursive: true,
  });

  fs.writeFileSync(
    storePath,
    JSON.stringify(
      getMockServiceCatalogStore(),
      null,
      2,
    ),
    "utf8",
  );
}
