# Binix

Binix یک پلتفرم فارسی و RTL برای معرفی، فروش اشتراک، راه‌اندازی و مدیریت سرویس‌های هوشمند کسب‌وکار است. اجرای اصلی سرویس‌ها در n8n و کانال‌هایی مانند پیام‌رسان بله انجام می‌شود؛ وب‌سایت مسئول بازاریابی، ثبت درخواست، خرید و مدیریت سرویس است.

> وضعیت مستند: ۱۴۰۵/۰۶/۰۵ — این README بر اساس کد، Prisma schema و Docker فعلی پروژه نوشته شده است.

## وضعیت فعلی

- صفحه اصلی و صفحه فروشنده هوشمند دارای مسیر واقعی ثبت درخواست هستند.
- داده عملیاتی در حالت Docker به PostgreSQL متصل است.
- پنل کاربر و پنل مدیریت، احراز هویت OTP، RBAC، کاتالوگ سرویس، پلن، اشتراک، سفارش، پرداخت، راه‌اندازی، تیکت، اعلان، Audit Log و درخواست‌های مشاوره در کد وجود دارند.
- OTP واقعی پیامکی، درگاه پرداخت واقعی و worker اجرای jobهای n8n هنوز تکمیل نشده‌اند.
- فروشنده هوشمند سرویس اول محصول است؛ رزرو نوبت، BI و تحلیل اکسل در نقشه راه بعدی قرار دارند.

جزئیات دقیق وضعیت قابلیت‌ها: [docs/00-product/service-status.md](docs/00-product/service-status.md)

## فناوری‌ها

- Next.js 15 و React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma 7 و PostgreSQL 17
- Docker Compose
- Framer Motion، GSAP و Lucide Icons
- Node.js 22

## اجرای سریع

### اجرای قابل‌حمل روی یک سیستم جدید

این روش PostgreSQL، migration، seed و وب را بدون وابستگی به کانتینرهای قبلی اجرا می‌کند:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\bootstrap-portable.ps1
```

راهنمای کامل و روش ساخت ZIP امن: [docs/07-operations/portable-handoff.md](docs/07-operations/portable-handoff.md)

### حالت توسعه Mock

```bash
npm ci
npm run dev
```

آدرس پیش‌فرض: `http://localhost:4000`

این حالت برای توسعه UI مناسب است و به PostgreSQL نیاز ندارد. داده‌های Mock در `.binix/` نگهداری می‌شوند و نباید مبنای تست production باشند.

### حالت Docker با PostgreSQL

پیش‌نیازها:

- Docker Desktop
- شبکه خارجی `shared_postgres`
- کانتینر PostgreSQL با نام DNS برابر `postgres`
- فایل محلی `.env.docker`
- migrationهای اعمال‌شده روی دیتابیس `binix`

```powershell
$docker = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe"

$composeArgs = @(
    "compose",
    "-f", "compose.yaml",
    "-f", "compose.postgres.yaml",
    "--env-file", ".env.docker"
)

& $docker @composeArgs build web
& $docker @composeArgs up -d --force-recreate web
```

بررسی سلامت:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/v1/health"
```

خروجی سالم در محیط اصلی باید `dataDriver: database` داشته باشد.

راهنمای کامل: [docs/07-operations/docker-runbook.md](docs/07-operations/docker-runbook.md)

## دستورات کنترل کیفیت

```bash
npm run db:generate
npm run typecheck
npm test
npm run lint
npm run build
```

## نقشه مستندات

- [راهنمای مستندات](docs/README.md)
- [معرفی محصول](docs/00-product/product-overview.md)
- [وضعیت سرویس‌ها و قابلیت‌ها](docs/00-product/service-status.md)
- [معماری سیستم](docs/01-architecture/system-overview.md)
- [مدل داده](docs/02-database/data-model.md)
- [APIها](docs/03-backend/api-overview.md)
- [احراز هویت و RBAC](docs/03-backend/authentication-and-rbac.md)
- [اجرای Docker](docs/07-operations/docker-runbook.md)
- [تحویل و اجرای قابل‌حمل](docs/07-operations/portable-handoff.md)
- [استاندارد توسعه و تست](docs/08-development/testing-and-quality.md)
- [تصمیم‌های معماری](docs/adr/README.md)

## قواعد امنیتی

- `.env.docker`، رمز دیتابیس، کلید رمزنگاری و توکن سرویس‌ها نباید commit یا در مستندات کپی شوند.
- عملیات migration و seed ابتدا باید روی دیتابیس غیرproduction بررسی شوند.
- سرویس‌های خارجی و n8n production در تست‌های محلی نباید تغییر داده شوند.
- مقادیر نمایشی UI، داده واقعی کسب‌وکار محسوب نمی‌شوند.

## منابع حقیقت

در صورت اختلاف، اولویت منابع به‌ترتیب زیر است:

1. قواعد و تصمیم‌های تأییدشده محصول
2. Prisma schema و migrationهای اعمال‌شده
3. قراردادهای backend و تست‌ها
4. مستندات این پوشه
5. متن‌های نمایشی UI
