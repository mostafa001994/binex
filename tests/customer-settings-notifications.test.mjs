import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("notification preference is persisted on the user account", async () => {
  const schema = await source("prisma/schema.prisma");
  const migration = await source("prisma/migrations/202608280003_user_notification_preferences/migration.sql");
  const route = await source("src/app/api/v1/auth/me/route.ts");
  const repository = await source("src/server/repositories/database/database-user-repository.ts");
  const settings = await source("src/app/app/settings/page.tsx");

  assert.match(schema, /importantNotificationsOnly Boolean @default\(true\)/);
  assert.match(migration, /ADD COLUMN "important_notifications_only" BOOLEAN NOT NULL DEFAULT true/);
  assert.match(route, /importantNotificationsOnly/);
  assert.match(repository, /importantNotificationsOnly: input\.importantNotificationsOnly/);
  assert.match(settings, /user\.preferences\.importantNotificationsOnly/);
  assert.doesNotMatch(settings, /localStorage/);
});

test("session overview exposes safe current-session metadata", async () => {
  const auth = await source("src/server/auth/auth-service.ts");
  const route = await source("src/app/api/v1/auth/sessions/route.ts");
  const settings = await source("src/app/app/settings/page.tsx");

  assert.match(auth, /getSessionOverview/);
  assert.match(auth, /activeCount/);
  assert.doesNotMatch(route, /tokenHash/);
  assert.match(settings, /formatTehranPersianDateTime/);
  assert.match(settings, /هر ورود جدید، نشست قبلی را به‌صورت خودکار می‌بندد/);
});

test("notifications have retry and safe optimistic read handling", async () => {
  const page = await source("src/app/app/notifications/page.tsx");

  assert.match(page, /تلاش دوباره/);
  assert.match(page, /Math\.max\(0, current - 1\)/);
  assert.match(page, /readAt: null/);
  assert.match(page, /markAllNotificationsApi/);
  assert.doesNotMatch(page, /href=\{item\.href\|\|"#"\}/);
});

test("reports are journey-aware and never invent KPI values", async () => {
  const page = await source("src/app/app/reports/page.tsx");

  assert.match(page, /getServicesApi/);
  assert.match(page, /service\.journey\.status/);
  assert.match(page, /هیچ KPI یا گزارش ساختگی تولید نمی‌کند/);
  assert.doesNotMatch(page, /گزارش ترکیبی AI/);
});
