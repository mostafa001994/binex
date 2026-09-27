# Binix Dynamic Style Architecture

## سه لایه استایل
1. Global semantic tokens
2. Marketing semantic tokens
3. Dynamic service tokens injected by `ServiceTheme`

## مثال
```tsx
<ServiceTheme service="smart-booking">
  <ServiceFeatureCard
    icon={Calendar}
    title="مدیریت ظرفیت"
    description="..."
  />
</ServiceTheme>
```

کامپوننت فرزند رنگ آبی را نمی‌شناسد؛ فقط از `service-accent` استفاده می‌کند.

## اضافه کردن سرویس جدید
فقط یک entry به `servicesConfig` اضافه کن و `theme`، `icon` و metadata آن را تعریف کن.

## reusable components این Patch
- ServiceTheme
- ServiceIcon
- MarketingCard
- SectionHeading
- ServiceFeatureCard
- ServiceCTA

## اصل
اگر یک مقدار بصری بیش از دو بار تکرار می‌شود، باید تا حد امکان تبدیل به token، config یا variant شود.
