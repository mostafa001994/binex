# Binix Marketing Refactor V5.6

این مرحله بخش Marketing و Service Landingها را از نظر معماری کامل می‌کند.

## Reusable پایه

- `MarketingPageShell`
- `MarketingCard`
- `SectionHeading`
- `ServicePageShell`
- `ServiceHero`
- `ServiceFeatureGrid`
- `ServiceFeatureCard`
- `ServiceCTA`
- `ServiceTheme`
- `ServiceIcon`

## الگوی ساخت سرویس جدید

```tsx
<ServicePageShell service="service-id">
  <ServiceHero
    badge="..."
    title="..."
    highlight="..."
    description="..."
    bullets={[...]}
    visual={<YourDemo />}
  />

  <section>
    <ServiceFeatureGrid features={features} />
  </section>

  <ServiceCTA ... />
</ServicePageShell>
```

رنگ Accent، gradient و glow از `services-config.ts` می‌آیند.

## Hardcoded values که عمداً باقی می‌مانند

Hardcoded color فقط در این موارد قابل قبول است:

- mockup یک پیام‌رسان یا رابط خارجی که باید رنگ واقعی خودش را حفظ کند
- canvas/background art
- chart/demo data visualization
- semantic success/error/warning
- fixed logo artwork

## Navbar

فایل `navbar.tsx` در این Patch تغییر نکرده و Live سبز کنار لوگو دست‌نخورده است.
