# Binix UI/UX — All Phases Implementation

این Patch شش Phase ممیزی UI/UX را روی پروژه فعلی اجرا می‌کند.

## Phase 1 — Bugs & Product Truth
- UploadZone: انتخاب فایل، Drag & Drop، اعتبارسنجی فرمت و حجم، نمایش فایل و پاک‌کردن.
- Excel app: جریان واقعی انتخاب فایل؛ نتیجه ساختگی تولید نمی‌شود.
- Demo account در کل App با Banner واضح مشخص است.
- متن‌های developer-facing در صفحات اصلی App به stateهای قابل فهم برای کاربر تبدیل شدند.
- OTP در محیط نمایشی فقط کد 12345 را می‌پذیرد و Demo بودن روشن است.
- Home: Navbar در DOM قبل از Hero قرار گرفت؛ محتوا تغییر نکرد.
- Onboarding: نام کسب‌وکار و هدف اصلی ذخیره می‌شوند.

## Phase 2 — UI Consistency
- App و Marketing همچنان لایه token جدا دارند.
- بخش‌هایی از AI Sales و Excel legacy به semantic token و `font-display` منتقل شدند.
- Navbar با Product Suite همگام شد.

## Phase 3 — Reusable Components
- `ServiceSetupChecklist`
- `ProductStatusBanner`
- `DemoBadge`
- `FormField`
- `AnalysisUploader`
- `ServiceWorkspace` و `ServiceModuleCard` به API عمومی‌تر منتقل شدند.

## Phase 4 — Dynamic Styling / Config
- `icon-registry.ts` منبع مشترک Icon keyهاست.
- Navigation، Workspace modules، Service icons و Feature cards با string icon key کار می‌کنند.
- خطر عبور React component/function از Server به Client کمتر شد.
- Account preview state در `account-state.ts` متمرکز شد.

## Phase 5 — UX
- Dashboard روی next action تمرکز دارد.
- Sales / Booking / Excel هرکدام Setup Checklist متناسب با محصول دارند.
- Billing از Marketplace جدا شد و روی پرداخت/صورتحساب متمرکز است.
- Reports و Notifications محتوای کاربرمحور دارند.
- Settings در نسخه نمایشی واقعاً ذخیره محلی انجام می‌دهد.
- Mobile search اضافه شد.
- Navbar محصولات Binix را مستقیم نمایش می‌دهد.

## Phase 6 — Accessibility & Polish
- Modal: Escape، focus trap، focus restore، scroll lock، mobile sheet behavior.
- Select: combobox/listbox semantics و keyboard navigation.
- Tabs: tablist/tab/tabpanel و keyboard navigation.
- User/notification menus: outside click و Escape.
- Form labels و `aria-invalid`/described-by بهتر شده‌اند.
- Pre-hydration theme script برای کاهش flash.
- prefers-reduced-motion اضافه شده.

## حذف پیشنهادی
فایل‌های `DELETE_FILES.txt` دیگر در runtime استفاده نمی‌شوند و بهتر است از پروژه حذف شوند.
