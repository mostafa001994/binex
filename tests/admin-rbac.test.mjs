import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("database RBAC persists roles permissions and user assignments", async () => {
  const schema = await source("prisma/schema.prisma");
  const migration = await source("prisma/migrations/202608260004_database_rbac/migration.sql");
  assert.match(schema, /model AccessRole/);
  assert.match(schema, /model AccessRolePermission/);
  assert.match(schema, /accessRoleId/);
  assert.match(migration, /UPDATE "users"[\s\S]*"access_role_id"/);
  assert.match(migration, /ON DELETE RESTRICT/);
});

test("role management protects super admin and role-management permission", async () => {
  const service = await source("src/server/admin/admin-role-service.ts");
  assert.match(service, /existing\.isProtected/);
  assert.match(service, /admin\.roles\.manage/);
  assert.match(service, /آخرین مدیر ارشد/);
  assert.match(service, /requireSuperAdmin/);
});

test("role UI supports create edit and permission selection", async () => {
  const page = await source("src/app/admin/roles/page.tsx");
  const shell = await source("src/components/admin/admin-shell.tsx");
  assert.match(page, /نقش جدید/);
  assert.match(page, /مجوزها/);
  assert.match(page, /updateAdminAccessRoleApi/);
  assert.match(shell, /\/admin\/roles/);
});
