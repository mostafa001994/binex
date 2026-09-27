# توسعه محلی

## پیش‌نیازها

- Node.js 22 و npm
- Docker Desktop
- PostgreSQL 17 در Docker
- فایل `.env.docker` محلی و خارج از Git

## اجرای بدون Docker

```powershell
npm ci
npm run dev
```

برای repository دیتابیسی، `DATABASE_URL` باید به port میزبان PostgreSQL اشاره کند.

## کنترل کیفیت

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

## تغییر و مشاهده در Docker

compose فعلی image می‌سازد و source را bind mount نمی‌کند؛ بنابراین تغییر فایل‌های درایو E به‌صورت خودکار داخل کانتینر موجود دیده نمی‌شود. پس از تغییر کد باید image دوباره build و web recreate شود.

برای چرخه سریع توسعه می‌توان خارج Docker از `npm run dev` استفاده کرد. ساخت compose مخصوص development با bind mount تصمیم جداگانه است.

## قواعد environment

- مقدار واقعی secret را commit یا در screenshot منتشر نکنید.
- `.env.docker` فقط محلی است.
- driver production-like باید `database` باشد.
- OTP mock فقط برای توسعه است.

