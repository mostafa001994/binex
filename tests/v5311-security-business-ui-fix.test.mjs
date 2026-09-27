import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("dashboard service enforces active business once", async () => {
  const route = await source(
    "src/app/api/v1/dashboard/route.ts",
  );
  const service = await source(
    "src/server/dashboard/dashboard-service.ts",
  );

  assert.match(
    service,
    /requireBusinessActive/,
  );
  assert.match(
    service,
    /getCurrentBusinessContext/,
  );
  assert.doesNotMatch(route, /requireBusinessActive|getCurrentBusinessContext/);
});

test("admin business member icons come from lucide not react", async () => {
  const page = await source(
    "src/app/admin/businesses/[businessId]/page.tsx",
  );

  assert.match(
    page,
    /from "lucide-react"/,
  );
  assert.doesNotMatch(
    page,
    /import\s*\{[\s\S]*UserPlus[\s\S]*\}\s*from "react"/,
  );
});

test("admin business page declares member state and API imports", async () => {
  const page = await source(
    "src/app/admin/businesses/[businessId]/page.tsx",
  );

  assert.match(
    page,
    /newMemberUserId/,
  );
  assert.match(
    page,
    /memberBusy/,
  );
  assert.match(
    page,
    /addAdminBusinessMemberApi/,
  );
  assert.match(
    page,
    /removeAdminBusinessMemberApi/,
  );
  assert.match(
    page,
    /transferAdminBusinessOwnershipApi/,
  );
});

test("admin business page renders member management controls", async () => {
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
