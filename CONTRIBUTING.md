# مشارکت در Binix

## پیش از تغییر

موضوع را به یکی از دامنه‌های محصول، مشتری، فروش، مالی، عملیات یا سیستم نسبت دهید و منابع حقیقت و permissionهای درگیر را مشخص کنید.

## قواعد

- تغییرات کوچک و متمرکز باشند.
- فایل generated Prisma دستی ویرایش نشود.
- secret، `.env.docker` و اطلاعات مشتری commit نشوند.
- هر mutation از service دامنه و repository مناسب عبور کند.
- وضعیت mock و database با هم اشتباه نشوند.
- migration اعمال‌شده دستکاری نشود.
- مستند مرتبط هم‌زمان اصلاح شود.

## قبل از تحویل

دستورهای typecheck، lint، test و build را اجرا و مسیر دستی متاثر را بررسی کنید. از [Definition of Done](docs/08-development/definition-of-done.md) استفاده کنید.

