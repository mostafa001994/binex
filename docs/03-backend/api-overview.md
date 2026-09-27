# نمای کلی API

## قرارداد پاسخ

پاسخ موفق:

```json
{ "success": true, "data": {} }
```

پاسخ خطا باید `success: false`، کد پایدار، پیام امن و `requestId` قابل پیگیری داشته باشد. stack trace، SQL، credential یا جزئیات provider نباید به client برسد.

## گروه endpointها

| گروه | نمونه مسیرها | دسترسی |
|---|---|---|
| عمومی | `/api/leads`, `/api/v1/health`, `/api/v1/meta`, `/api/v1/catalog` | عمومی با rate limit مناسب |
| احراز هویت | `/api/v1/auth/request-otp`, `verify-otp`, `logout`, `me` | عمومی/session |
| پنل کاربر | `/api/v1/app/*` | session و عضویت business |
| مدیریت | `/api/v1/admin/*` | session و permission صریح |

## منابع پنل کاربر

- dashboard و business جاری
- سرویس‌ها و credential فروشنده هوشمند
- اشتراک‌ها، سفارش‌ها و صورتحساب
- اعلان‌ها
- تیکت و پیام پشتیبانی
- تنظیمات حساب/کسب‌وکار در محدوده مجاز

## منابع پنل مدیریت

- کاربران، نقش‌ها و مجوزها
- کسب‌وکارها و اعضا
- کاتالوگ سرویس و تخصیص
- پلن‌ها، اشتراک‌ها، سفارش‌ها و پرداخت‌ها
- connectorها و provisioning jobها
- تیکت‌ها، اعلان‌ها و سرنخ‌های مشاوره
- Audit Log و وضعیت سیستم

## استاندارد Route Handler

1. parse و validation ورودی؛
2. احراز session؛
3. بررسی permission و tenant؛
4. فراخوانی service دامنه؛
5. audit برای mutation حساس؛
6. projection خروجی؛
7. پاسخ استاندارد همراه request ID.

## pagination و فیلتر

لیست‌های مدیریتی باید pagination محدود، sort پایدار و filterهای allowlist داشته باشند. مقدار search نباید مستقیماً به SQL یا log حساس منتقل شود.

## سازگاری

API نسخه‌دار `/api/v1` است. حذف field یا تغییر معنی وضعیت breaking change محسوب می‌شود؛ ابتدا مصرف‌کننده‌های UI و n8n شناسایی و migration contract طراحی شود.

