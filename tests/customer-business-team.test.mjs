import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("customer team mutations are owner-only and business-scoped", async () => {
  const service = await source("src/server/business/business-service.ts");

  assert.match(service, /requireBusinessOwner\(context\.membership\.role\)/);
  assert.match(service, /listByBusinessId\(context\.business\.id\)/);
  assert.match(service, /members\.find\(\(item\) => item\.id === memberId\)/);
  assert.match(service, /member\.role === "owner" \|\| member\.userId === actor\.id/);
  assert.match(service, /findPrimaryByUserId\(targetUser\.id\)/);
  assert.match(service, /targetUser\.status !== "active"/);
});

test("customer team requires an existing Binix account and safe internal roles", async () => {
  const service = await source("src/server/business/business-service.ts");

  assert.match(service, /findByPhone\(phone\)/);
  assert.match(service, /کاربر باید ابتدا یک‌بار وارد سامانه شود/);
  assert.match(service, /value !== "admin" && value !== "member"/);
  const parser = service.match(/function parseMemberRole[^]*?\n}/)?.[0] ?? "";
  assert.doesNotMatch(parser, /"owner"/);
});

test("customer team changes are audited", async () => {
  const service = await source("src/server/business/business-service.ts");

  assert.match(service, /action: "business_member_added"/);
  assert.match(service, /action: "user_role_changed"/);
  assert.match(service, /action: "business_member_removed"/);
  assert.match(service, /businessId: context\.business\.id/);
});

test("team UI has role management and destructive confirmation", async () => {
  const component = await source("src/components/app/business-team-settings.tsx");
  const settings = await source("src/app/app/settings/page.tsx");

  assert.match(component, /addCurrentBusinessMemberApi/);
  assert.match(component, /updateCurrentBusinessMemberApi/);
  assert.match(component, /removeCurrentBusinessMemberApi/);
  assert.match(component, /ConfirmDialog/);
  assert.match(component, /فقط مالک کسب‌وکار/);
  assert.match(settings, /BusinessTeamSettings/);
});
