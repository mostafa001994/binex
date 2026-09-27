import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("new consultation leads notify authorized operators", () => {
  const route = read("src/app/api/leads/route.ts");
  assert.match(route, /permissionCode: "admin\.leads\.read"/);
  assert.match(route, /tx\.notification\.createMany/);
  assert.match(route, /href: `\/admin\/leads\?focus=\$\{lead\.id\}`/);
});

test("admin consultation lead endpoints enforce read and manage permissions", () => {
  const service = read("src/server/admin/admin-lead-service.ts");
  assert.match(service, /requireAdminPermission\(user, "admin\.leads\.read"\)/);
  assert.match(service, /requireAdminPermission\(user, "admin\.leads\.manage"\)/);
  assert.match(service, /consultation_lead_updated/);
  assert.match(service, /internalNote: internalNote \|\| null/);
});

test("admin consultation lead UI supports search, filters, responsive cards and follow-up", () => {
  const page = read("src/app/admin/leads/page.tsx");
  assert.match(page, /درخواست‌های مشاوره/);
  assert.match(page, /همه وضعیت‌ها/);
  assert.match(page, /md:hidden/);
  assert.match(page, /مشاهده و پیگیری/);
  assert.match(page, /یادداشت داخلی/);
  assert.match(page, /updateAdminConsultationLeadApi/);
});

test("admin consultation lead migration is additive and grants role permissions", () => {
  const migration = read("prisma/migrations/202608270002_admin_consultation_leads/migration.sql");
  assert.match(migration, /ADD COLUMN "internal_note"/);
  assert.match(migration, /CONSULTATION_LEAD_UPDATED/);
  assert.match(migration, /admin\.leads\.read/);
  assert.match(migration, /admin\.leads\.manage/);
  assert.doesNotMatch(migration, /DROP TABLE|TRUNCATE|DELETE FROM/);
});

test("new consultation leads appear in operational alerts", () => {
  const service = read("src/server/admin/admin-support-service.ts");
  assert.match(service, /prisma\.consultationLead\.count/);
  assert.match(service, /\/admin\/leads\?status=new/);
});
