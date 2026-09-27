# راهنمای مستندات Binix

این پوشه مرجع مشترک محصول، توسعه و عملیات Binix است. هر سند باید وضعیت واقعی کد را توضیح دهد و بین «پیاده‌سازی‌شده»، «نیمه‌کاره» و «برنامه آینده» تفاوت بگذارد.

## ساختار

| بخش | موضوع |
|---|---|
| `00-product` | هدف محصول، کاربران، وضعیت سرویس‌ها و نقشه راه |
| `01-architecture` | معماری برنامه، جریان داده و مرز n8n |
| `02-database` | مدل داده، migration و نگهداری دیتابیس |
| `03-backend` | API، احراز هویت، RBAC و خطاها |
| `04-features` | وضعیت قابلیت‌های پنل کاربر و مدیریت |
| `05-services` | وضعیت و قرارداد هر سرویس قابل عرضه |
| `06-ui-ux` | اصول تجربه کاربری، RTL و دسترس‌پذیری |
| `07-operations` | توسعه محلی، Docker، backup و troubleshooting |
| `08-development` | قواعد توسعه، تست و Definition of Done |
| `adr` | سوابق تصمیم‌های معماری |

## برچسب وضعیت

- **عملیاتی:** به دیتابیس و مسیر UI/API واقعی متصل است.
- **بنیاد آماده:** مدل و مدیریت داخلی وجود دارد ولی اتصال بیرونی کامل نیست.
- **نمایشی:** UI یا داده نمونه وجود دارد اما جریان production کامل نیست.
- **برنامه‌ریزی‌شده:** هنوز در کد عملیاتی وجود ندارد.
- **نیازمند تصمیم:** پاسخ آن از کد یا تصمیم‌های ثبت‌شده قابل استخراج نیست.

## قانون به‌روزرسانی

هر تغییر در مدل داده، API، مجوز، متغیر محیطی، Docker، چرخه اشتراک یا وضعیت سرویس باید همان‌زمان سند مرتبط را هم تغییر دهد. مستندات نباید شامل secret، رمز، OTP، داده شخصی یا آدرس production باشند.

## فهرست اسناد فعلی

- [معرفی محصول](00-product/product-overview.md)
- [وضعیت سرویس‌ها](00-product/service-status.md)
- [نقشه راه](00-product/roadmap.md)
- [نمای کلی معماری](01-architecture/system-overview.md)
- [ساختار برنامه](01-architecture/application-architecture.md)
- [مرز n8n](01-architecture/n8n-integration-boundaries.md)
- [مدل داده](02-database/data-model.md)
- [نمودار ER کامل](02-database/erd.md)
- [migrationها](02-database/migrations.md)
- [APIها](03-backend/api-overview.md)
- [احراز هویت و RBAC](03-backend/authentication-and-rbac.md)
- [قابلیت‌های فعلی](04-features/current-capabilities.md)
- [فروشنده هوشمند](05-services/ai-sales-agent.md)
- [اصول UI/UX](06-ui-ux/design-system.md)
- [توسعه محلی](07-operations/local-development.md)
- [Docker](07-operations/docker-runbook.md)
- [تحویل و اجرای قابل‌حمل با Docker](07-operations/portable-handoff.md)
- [پشتیبان‌گیری](07-operations/backup-and-restore.md)
- [تست و کیفیت](08-development/testing-and-quality.md)
- [Definition of Done](08-development/definition-of-done.md)
- [ADR](adr/README.md)
