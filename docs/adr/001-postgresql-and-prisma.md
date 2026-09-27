# ADR-001: PostgreSQL و Prisma

- وضعیت: accepted
- تاریخ ثبت: 2026-08-27

## زمینه

محصول به داده پایدار برای کاربران، کسب‌وکارها، سرویس‌ها، مالی، پشتیبانی و audit نیاز دارد و mock برای ادامه توسعه کافی نیست.

## تصمیم

PostgreSQL منبع داده اصلی و Prisma لایه schema، migration و client است. دسترسی دامنه از repository abstraction عبور می‌کند تا mock فقط ابزار توسعه باقی بماند.

## پیامد

migration و backup جزو عملیات الزامی‌اند؛ `DATABASE_URL` secret است؛ tenant isolation و قواعد رابطه باید در هر تغییر بررسی شوند.

