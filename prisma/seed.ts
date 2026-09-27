import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ServiceAvailability,
  ServiceCatalogStatus,
  ServiceVisibility,
  SystemRole,
  UserStatus,
} from "../src/generated/prisma/client";

import {
  seedNotificationEvents,
} from "./seed/notification-events";


import {
  seedNotificationTemplates,
} from "./seed/notification-templates";
import { seedNotificationRules } from "./seed/notification-rules";
import { seedNotificationProviders } from "./seed/notification-providers";

const connectionString = process.env.DATABASE_URL;
const superAdminPhone = process.env.BINIX_SEED_SUPER_ADMIN_PHONE;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

if (!superAdminPhone || !/^09\d{9}$/.test(superAdminPhone)) {
  throw new Error("A valid BINIX_SEED_SUPER_ADMIN_PHONE is required.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const services = [
  {
    id: "sales-agent",
    slug: "ai-sales-agent",
    name: "فروشنده هوشمند",
    shortName: "فروشنده هوشمند",
    category: "فروش و پاسخ‌گویی",
    description: "دستیار فروش هوشمند برای پاسخ‌گویی و مدیریت فروش در بله.",
    appHref: "/app/services/sales-agent",
    marketingHref: "/services/ai-sales-agent",
    availability: ServiceAvailability.AVAILABLE,
    status: ServiceCatalogStatus.ACTIVE,
    visibility: ServiceVisibility.PUBLIC,
    accent: "#8B6CFF",
    iconKey: "bot",
    sortOrder: 10,
    features: [
      "پاسخ‌گویی ۲۴ ساعته",
      "معرفی محصول",
      "پیگیری سفارش",
    ],
  },
  {
    id: "smart-booking",
    slug: "smart-booking",
    name: "نوبت‌دهی هوشمند",
    shortName: "نوبت‌دهی",
    category: "رزرو و نوبت",
    description: "مدیریت خدمات، ظرفیت، ساعات کاری و رزروهای مشتریان.",
    appHref: "/app/services/booking",
    marketingHref: "/services/smart-booking",
    availability: ServiceAvailability.AVAILABLE,
    status: ServiceCatalogStatus.ACTIVE,
    visibility: ServiceVisibility.PUBLIC,
    accent: "#2F8FFF",
    iconKey: "calendar",
    sortOrder: 20,
    features: [
      "رزرو آنلاین",
      "مدیریت ظرفیت",
      "یادآور خودکار",
    ],
  },
  {
    id: "bi",
    slug: "bi-modules",
    name: "ماژول‌های BI",
    shortName: "BI",
    category: "هوش تجاری",
    description: "داشبوردها و ماژول‌های هوش تجاری Binix برای تصمیم‌گیری مدیریتی.",
    appHref: "/app/services/bi",
    marketingHref: "/services/bi-modules",
    availability: ServiceAvailability.AVAILABLE,
    status: ServiceCatalogStatus.ACTIVE,
    visibility: ServiceVisibility.PUBLIC,
    accent: "#6366F1",
    iconKey: "dashboard",
    sortOrder: 30,
    features: [
      "داشبورد مدیریتی",
      "پایش KPI",
      "گزارش تصمیم‌محور",
    ],
  },
  {
    id: "excel-analyzer",
    slug: "excel-analyzer",
    name: "تحلیلگر اکسل",
    shortName: "تحلیلگر اکسل",
    category: "تحلیل داده",
    description: "ورود فایل‌های اکسل و آماده‌سازی گزارش مدیریتی و کیفیت داده.",
    appHref: "/app/services/excel",
    marketingHref: "/services/excel-analyzer",
    availability: ServiceAvailability.COMING_SOON,
    status: ServiceCatalogStatus.ACTIVE,
    visibility: ServiceVisibility.PUBLIC,
    accent: "#00C6BD",
    iconKey: "bar-chart",
    sortOrder: 40,
    features: [
      "تحلیل فایل",
      "خلاصه مدیریتی",
      "پیشنهادهای AI",
    ],
  },
  {
    id: "content-generator",
    slug: "ai-content",
    name: "تولید محتوای هوشمند",
    shortName: "تولید محتوا",
    category: "بازاریابی محتوایی",
    description: "تولید محتوای هدفمند براساس کلمات کلیدی و منابع منتخب و آماده‌سازی برای انتشار در سایت شما.",
    appHref: "/app/services/content-generator",
    marketingHref: "/services/ai-content",
    availability: ServiceAvailability.AVAILABLE,
    status: ServiceCatalogStatus.ACTIVE,
    visibility: ServiceVisibility.PUBLIC,
    accent: "#F97316",
    iconKey: "sparkles",
    sortOrder: 50,
    features: [
      "تعریف کلمات کلیدی هدف",
      "ثبت URL منابع منتخب",
      "اتصال امن به سایت مقصد",
      "آماده‌سازی محتوا برای انتشار",
    ],
  },
];

async function main() {
  await prisma.user.upsert({
    where: { phone: superAdminPhone },
    update: {
      systemRole: SystemRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      accessRole: { connect: { code: "super-admin" } },
    },
    create: {
      phone: superAdminPhone!,
      systemRole: SystemRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      accessRole: { connect: { code: "super-admin" } },
    },
  });

  for (const service of services) {
    await prisma.serviceDefinition.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
  }


  await seedNotificationEvents(prisma);


  await seedNotificationTemplates(prisma);
  await seedNotificationRules(prisma);
  await seedNotificationProviders(prisma);


  const userCount = await prisma.user.count();
  const serviceCount = await prisma.serviceDefinition.count();

  console.log(`Seed completed. Users: ${userCount}, services: ${serviceCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
