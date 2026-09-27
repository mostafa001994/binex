import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("customer billing reads real subscription API data", async () => {
  const page = await source("src/app/app/billing/page.tsx");
  const client = await source("src/lib/api-client/subscriptions.ts");

  assert.match(page, /getCustomerSubscriptionsApi/);
  assert.match(client, /\/api\/v1\/subscriptions/);
  assert.doesNotMatch(page, /accountPreview/);
  assert.doesNotMatch(page, /connectedServices/);
  assert.doesNotMatch(page, /dataMode/);
});

test("customer billing clearly handles owner member loading error and empty states", async () => {
  const page = await source("src/app/app/billing/page.tsx");

  assert.match(page, /membership\.role === "owner"/);
  assert.match(page, /اطلاعات مالی فقط برای مالک قابل مشاهده است/);
  assert.match(page, /BillingSkeleton/);
  assert.match(page, /BillingError/);
  assert.match(page, /هنوز اشتراک فعالی ندارید/);
  assert.match(page, /تلاش دوباره/);
});

test("customer billing displays lifecycle guidance without enabling mutations", async () => {
  const page = await source("src/app/app/billing/page.tsx");

  assert.match(page, /setup-required/);
  assert.match(page, /payment-required/);
  assert.match(page, /cancelAtPeriodEnd/);
  assert.match(page, /ادامه راه‌اندازی/);
  assert.doesNotMatch(page, /cancelSubscription|changePlan|renewSubscription/);
  assert.doesNotMatch(page, /method:\s*"(?:POST|PATCH|DELETE)"/);
});

test("customer billing delegates payment history to the real orders section", async () => {
  const page = await source("src/app/app/billing/page.tsx");
  const orders = await source("src/components/app/customer-orders-section.tsx");

  assert.match(page, /CustomerOrdersSection/);
  assert.match(orders, /سوابق واقعی سفارش و نتیجه ثبت‌شده درگاه/);
  assert.match(orders, /هنوز سفارش یا پرداختی ندارید/);
  assert.match(orders, /بدون تراکنش یا رسید آزمایشی/);
  assert.doesNotMatch(orders, /method:\s*"(?:POST|PATCH|DELETE)"/);
});
