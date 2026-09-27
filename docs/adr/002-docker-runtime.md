# ADR-002: اجرای Docker

- وضعیت: accepted
- تاریخ ثبت: 2026-08-27

## تصمیم

Binix، PostgreSQL، pgAdmin و n8n محلی با Docker مدیریت می‌شوند. Binix از شبکه خارجی `shared_postgres` به PostgreSQL متصل است و دیتابیس/role اختصاصی خود را دارد.

## پیامد

source فعلی bind mount نیست و تغییر کد نیازمند rebuild است. volume دیتابیس باید پایدار و backup مستقل داشته باشد. سرویس‌های مشترک نباید ownership داده Binix را مخدوش کنند.

