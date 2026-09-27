# Binix UI Audit V5.7

این Audit روی تمام Routeهای موجود پروژه انجام شده است. صفحه Home از نظر محتوا بازنویسی نشده؛ فقط اجزای مشترک مثل Navbar/Tokenها که روی کل سایت اثر دارند هماهنگ شده‌اند.

## Marketing / Service pages

### `/services/ai-sales-agent`
- معماری ServicePageShell و Theme مشترک حفظ شد.
- رنگ‌های عمومی کامپوننت‌های گزارش/داشبورد/اعلان موجودی بیشتر به semantic/service token منتقل شدند.
- پیشنهاد مرحله Backend: اتصال کاتالوگ، مکالمه، سفارش و وضعیت handoff به انسان.

### `/services/smart-booking`
- ساختار Hero/Feature/CTA از Template مشترک استفاده می‌کند.
- پیشنهاد مرحله Backend: لینک رزرو عمومی، تقویم واقعی، ظرفیت خدمت، تعطیلی و Reminder delivery status.

### `/services/excel-analyzer`
- Navbar و Footer مشترک اضافه شد تا با سایر صفحات Marketing sync باشد.
- Heading و Background از service theme داینامیک استفاده می‌کنند.
- Report از `AnalysisReport` واقعی تغذیه می‌شود و sample فقط fallback است.
- دانلود JSON واقعی برای گزارش اضافه شد؛ CTA سؤال از داده تا زمان Backend غیرفعال و شفاف است.
- پیشنهاد مرحله Backend: ذخیره تاریخچه، خروجی PDF/XLSX و Ask-your-data.

### `/services/bi-modules`
- صفحه از حالت خیلی کوتاه به معرفی روشن roadmap ارتقا یافت.
- قابلیت‌های برنامه‌ریزی‌شده و مخاطبان هدف اضافه شدند بدون ادعای آماده بودن محصول.
- پیشنهاد مرحله Product: وقتی Scope نهایی شد، ماژول‌های KPI، Data Source و Dashboard Builder مشخص شوند.

## Auth

### `/login`
- ساختار OTP-first مناسب است.
- AuthShell با برند و تجربه Dashboard هماهنگ شد.
- پیشنهاد Backend: نرخ محدودسازی OTP، خطاهای API، قوانین و حریم خصوصی.

### `/otp`
- autofocus، paste، backspace navigation، arrow navigation، countdown و resend UX تکمیل شد.
- نمایش شماره خواناتر شد.

### `/onboarding`
- نوع کسب‌وکار به‌عنوان داده اختیاری اضافه شد تا بعداً برای شخصی‌سازی سرویس‌ها استفاده شود.
- پیشنهاد Backend: ذخیره profile + business type و پیشنهاد سرویس متناسب.

### `/register`
- Redirect به `/login` صحیح است چون جریان ورود و ثبت‌نام یکپارچه شده است.

## App / Dashboard

### `/app`
- Actionهای بدون عملکرد به Link واقعی تبدیل شدند.
- Active services از یک config موقت مشترک می‌آیند.
- Metricهای جعلی حذف/شفاف شدند.
- پیشنهاد Backend: recent activity + AI recommendations بر اساس رویداد واقعی.

### `/app/services`
- icon/color/status map دستی حذف شد.
- ServiceCard مستقیماً از `services-config` و ServiceTheme استفاده می‌کند.

### `/app/services/sales-agent`
- Workspace واقعی برای مکالمات، سفارش‌ها، کاتالوگ و دانش پاسخ طراحی شد.
- تا زمان API هیچ داده ساختگی نشان داده نمی‌شود.

### `/app/services/booking`
- Workspace برای تقویم، خدمات/ظرفیت، ساعات کاری و یادآوری‌ها طراحی شد.

### `/app/services/excel`
- Workspace برای Upload، Report، Data Quality و Ask-data طراحی شد.
- تاریخچه گزارش با Empty State شفاف آماده Backend است.

### `/app/reports`
- از Empty page به Report Hub سرویس‌محور ارتقا یافت.
- پیشنهاد Backend: فیلتر تاریخ، سرویس، export و گزارش ترکیبی cross-service.

### `/app/notifications`
- انواع اعلان هر سرویس مشخص شد و Empty State حفظ شد.
- پیشنهاد Backend: unread/read، severity، deep-link به رخداد و preference per channel.

### `/app/billing`
- Cardها service-themed و داینامیک شدند.
- قیمت ساختگی وجود ندارد؛ مدل خرید از config خوانده می‌شود.
- پیشنهاد Backend: checkout، invoice، renewal/status و تاریخچه پرداخت.

### `/app/settings`
- Appearance واقعی با ThemeToggle در صفحه قرار گرفت.
- Account/Security/Notification settings برای اتصال Backend ساختاربندی شدند.

## Global UI architecture

- Marketing Navbar کاملاً sync و mobile menu واقعی شد.
- Anchorهای اشتباه `#services/#process/#contact` حذف و به Route/Section واقعی متصل شدند.
- App navigation از config مشترک می‌آید.
- Active service assumptions در `demo-account.ts` متمرکز شدند.
- `ServiceCard` و `ServiceShellHeader` دیگر رنگ و icon دستی نمی‌گیرند.
- `ButtonLink` به سیستم Button اضافه شد تا CTAهای Navigation دیگر button مرده نباشند.
- `AppPage`, `AppSection`, `ServiceWorkspace`, `ServiceModuleCard` اضافه شدند.
- legacy service color tokens حذف شدند؛ service identity فقط از `services-config.ts` می‌آید.
- Select reusable با outside-click و Escape کامل‌تر شد.
- responsive layout برای Header، Navbar، Auth، workspaceها و mobile nav بازبینی شد.

## Validation

- همه فایل‌های TS/TSX با TypeScript transpile برای syntax بررسی شدند.
- همه importهای داخلی `@/...` از نظر وجود فایل بررسی شدند.
- dependency جدید اضافه نشده است.
