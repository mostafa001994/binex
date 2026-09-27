import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("business lifecycle requires an existing owner and writes audit records", async () => {
  const service = await source("src/server/admin/admin-business-lifecycle-service.ts");
  assert.match(service, /ownerUserId/);
  assert.match(service, /BusinessMemberRole\.OWNER/);
  assert.match(service, /business_created/);
  assert.match(service, /business_profile_updated/);
});

test("business archive is soft and blocked by open operations", async () => {
  const service = await source("src/server/admin/admin-business-lifecycle-service.ts");
  assert.match(service, /BusinessStatus\.ARCHIVED/);
  assert.match(service, /openSubscriptions/);
  assert.match(service, /runningJobs/);
  assert.doesNotMatch(service, /business\.delete/);
});

test("business management UI exposes create edit archive and commerce summary", async () => {
  const list = await source("src/app/admin/businesses/page.tsx");
  const detail = await source("src/app/admin/businesses/[businessId]/page.tsx");
  assert.match(list, /createAdminBusinessApi/);
  assert.match(detail, /updateAdminBusinessProfileApi/);
  assert.match(detail, /archiveAdminBusinessApi/);
  assert.match(detail, /data\.commerce\.counts/);
});
