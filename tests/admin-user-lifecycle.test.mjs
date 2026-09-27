import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("admin user lifecycle validates identity uniqueness and permissions", async () => {
  const service = await source("src/server/admin/admin-user-lifecycle-service.ts");
  assert.match(service, /admin\.users\.manage/);
  assert.match(service, /PHONE_PATTERN/);
  assert.match(service, /EMAIL_PATTERN/);
  assert.match(service, /ConflictApiError/);
  assert.match(service, /requireSuperAdmin/);
  assert.match(service, /user_created/);
  assert.match(service, /user_profile_updated/);
});

test("admin users UI creates edits and filters by database role", async () => {
  const list = await source("src/app/admin/users/page.tsx");
  const detail = await source("src/app/admin/users/[userId]/page.tsx");
  assert.match(list, /کاربر جدید/);
  assert.match(list, /createAdminUserApi/);
  assert.match(list, /getAdminRoleOptionsApi/);
  assert.match(detail, /ویرایش اطلاعات/);
  assert.match(detail, /updateAdminUserIdentityApi/);
  assert.match(detail, /data\.canManageIdentity/);
  assert.doesNotMatch(detail, /data\.canManageSecurity \? <Button variant="secondary" leadingIcon=\{<Pencil/);
});

test("identity editing is separate from destructive account security", async () => {
  const service = await source("src/server/admin/admin-service.ts");
  const lifecycle = await source("src/server/admin/admin-user-lifecycle-service.ts");
  assert.match(service, /canManageIdentity: canManageUserIdentity/);
  assert.match(service, /actor\.role === "super-admin"/);
  assert.match(lifecycle, /canManageUserIdentity/);
});

test("user lifecycle audit migration is additive", async () => {
  const migration = await source("prisma/migrations/202608260005_admin_user_lifecycle/migration.sql");
  assert.match(migration, /USER_CREATED/);
  assert.match(migration, /USER_PROFILE_UPDATED/);
  assert.doesNotMatch(migration, /DROP|DELETE|TRUNCATE/i);
});
