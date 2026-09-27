import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("order management cannot manufacture successful payments", async () => {
  const service = await source("src/server/admin/admin-commerce-service.ts");
  const repository = await source("src/server/repositories/database/database-commerce-repository.ts");
  assert.match(service, /admin\.orders\.manage/);
  assert.match(service, /payment\.status === "succeeded"/);
  assert.match(repository, /payments: \{ none: \{ status: PaymentStatus\.SUCCEEDED \} \}/);
  assert.doesNotMatch(service, /PaymentStatus\.SUCCEEDED/);
  assert.doesNotMatch(service, /payment\.create/);
});

test("order notes and unpaid transitions are audited", async () => {
  const service = await source("src/server/admin/admin-commerce-service.ts");
  assert.match(service, /order_note_updated/);
  assert.match(service, /order_canceled/);
  assert.match(service, /order_expired/);
  assert.match(service, /حداکثر ۲۰۰۰ کاراکتر/);
});

test("order details UI exposes notes and safe unpaid actions", async () => {
  const page = await source("src/app/admin/orders/[orderId]/page.tsx");
  assert.match(page, /یادداشت داخلی/);
  assert.match(page, /لغو سفارش/);
  assert.match(page, /منقضی‌کردن/);
  assert.match(page, /هیچ پرداختی را موفق اعلام نمی‌کند/);
});

test("order operations permission and migration are additive", async () => {
  const permissions = await source("src/lib/admin-permissions.ts");
  const migration = await source("prisma/migrations/202608260007_admin_order_operations/migration.sql");
  const finance = permissions.match(/finance: new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  assert.doesNotMatch(finance, /admin\.orders\.manage/);
  assert.match(migration, /admin\.orders\.manage/);
  assert.match(migration, /ON CONFLICT DO NOTHING/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
