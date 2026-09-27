import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public plans can be viewed before authentication", async () => {
  const route = await read("src/app/api/v1/catalog/plans/route.ts");
  assert.doesNotMatch(route, /getAuthenticatedUser|AUTH_COOKIE_NAME/);
  assert.match(route, /plan\.status === "active"/);
  assert.match(route, /plan\.isPublic/);
});

test("service pages expose their public plans before login", async () => {
  const page = await read("src/app/services/ai-sales-agent/page.tsx");
  const plans = await read("src/components/services/shared/ServicePlans.tsx");
  const booking = await read("src/app/services/smart-booking/page.tsx");
  const bi = await read("src/app/services/bi-modules/page.tsx");
  const excel = await read("src/app/services/excel-analyzer/page.tsx");
  const dynamicService = await read("src/app/services/[slug]/page.tsx");
  const template = await read("src/components/services/shared/DynamicServiceMarketingPage.tsx");
  assert.match(page, /<DynamicServiceMarketingPage slug="ai-sales-agent"/);
  assert.match(plans, /\/checkout\?service=\$\{encodeURIComponent\(serviceId\)\}&plan=/);
  assert.match(plans, /نیازی به ثبت‌نام نیست/);
  assert.match(plans, /plans\?\.length === 0/);
  assert.match(booking, /<DynamicServiceMarketingPage slug="smart-booking"/);
  assert.match(bi, /<DynamicServiceMarketingPage slug="bi-modules"/);
  assert.match(excel, /<DynamicServiceMarketingPage slug="excel-analyzer"/);
  assert.match(dynamicService, /<DynamicServiceMarketingPage slug=\{slug\}/);
  assert.match(template, /<ServicePlans serviceId=\{service\.id\}/);
});

test("checkout returns to the selected service plans", async () => {
  const checkout = await read("src/app/checkout/page.tsx");
  assert.match(checkout, /getPublicServicesApi/);
  assert.match(checkout, /service\?\.marketingHref/);
  assert.match(checkout, /اشتراک \{serviceName\}/);
});

test("auth keeps a safe checkout return path through otp", async () => {
  const login = await read("src/app/(auth)/login/page.tsx");
  const otp = await read("src/app/(auth)/otp/page.tsx");
  const helper = await read("src/lib/auth-return.ts");
  assert.match(login, /params\.set\("next", returnPath\)/);
  assert.match(otp, /router\.push\(returnPath \?\?/);
  assert.match(helper, /value\.startsWith\("\/\/"\)/);
});

test("checkout validates public plan and business ownership", async () => {
  const checkout = await read("src/server/payments/payment-checkout-service.ts");
  const gateways = await read("src/app/api/v1/payment-gateways/route.ts");
  assert.match(checkout, /context\.membership\.role !== "owner"/);
  assert.match(checkout, /plan\.status !== PlanStatus\.ACTIVE/);
  assert.match(checkout, /!plan\.isPublic/);
  assert.doesNotMatch(gateways, /\.\.\.gateways/);
});
