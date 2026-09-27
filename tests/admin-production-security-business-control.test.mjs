import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("suspended businesses are blocked server-side", async () => {
  const guard = await source(
    "src/server/business/business-access.ts",
  );
  const servicesService = await source(
    "src/server/services/services-service.ts",
  );
  const dashboardService = await source(
    "src/server/dashboard/dashboard-service.ts",
  );

  assert.match(
    guard,
    /status ===\s*"suspended"/,
  );
  assert.match(
    guard,
    /ForbiddenApiError/,
  );
  assert.match(
    servicesService,
    /requireBusinessActive/,
  );
  assert.match(
    dashboardService,
    /requireBusinessActive/,
  );
});

test("last super-admin cannot be demoted", async () => {
  const admin = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(
    admin,
    /beforeRole === "super-admin"/,
  );
  assert.match(
    admin,
    /superAdminCount <= 1/,
  );
  assert.match(
    admin,
    /آخرین super-admin/,
  );
});

test("business member management and ownership transfer are audited", async () => {
  const admin = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(
    admin,
    /addAdminBusinessMember/,
  );
  assert.match(
    admin,
    /removeAdminBusinessMember/,
  );
  assert.match(
    admin,
    /transferAdminBusinessOwnership/,
  );
  assert.match(
    admin,
    /business_member_added/,
  );
  assert.match(
    admin,
    /business_member_removed/,
  );
  assert.match(
    admin,
    /business_ownership_transferred/,
  );
});

test("owner cannot be directly removed", async () => {
  const admin = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(
    admin,
    /member\.role === "owner"/,
  );
  assert.match(
    admin,
    /ابتدا مالکیت را منتقل کنید/,
  );
});

test("admin business detail exposes member controls", async () => {
  const page = await source(
    "src/app/admin/businesses/[businessId]/page.tsx",
  );

  assert.match(
    page,
    /مدیریت اعضا/,
  );
  assert.match(
    page,
    /انتقال مالکیت/,
  );
  assert.match(
    page,
    /حذف عضو/,
  );
});
