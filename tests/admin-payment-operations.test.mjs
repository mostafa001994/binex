import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("payment ledger is read-only and requires order read permission", async () => {
  const route = await source("src/app/api/v1/admin/payments/route.ts");
  const service = await source("src/server/admin/admin-payment-service.ts");
  assert.match(route, /export const GET/);
  assert.doesNotMatch(route, /export const (POST|PATCH|DELETE)/);
  assert.match(service, /admin\.orders\.read/);
  assert.doesNotMatch(service, /payment\.(update|create|delete)/);
});

test("payment reconciliation checks status and amount mismatches", async () => {
  const service = await source("src/server/admin/admin-payment-service.ts");
  assert.match(service, /payment\.amount !== payment\.order\.totalAmount/);
  assert.match(service, /needs-review/);
  assert.match(service, /NOT EXISTS/);
});

test("receipt is available only after verified financial reconciliation", async () => {
  const receipt = await source("src/app/admin/orders/[orderId]/receipt/page.tsx");
  assert.match(receipt, /payment\.amount === order\.totalAmount/);
  assert.match(receipt, /رسید قابل صدور نیست/);
  assert.match(receipt, /جایگزین صورتحساب رسمی مالیاتی نیست/);
});
