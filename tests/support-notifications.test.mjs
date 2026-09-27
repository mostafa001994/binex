import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("customer support queries are scoped to business and creator and hide internal notes", () => {
  const source = read("src/server/support/support-service.ts");
  assert.match(source, /businessId: context\.business\.id, createdByUserId: user\.id/);
  assert.match(source, /where: \{ isInternal: false \}/);
});

test("public admin replies notify customer while internal notes stay private", () => {
  const source = read("src/server/admin/admin-support-service.ts");
  assert.match(source, /if \(!isInternal\) await tx\.notification\.create/);
  assert.match(source, /isInternal \} \}\)/);
});

test("new customer tickets notify active support operators and admin shell shows the bell", () => {
  const service = read("src/server/support/support-service.ts");
  const shell = read("src/components/admin/admin-shell.tsx");
  assert.match(service, /permissionCode: "admin\.support\.read"/);
  assert.match(service, /tx\.notification\.createMany/);
  assert.match(service, /href: `\/admin\/support\/\$\{created\.id\}`/);
  assert.doesNotMatch(service, /id: \{ not: user\.id \}/);
  assert.match(shell, /NotificationButton viewAllHref="\/admin\/alerts"/);
});

test("support and notification migration is additive and grants explicit permissions", () => {
  const migration = read("prisma/migrations/202608260010_support_notifications/migration.sql");
  assert.match(migration, /CREATE TABLE "support_tickets"/);
  assert.match(migration, /CREATE TABLE "notifications"/);
  assert.match(migration, /admin\.support\.manage/);
  assert.doesNotMatch(migration, /DROP TABLE|TRUNCATE|DELETE FROM/);
});

test("operational alerts are derived from persisted operational records", () => {
  const source = read("src/server/admin/admin-support-service.ts");
  assert.match(source, /prisma\.payment\.count/);
  assert.match(source, /prisma\.subscription\.count/);
  assert.match(source, /prisma\.provisioningJob\.count/);
  assert.match(source, /prisma\.supportTicket\.count/);
});

test("support SLA deadlines are persisted and first public response is recorded once", () => {
  const schema = read("prisma/schema.prisma");
  const support = read("src/server/support/support-service.ts");
  const admin = read("src/server/admin/admin-support-service.ts");
  assert.match(schema, /firstResponseDueAt DateTime/);
  assert.match(schema, /resolutionDueAt DateTime/);
  assert.match(support, /supportSlaDeadlines\(\)/);
  assert.match(admin, /!before\.firstRespondedAt/);
});

test("SLA migration backfills existing tickets without destructive statements", () => {
  const migration = read("prisma/migrations/202608260011_support_sla/migration.sql");
  assert.match(migration, /UPDATE "support_tickets"/);
  assert.match(migration, /INTERVAL '4 hours'/);
  assert.match(migration, /INTERVAL '48 hours'/);
  assert.doesNotMatch(migration, /DROP TABLE|TRUNCATE|DELETE FROM/);
});
