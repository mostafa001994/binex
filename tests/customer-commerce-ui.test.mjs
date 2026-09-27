import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("billing renders real paginated customer orders", async () => {
  const billing = await source("src/app/app/billing/page.tsx");
  const section = await source("src/components/app/customer-orders-section.tsx");
  const client = await source("src/lib/api-client/commerce.ts");

  assert.match(billing, /CustomerOrdersSection/);
  assert.match(section, /getCustomerOrdersApi/);
  assert.match(section, /Pagination/);
  assert.match(client, /\/api\/v1\/orders/);
});

test("order cards display verified records without payment mutations", async () => {
  const section = await source("src/components/app/customer-orders-section.tsx");

  assert.match(section, /order\.receiptAvailable/);
  assert.match(section, /رسید پس از تأیید مالی صادر می‌شود/);
  assert.match(section, /آخرین وضعیت پرداخت/);
  assert.doesNotMatch(section, /پرداخت آزمایشی|تراکنش آزمایشی/);
  assert.doesNotMatch(section, /method:\s*"(?:POST|PATCH|DELETE)"/);
});

test("customer receipt is owner protected and checks receipt availability", async () => {
  const receipt = await source("src/app/app/billing/orders/[orderId]/receipt/page.tsx");

  assert.match(receipt, /membership\.role === "owner"/);
  assert.match(receipt, /!order\.receiptAvailable/);
  assert.match(receipt, /getCustomerOrderApi/);
  assert.match(receipt, /window\.print/);
  assert.match(receipt, /جایگزین صورتحساب رسمی مالیاتی نیست/);
});

test("customer receipt uses safe provider reference and real business context", async () => {
  const receipt = await source("src/app/app/billing/orders/[orderId]/receipt/page.tsx");

  assert.match(receipt, /payment\?\.reference/);
  assert.match(receipt, /business\.name/);
  assert.doesNotMatch(receipt, /providerPaymentId|failureMessage|internalNote/);
});
