# Binix V5.22 — Product Needs, Bug Audit, Stabilization

## 1) نیازسنجی پنل کاربر

### نیازهای ضروری قبل از توسعه سرویس‌های واقعی
1. هویت کاربر باید در کل پنل از session واقعی بیاید.
2. خروج از حساب باید session سرور را revoke کند.
3. اطلاعات پروفایل و Business نباید فقط localStorage باشند.
4. دسترسی به Workspace هر سرویس باید به وضعیت همان Business وابسته باشد.
5. گزارش‌ها و Billing باید وضعیت سرویس را از Business/API بگیرند، نه demo constants.
6. Error state و Retry برای bootstrap پنل ضروری است.
7. سرویس‌های `setup` باید قابل ورود باشند، `paused/not-enabled/coming-soon` نباید Workspace عملیاتی نشان دهند.
8. شماره موبایل باید readonly و منبع هویت ورود باقی بماند.
9. اعلان‌ها، Billing واقعی و Activity هنوز Backend ندارند و فعلاً باید صادقانه Empty State باشند.

### بعد از این فاز
- Session management چند دستگاه
- تغییر شماره موبایل با OTP
- مدیریت اعضای Business
- دعوت عضو
- Notification preferences سمت سرور
- Billing/Subscription domain واقعی

---

## 2) نیازسنجی پنل ادمین

### ضروری
1. مشاهده User و Business با هویت قابل فهم، نه فقط UUID.
2. مشاهده اعضای Business همراه شماره موبایل.
3. تغییر وضعیت سرویس با ثبت Audit.
4. عملیات اثرگذار مثل Pause نیاز به Confirmation دارد.
5. Admin API باید مستقل از UI role را بررسی کند.
6. Loading/Error/Empty state برای تمام جداول.
7. Search + pagination + filter قبل از دیتابیس واقعی باید در قرارداد API تثبیت شود.
8. Business suspension، Role management و Service assignment هنوز کامل نیستند.

### نقش‌ها
- `super-admin`: مدیریت دسترسی‌های سطح بالا و adminها
- `admin`: عملیات روزمره Business/Service
- `user`: بدون دسترسی Admin

### قبل از Production
- Pagination واقعی Server-side
- Audit شامل before/after
- CSRF strategy برای mutationهای حساس
- Rate limit
- Session revocation
- Admin role mutation فقط توسط super-admin
- Business suspend/resume
- Service assignment/remove

---

## 3) باگ‌های پیدا شده و اصلاح‌شده

### Critical
- خروج از حساب فقط Link به `/login` بود؛ Cookie باقی می‌ماند و Middleware کاربر را دوباره `/app` می‌فرستاد.
  - FIX: `logoutApi()` + revoke session + redirect.

- Dashboard در اولین ورود می‌توانست `getCurrentBusinessContext()` را همزمان دو بار صدا بزند و دو Business seed کند.
  - FIX: Business context یک بار ساخته و برای Service aggregation reuse می‌شود.

- Workspace سرویس بدون توجه به `paused/not-enabled` قابل مشاهده بود.
  - FIX: ServiceWorkspace به BusinessContext متصل شد و access state را enforce می‌کند.

### High
- Settings نام کاربر/Business را فقط در localStorage ذخیره می‌کرد.
  - FIX: PATCH `/api/v1/auth/me` و PATCH `/api/v1/business`.

- `Reports` و `Billing` هنوز از `accountPreview` قدیمی استفاده می‌کردند.
  - FIX: هر دو از BusinessContext استفاده می‌کنند.

- BI بین Backend (`bi`) و Frontend (`bi-modules`) شناسه متفاوت داشت و Backend marketing URL اشتباه `/services/bi` می‌داد.
  - FIX: شناسه canonical = `bi`، URL marketing = `/services/bi-modules`.

- تولید OTP واقعی با `Math.random()` بود.
  - FIX: `crypto.randomInt()`.

- Validation در route داینامیک سرویس قبل از `withApiHandler` اجرا می‌شد و error contract می‌توانست شکسته شود.
  - FIX: validation داخل wrapper.

### Medium
- BusinessGate در خطا برای همیشه Loading می‌ماند.
  - FIX: Error state + Retry.

- UserMenu هنوز «کاربر Binix / حساب نمایشی» ثابت نشان می‌داد.
  - FIX: نام/شماره/role واقعی session.

- Admin Business Detail اعضا را فقط با userId نشان می‌داد.
  - FIX: user phone/name در response غنی شد.

- Pause سرویس confirmation نداشت.
  - FIX: Modal تأیید.

---

## 4) مواردی که عمداً هنوز Mock هستند

- Database storage
- SMS provider
- Billing transactions
- Notifications backend
- Service-specific operational data
- Excel analysis engine
- Sales Agent conversations/orders
- Booking calendar/reservations
- BI

این موارد Bug نیستند؛ هنوز وارد Phase اجرایی مربوط به خودشان نشده‌ایم.

---

## 5) تست‌ها

بدون dependency جدید از `node:test` استفاده شده:

```bash
npm test
```

تست‌های Regression:
- Auth/logout
- Secure OTP generator
- PATCH profile
- BI service ID contract
- جلوگیری از duplicate Business bootstrap
- Service access states
- حذف accountPreview از Reports/Billing
- BusinessGate retry state
- API error wrapper
- Settings backend integration

همچنین:

```bash
npm run typecheck
npm run lint
npm run build
```

برای typecheck/lint/build باید dependencyهای پروژه نصب باشند.
