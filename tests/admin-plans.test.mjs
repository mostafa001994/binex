import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("admin plans use repository abstraction with database and mock drivers", async () => {
  const provider = await source("src/server/repositories/repository-provider.ts");
  assert.match(provider, /DatabaseServicePlanRepository/);
  assert.match(provider, /MockServicePlanRepository/);
  assert.match(provider, /getServicePlanRepository/);
});

test("plan service validates integer IRR prices and custom periods", async () => {
  const service = await source("src/server/admin/admin-plan-service.ts");
  assert.match(service, /مبلغ پلن باید عدد صحیح و برحسب ریال باشد/);
  assert.match(service, /customDurationDays/);
  assert.match(service, /admin\.plans\.manage/);
  assert.match(service, /service_plan_created/);
  assert.match(service, /service_plan_updated/);
  assert.match(service, /service_plan_archived/);
});

test("admin plans page displays toman but sends IRR", async () => {
  const page = await source("src/app/admin/plans/page.tsx");
  assert.match(page, /BigInt\(normalized\) \* 10n/);
  assert.match(page, /قیمت \(تومان\)/);
  assert.match(page, /ریال در دیتابیس/);
  assert.match(page, /formatTomanInput/);
  assert.match(page, /پلن‌ها و قیمت‌گذاری/);
  assert.match(page, /hasAdminPermission\(user\.permissions, "admin\.plans\.manage"\)/);
});

test("plan modal keeps actions visible and breadcrumb is localized", async () => {
  const modal = await source("src/components/ui/modal.tsx");
  const breadcrumbs = await source("src/components/admin/admin-breadcrumbs.tsx");

  assert.match(modal, /sticky bottom-0/);
  assert.match(modal, /sm:max-w-\[900px\]/);
  assert.match(breadcrumbs, /plans: "پلن‌ها و قیمت‌گذاری"/);
});

test("finance can read plans without managing them", async () => {
  const permissions = await source("src/lib/admin-permissions.ts");
  const finance = permissions.match(/finance: new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  assert.match(finance, /admin\.plans\.read/);
  assert.match(finance, /admin\.catalog\.read/);
  assert.doesNotMatch(finance, /admin\.plans\.manage/);
});

test("service plan audit enum migration is additive", async () => {
  const migration = await source("prisma/migrations/202608250006_service_plan_audit_actions/migration.sql");
  assert.match(migration, /SERVICE_PLAN_CREATED/);
  assert.match(migration, /SERVICE_PLAN_UPDATED/);
  assert.match(migration, /SERVICE_PLAN_ARCHIVED/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
