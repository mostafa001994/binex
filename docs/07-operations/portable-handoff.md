# تحویل و اجرای قابل‌حمل Binix

این راهنما برای اجرای Binix روی یک سیستم جدید است. این مسیر به کانتینر PostgreSQL، شبکه Docker یا فایل env سیستم سازنده وابسته نیست.

## پیش‌نیاز

- Windows 10/11
- Docker Desktop با Docker Compose v2
- حداقل 4GB RAM آزاد و حدود 5GB فضای دیسک

Node.js و PostgreSQL روی میزبان لازم نیستند؛ همه اجزا داخل Docker اجرا می‌شوند.

## اجرای سریع روی سیستم جدید

1. فایل ZIP را Extract کنید.
2. Docker Desktop را اجرا کنید و تا آماده‌شدن Engine صبر کنید.
3. PowerShell را در پوشه `BINIX` باز کنید.
4. دستور زیر را اجرا کنید:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\bootstrap-portable.ps1
```

اسکریپت شماره موبایل Super Admin را دریافت می‌کند و سپس:

- رمز تصادفی PostgreSQL می‌سازد؛
- کلید 32 بایتی رمزگذاری credentialها می‌سازد؛
- فایل محرمانه `.env.portable` را ایجاد می‌کند؛
- PostgreSQL را بالا می‌آورد؛
- migrationها و seed را اجرا می‌کند؛
- Binix را build و اجرا می‌کند؛
- Health API را تا دریافت وضعیت سالم بررسی می‌کند.

آدرس برنامه:

```text
http://127.0.0.1:4000
```

در حالت توسعه محلی، کد OTP برابر `12345` است.

## اجرای دستی

ابتدا `.env.portable.example` را به `.env.portable` کپی و placeholderها را با مقادیر امن جایگزین کنید. سپس:

```powershell
docker compose -f compose.portable.yaml --env-file .env.portable config --quiet
docker compose -f compose.portable.yaml --env-file .env.portable up -d --build
docker compose -f compose.portable.yaml --env-file .env.portable ps
```

## بررسی سلامت

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/v1/health" |
    ConvertTo-Json -Depth 5
```

مقدارهای مورد انتظار:

- `status: ok`
- `dataDriver: database`

## توقف و اجرای مجدد

```powershell
docker compose -f compose.portable.yaml --env-file .env.portable stop
docker compose -f compose.portable.yaml --env-file .env.portable start
```

## حذف کانتینرها بدون حذف دیتابیس

```powershell
docker compose -f compose.portable.yaml --env-file .env.portable down
```

## حذف کامل همراه دیتابیس

این دستور تمام داده‌های PostgreSQL همین نسخه قابل‌حمل را حذف می‌کند:

```powershell
docker compose -f compose.portable.yaml --env-file .env.portable down --volumes
```

## تغییر پورت

اگر پورت 4000 یا 15432 اشغال است، قبل از اولین اجرا مقدارهای زیر را در `.env.portable` تغییر دهید:

```dotenv
BINIX_WEB_PORT=4001
BINIX_DB_HOST_PORT=15433
```

## مشاهده لاگ

```powershell
docker compose -f compose.portable.yaml --env-file .env.portable logs --tail 200 web
docker compose -f compose.portable.yaml --env-file .env.portable logs --tail 200 migrate
docker compose -f compose.portable.yaml --env-file .env.portable logs --tail 200 database
```

## نکات امنیتی

- `.env.portable` را برای شخص دیگری ارسال نکنید.
- هر سیستم باید رمز دیتابیس و Encryption Key مستقل داشته باشد.
- فایل ZIP تولیدشده با `export-portable.ps1` فاقد env واقعی و داده‌های محلی است.
- OTP Mock فقط برای توسعه محلی است و برای انتشار اینترنتی مجاز نیست.
- قبل از انتقال داده واقعی، قوانین حریم خصوصی و نگهداری داده تعیین شوند.

## ساخت ZIP تمیز برای تحویل

روی سیستم سازنده:

```powershell
.\scripts\export-portable.ps1
```

فایل ZIP در پوشه والد پروژه ساخته می‌شود. `node_modules`، `.next`، `.env`های واقعی، داده محلی و Prisma Client تولیدشده داخل ZIP قرار نمی‌گیرند؛ Docker آن‌ها را هنگام build ایجاد می‌کند.
