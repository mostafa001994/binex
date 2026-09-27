# تست و کیفیت

## دروازه کیفیت

پیش از تحویل تغییر کد، چهار دستور باید موفق باشند:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

موفقیت build به‌تنهایی جایگزین تست رفتار، permission یا دیتابیس نیست.

## سطح‌های تست

- واحد: validation، transition وضعیت، قیمت و permission؛
- repository: query، tenant isolation و mapping Prisma؛
- API: auth، status code، envelope و error؛
- integration: PostgreSQL واقعی و migration؛
- UI: فرم، focus، loading/error/empty و responsive؛
- end-to-end: ورود تا جریان کلیدی کاربر/مدیر؛
- contract: payload و callback سرویس‌های n8n.

## الزامات امنیتی تست

- کاربر کسب‌وکار A به داده B دسترسی ندارد.
- نقش فاقد permission mutation را انجام نمی‌دهد.
- آخرین super-admin محافظت می‌شود.
- secret و OTP در response/log/audit ظاهر نمی‌شوند.
- retry عملیات مالی یا provisioning اثر تکراری ایجاد نمی‌کند.

## تست دیداری

صفحات تغییرکرده در desktop و موبایل، RTL، keyboard-only، modal focus و متن فارسی بازبینی شوند. برای تغییر conversion، CTA و مسیر بعد از submit نیز بررسی شود.

## مستندات

تست `documentation.test.mjs` وجود فایل‌های مرجع و سلامت لینک‌های Markdown محلی را بررسی می‌کند. لینک HTTP و anchor از این کنترل مستثنا هستند.

