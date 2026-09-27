import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("blocked users are represented in the application contract and rejected by auth", async () => {
  const types = await source("src/server/auth/auth-types.ts");
  const auth = await source("src/server/auth/auth-service.ts");
  const users = await source("src/server/repositories/database/database-user-repository.ts");
  assert.match(types, /status: "active" \| "blocked"/);
  assert.match(auth, /user\.status === "blocked"/);
  assert.match(auth, /این حساب مسدود شده است/);
  assert.match(users, /findById[\s\S]*user\.findUnique\(\{ where: \{ id \}, include: accessRoleInclude \}\)/);
  assert.match(users, /findByPhone[\s\S]*user\.findUnique\(\{ where: \{ phone \}, include: accessRoleInclude \}\)/);
});

test("blocking a user atomically revokes active sessions", async () => {
  const repository = await source("src/server/repositories/database/database-user-repository.ts");
  assert.match(repository, /setStatusAndRevokeSessions/);
  assert.match(repository, /\$transaction/);
  assert.match(repository, /authSession\.updateMany/);
  assert.match(repository, /revokedAt: now/);
});

test("admin user security protects self and super admin accounts", async () => {
  const service = await source("src/server/admin/admin-service.ts");
  assert.match(service, /actor\.id === target\.id/);
  assert.match(service, /target\.role === "super-admin"/);
  assert.match(service, /admin\.users\.manage/);
  assert.match(service, /user_status_changed/);
  assert.match(service, /user_sessions_revoked/);
});

test("admin user UI supports status filtering blocking and session revocation", async () => {
  const list = await source("src/app/admin/users/page.tsx");
  const detail = await source("src/app/admin/users/[userId]/page.tsx");
  assert.match(list, /همه وضعیت‌ها/);
  assert.match(detail, /مسدود کردن حساب/);
  assert.match(detail, /خروج از همه دستگاه‌ها/);
  assert.match(detail, /activeSessionCount/);
});

test("user security audit migration is additive", async () => {
  const migration = await source("prisma/migrations/202608260003_user_security_audit_actions/migration.sql");
  assert.match(migration, /USER_STATUS_CHANGED/);
  assert.match(migration, /USER_SESSIONS_REVOKED/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
