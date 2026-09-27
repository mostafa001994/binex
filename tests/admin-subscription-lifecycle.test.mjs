import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("manual subscription lifecycle uses active plan snapshots and open-subscription guard", async () => {
  const service = await source("src/server/admin/admin-subscription-service.ts");
  assert.match(service, /PlanStatus\.ACTIVE/);
  assert.match(service, /یک اشتراک باز وجود دارد/);
  assert.match(service, /planCodeSnapshot/);
  assert.match(service, /priceAmount: plan\.priceAmount/);
  assert.match(service, /paymentVerified: false/);
  assert.match(service, /businessService\.upsert/);
});

test("renewal and plan change are audited and enqueue provisioning without fake payment", async () => {
  const service = await source("src/server/admin/admin-subscription-service.ts");
  assert.match(service, /renewAdminSubscription/);
  assert.match(service, /changeAdminSubscriptionPlan/);
  assert.match(service, /subscription_renewed/);
  assert.match(service, /subscription_plan_changed/);
  assert.match(service, /ProvisioningAction\.UPDATE/);
  assert.doesNotMatch(service, /payment\.create/);
});

test("subscription admin UI supports create renew and plan change", async () => {
  const page = await source("src/app/admin/subscriptions/page.tsx");
  assert.match(page, /اشتراک جدید/);
  assert.match(page, /تمدید دستی/);
  assert.match(page, /تغییر پلن/);
  assert.match(page, /هیچ پرداخت یا راه‌اندازی تأیید نشده است/);
});

test("subscription lifecycle audit migration is additive", async () => {
  const migration = await source("prisma/migrations/202608260006_admin_subscription_lifecycle/migration.sql");
  assert.match(migration, /SUBSCRIPTION_CREATED/);
  assert.match(migration, /SUBSCRIPTION_RENEWED/);
  assert.match(migration, /SUBSCRIPTION_PLAN_CHANGED/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
