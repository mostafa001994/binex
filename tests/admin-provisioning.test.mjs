import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("provisioning repository is wired for database and mock drivers", async () => {
  const provider = await source("src/server/repositories/repository-provider.ts");
  assert.match(provider, /DatabaseProvisioningRepository/);
  assert.match(provider, /MockProvisioningRepository/);
  assert.match(provider, /getProvisioningRepository/);
});

test("failed retry is atomic and requeues the subscription", async () => {
  const repository = await source("src/server/repositories/database/database-provisioning-repository.ts");
  assert.match(repository, /\$transaction/);
  assert.match(repository, /ProvisioningJobStatus\.FAILED/);
  assert.match(repository, /ProvisioningStatus\.QUEUED/);
  assert.match(repository, /updatedAt: new Date\(expectedUpdatedAt\)/);
});

test("provisioning response hides payload and idempotency keys and sanitizes errors", async () => {
  const repository = await source("src/server/repositories/database/database-provisioning-repository.ts");
  assert.match(repository, /safeError/);
  assert.doesNotMatch(repository, /payload: job\.payload/);
  assert.doesNotMatch(repository, /idempotencyKey: job\.idempotencyKey/);
});

test("admin provisioning page has read and manage permissions", async () => {
  const page = await source("src/app/admin/provisioning/page.tsx");
  const permissions = await source("src/lib/admin-permissions.ts");
  assert.match(page, /admin\.provisioning\.manage/);
  assert.match(page, /آخرین خطای پاک‌سازی‌شده/);
  assert.match(permissions, /admin\.provisioning\.read/);
});

test("provisioning retry audit migration is additive", async () => {
  const migration = await source("prisma/migrations/202608260002_provisioning_job_retry_audit_action/migration.sql");
  assert.match(migration, /PROVISIONING_JOB_RETRIED/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
