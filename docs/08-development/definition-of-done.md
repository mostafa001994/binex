# Definition of Done

یک تغییر زمانی Done است که موارد مرتبط زیر انجام شده باشند:

- هدف محصول و acceptance criteria روشن است.
- UI شامل loading، empty، error، success و responsive است.
- validation هم در client و هم در server انجام می‌شود.
- auth، permission و tenant isolation بررسی شده‌اند.
- داده واقعی persist می‌شود و mock ناخواسته باقی نمانده است.
- mutation حساس Audit Log دارد.
- عملیات خطرناک confirmation و توضیح اثر دارد.
- migration بازبینی و rollback/backup متناسب دارد.
- typecheck، lint، tests و build سبز هستند.
- تست دستی مسیر اصلی و keyboard انجام شده است.
- secret یا PII در log و خروجی نیست.
- مستند محصول/API/عملیات و Changelog به‌روز شده‌اند.
- برای اتصال بیرونی timeout، retry، idempotency، health و runbook وجود دارد.

«صفحه باز می‌شود» یا «دکمه کار می‌کند» به‌تنهایی معیار تکمیل قابلیت نیست.

