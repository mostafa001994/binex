# معماری برنامه و ساختار کد

## ساختار اصلی

| مسیر | نقش |
|---|---|
| `src/app` | صفحات App Router و Route Handlerهای API |
| `src/components` | اجزای مشترک UI، پنل و مدیریت |
| `src/server` | منطق سمت سرور، دامنه، امنیت و repositoryها |
| `src/generated/prisma` | Prisma Client تولیدشده؛ ویرایش دستی ممنوع |
| `prisma/schema.prisma` | تعریف منبع مدل داده |
| `prisma/migrations` | تاریخچه تغییرات دیتابیس |
| `prisma/seed.ts` | داده‌ی پایه و super-admin اولیه |
| `tests` | تست‌های رفتاری و قراردادی |

## لایه‌ها

```text
Page / Component
      ↓
API client / Route Handler
      ↓
Domain service
      ↓
Repository interface
      ↓
DatabaseRepository یا MockRepository
      ↓
PostgreSQL یا mock storage
```

قاعده اصلی این است که component مستقیماً Prisma را صدا نزند و Route Handler نیز قواعد پیچیده کسب‌وکار را درون خود نگه ندارد.

## منابع حقیقت

- کاتالوگ عمومی سرویس‌ها: `ServiceDefinition` در دیتابیس.
- سرویس تخصیص‌یافته به کسب‌وکار: `BusinessService`.
- پلن و قیمت: `ServicePlan`؛ مبلغ به ریال ذخیره و در UI برحسب تومان نمایش داده می‌شود.
- وضعیت اشتراک: `Subscription`.
- فروش و پرداخت: `Order`، `OrderItem` و `Payment`.
- نقش و مجوز: `AccessRole` و `AccessRolePermission` به‌همراه fallbackهای امن کد.

## قواعد وابستگی

- کد UI نباید به جزئیات Prisma یا رمزگذاری secret وابسته شود.
- repository دیتابیسی و mock باید قرارداد یکسان داشته باشند.
- تغییر وضعیت‌های مالی و عملیاتی فقط از service دامنه انجام شود.
- responseهای عمومی نباید مدل Prisma را بدون projection بازگردانند.
- routeهای admin باید مجوز مشخص داشته باشند؛ اتکا به عنوان نقش کافی نیست.

## نقاط نیازمند پاک‌سازی

1. فایل پیکربندی تخصصی بعضی سرویس‌ها، رزرو و تحلیل اکسل را `available` نشان می‌دهد؛ کاتالوگ مرکزی آن‌ها را `coming-soon` می‌داند. کاتالوگ دیتابیس باید مرجع UX عمومی بماند.
2. metadata قدیمی سیستم هنوز در بخشی از کد، پنل ادمین را planned یا دیتابیس را disconnected توصیف می‌کند. این متن باید با وضعیت واقعی همگام شود.
3. مدل صف provisioning وجود دارد، اما worker شبکه‌ای n8n هنوز اجراکننده واقعی نیست.

## اصل توسعه‌پذیری

هر قابلیت جدید باید حداقل شامل قرارداد داده، service دامنه، repository، API، permission، audit، تست و مستند مرتبط باشد. افزودن صرف یک صفحه به معنی تکمیل قابلیت نیست.

