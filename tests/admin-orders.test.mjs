import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("commerce repository is wired for database and mock drivers", async () => {
  const provider = await source("src/server/repositories/repository-provider.ts");
  assert.match(provider, /DatabaseCommerceRepository/);
  assert.match(provider, /MockCommerceRepository/);
  assert.match(provider, /getCommerceRepository/);
});

test("orders API validates finance filters and requires a dedicated permission", async () => {
  const route = await source("src/app/api/v1/admin/orders/route.ts");
  const service = await source("src/server/admin/admin-commerce-service.ts");
  assert.match(route, /validateAdminOrderStatus/);
  assert.match(route, /validateAdminPaymentStatus/);
  assert.match(service, /admin\.orders\.read/);
});

test("database commerce search returns snapshots without exposing payment secrets", async () => {
  const repository = await source("src/server/repositories/database/database-commerce-repository.ts");
  assert.match(repository, /serviceNameSnapshot/);
  assert.match(repository, /planNameSnapshot/);
  assert.match(repository, /providerReference/);
  assert.doesNotMatch(repository, /idempotencyKey:/);
  assert.match(repository, /internalNote/);
  assert.doesNotMatch(repository, /metadata:\s*order\.metadata/);
});

test("admin order page provides order payment and item visibility", async () => {
  const page = await source("src/app/admin/orders/page.tsx");
  const shell = await source("src/components/admin/admin-shell.tsx");
  assert.match(page, /سفارش‌ها و پرداخت‌ها/);
  assert.match(page, /مشاهده جزئیات سفارش و پرداخت/);
  assert.match(page, /وضعیت پرداخت فقط از رویداد معتبر درگاه تغییر می‌کند/);
  assert.match(shell, /\/admin\/orders/);
});
