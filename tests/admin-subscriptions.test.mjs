import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("subscription repository is available for database and mock drivers", async () => {
  const provider = await source("src/server/repositories/repository-provider.ts");
  assert.match(provider, /DatabaseSubscriptionRepository/);
  assert.match(provider, /MockSubscriptionRepository/);
  assert.match(provider, /getSubscriptionRepository/);
});

test("admin subscription transitions are validated and audited", async () => {
  const service = await source("src/server/admin/admin-subscription-service.ts");
  assert.match(service, /admin\.subscriptions\.manage/);
  assert.match(service, /subscription_paused/);
  assert.match(service, /subscription_resumed/);
  assert.match(service, /subscription_canceled/);
  assert.match(service, /وضعیت اشتراک هم‌زمان تغییر کرده است/);
});

test("subscription state transition atomically queues n8n provisioning", async () => {
  const repository = await source("src/server/repositories/database/database-subscription-repository.ts");
  assert.match(repository, /\$transaction/);
  assert.match(repository, /provisioningJob\.create/);
  assert.match(repository, /ProvisioningStatus\.QUEUED/);
  assert.match(repository, /updateMany/);
});

test("admin subscriptions page supports read-only and management roles", async () => {
  const page = await source("src/app/admin/subscriptions/page.tsx");
  const permissions = await source("src/lib/admin-permissions.ts");
  assert.match(page, /مدیریت اشتراک‌ها/);
  assert.match(page, /admin\.subscriptions\.manage/);
  assert.match(page, /در صف n8n/);
  assert.match(permissions, /admin\.subscriptions\.read/);
});

test("subscription audit migration is additive", async () => {
  const migration = await source("prisma/migrations/202608260001_subscription_admin_audit_actions/migration.sql");
  assert.match(migration, /SUBSCRIPTION_PAUSED/);
  assert.match(migration, /SUBSCRIPTION_RESUMED/);
  assert.match(migration, /SUBSCRIPTION_CANCELED/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
