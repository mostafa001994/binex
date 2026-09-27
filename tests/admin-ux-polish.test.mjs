import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("admin shell includes system navigation and mobile nav", async () => {
  const shell = await source(
    "src/components/admin/admin-shell.tsx",
  );

  assert.match(shell, /\/admin\/system/);
  assert.match(shell, /lg:hidden/);
  assert.match(shell, /overflow-x-auto/);
});

test("admin pages use shared page header and filter patterns", async () => {
  const users = await source(
    "src/app/admin/users/page.tsx",
  );
  const businesses = await source(
    "src/app/admin/businesses/page.tsx",
  );
  const audit = await source(
    "src/app/admin/audit/page.tsx",
  );

  assert.match(users, /AdminPageHeader/);
  assert.match(users, /AdminFilterBar/);
  assert.match(businesses, /AdminPagination/);
  assert.match(audit, /AdminEmptyState/);
});

test("users and businesses have mobile card views", async () => {
  const users = await source(
    "src/app/admin/users/page.tsx",
  );
  const businesses = await source(
    "src/app/admin/businesses/page.tsx",
  );

  assert.match(users, /md:hidden/);
  assert.match(businesses, /md:hidden/);
});

test("audit has responsive card fallback", async () => {
  const audit = await source(
    "src/app/admin/audit/page.tsx",
  );

  assert.match(audit, /lg:hidden/);
  assert.match(audit, /AuditField/);
});

test("admin dashboard exposes quick operational links", async () => {
  const dashboard = await source(
    "src/app/admin/page.tsx",
  );

  assert.match(dashboard, /دسترسی سریع/);
  assert.match(dashboard, /\/admin\/users/);
  assert.match(dashboard, /\/admin\/businesses/);
  assert.match(dashboard, /\/admin\/audit/);
  assert.match(dashboard, /\/admin\/system/);
});
