import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("admin user detail refresh is a stable callback", async () => {
  const page = await source(
    "src/app/admin/users/[userId]/page.tsx",
  );

  assert.match(page, /useCallback/);
  assert.match(
    page,
    /useEffect\(\(\) => \{\s*void refresh\(\);\s*\}, \[refresh\]\)/,
  );
});

test("admin business modals provide required children", async () => {
  const page = await source(
    "src/app/admin/businesses/[businessId]/page.tsx",
  );

  const modalOpenTags = [...page.matchAll(/<Modal\b/g)].length;
  const modalCloseTags = [...page.matchAll(/<\/Modal>/g)].length;

  assert.equal(modalOpenTags, modalCloseTags);
  assert.ok(modalOpenTags >= 2);
});

test("admin service has no stale authorization helper import", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.doesNotMatch(service, /requireRole/);
  assert.match(service, /ForbiddenApiError/);
  assert.match(service, /requireAdminPermission/);
});
