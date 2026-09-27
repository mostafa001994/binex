# راهنمای migration و seed

## اصول

- `prisma/schema.prisma` منبع تعریف مدل است.
- migration اعمال‌شده هرگز ویرایش یا حذف نمی‌شود؛ اصلاح با migration جدید انجام می‌شود.
- در محیط اشتراکی/production فقط `prisma migrate deploy` اجرا می‌شود.
- `db push` جایگزین migration قابل بازبینی نیست.
- قبل از migration پرریسک backup و طرح rollback لازم است.

## تفاوت آدرس میزبان و کانتینر

- داخل شبکه Docker: میزبان دیتابیس `postgres:5432` است.
- از PowerShell میزبان: PostgreSQL روی `127.0.0.1:15432` منتشر شده است.

فقط host بخش `DATABASE_URL` برای اجرای ابزار Prisma روی میزبان تغییر می‌کند؛ credential در مستند یا تاریخچه shell چاپ نمی‌شود.

## چرخه توسعه

1. schema را تغییر دهید.
2. migration نام‌دار ایجاد و SQL تولیدشده را بازبینی کنید.
3. به‌خصوص `DROP`, `TRUNCATE`, تغییر نوع و قواعد `ON DELETE` را بررسی کنید.
4. migration را روی دیتابیس محلی اعمال کنید.
5. Prisma Client را generate کنید.
6. typecheck، lint، test و build را اجرا کنید.
7. UI و API متاثر را تست کنید.
8. schema و migration را همراه مستند commit کنید.

## seed

seed سرویس‌های پایه و super-admin اولیه را به‌صورت idempotent ایجاد می‌کند. متغیر شماره مدیر باید معتبر باشد و فقط از environment خوانده شود. seed نباید اطلاعات واقعی مشتری یا secret سرویس ایجاد کند.

## کنترل وضعیت

```powershell
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

اجرای فرمان‌ها نیازمند `DATABASE_URL` معتبر است. مقدار آن نباید در خروجی گزارش یا مستند کپی شود.

## بازیابی خطا

در شکست migration، ابتدا log و جدول `_prisma_migrations` را بدون دستکاری مستقیم بررسی کنید. اقدام دستی روی تاریخچه فقط پس از backup، تشخیص دقیق و ثبت ADR/incident مجاز است.

