# احراز هویت و کنترل دسترسی

## ورود با OTP

چرخه فعلی:

1. کاربر شماره موبایل معتبر وارد می‌کند.
2. challenge با محدودیت ارسال و تلاش ایجاد می‌شود.
3. OTP در حالت محلی توسط driver mock و در آینده توسط provider پیامک ارسال می‌شود.
4. پس از تأیید، session opaque در cookie امن نگهداری می‌شود.
5. logout session را باطل می‌کند.

پیکربندی فعلی کد شامل OTP پنج‌رقمی، عمر حدود ۱۲۰ ثانیه، فاصله ارسال مجدد ۶۰ ثانیه، حداکثر ۵ تلاش و session حدود ۳۰ روزه است. تغییر این مقادیر تصمیم امنیتی محسوب می‌شود.

## وضعیت provider

- `mock`: برای توسعه محلی عملیاتی است.
- `sms`: interface موجود است اما provider واقعی هنوز پیکربندی/پیاده‌سازی نشده است.

OTP هرگز نباید در log production یا پاسخ API نمایش داده شود.

## RBAC

نقش‌ها و permissionها در `AccessRole` و `AccessRolePermission` قابل مدیریت‌اند. fallbackهای ثابت کد برای bootstrap و ایمنی وجود دارند، اما منبع عملیاتی پنل باید دیتابیس باشد.

دسته‌های مجوز شامل مدیریت کاربران، کسب‌وکارها، سرویس‌ها، فروش/مالی، عملیات، پشتیبانی، اعلان، audit، سیستم و نقش‌ها است.

## اصل بررسی دسترسی

```text
session معتبر
  + کاربر فعال
  + permission لازم
  + عضویت/مالکیت business در عملیات tenant
  = اجازه عملیات
```

عنوانی مانند `admin` به‌تنهایی مجوز کافی نیست. super-admin نیز باید برای عملیات خطرناک confirmation و audit داشته باشد.

## حفاظت‌های ضروری

- جلوگیری از حذف یا تنزل آخرین super-admin؛
- جلوگیری از self-lockout مدیر؛
- ابطال session پس از تعلیق کاربر یا تغییر امنیتی مهم؛
- ثبت actor، target، action، زمان، request ID و metadata پالایش‌شده؛
- عدم پذیرش role/permission ارسالی client بدون کنترل سرور؛
- کنترل CSRF/Origin برای mutationهای مبتنی بر cookie.

## cookie و secret

cookie در production باید `HttpOnly`, `Secure` و `SameSite` مناسب داشته باشد. کلید رمزگذاری credential و DATABASE_URL فقط از environment/secret manager خوانده می‌شوند و نباید commit شوند.
