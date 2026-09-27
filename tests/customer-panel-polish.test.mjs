import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("desktop navigation contains each secondary destination once", async () => {
  const navigation = await source("src/constants/app-navigation.ts");
  const secondary = navigation.match(/appSecondaryNavigation[^]*?\];/)?.[0] ?? "";

  assert.equal((secondary.match(/\/app\/support/g) ?? []).length, 1);
  assert.equal((secondary.match(/\/app\/billing/g) ?? []).length, 1);
  assert.equal((secondary.match(/\/app\/settings/g) ?? []).length, 1);
});

test("mobile navigation exposes billing support and settings", async () => {
  const navigation = await source("src/constants/app-navigation.ts");
  const mobile = await source("src/components/shell/mobile-nav.tsx");

  assert.match(navigation, /mobileNavigation[^]*\/app\/billing/);
  assert.match(navigation, /mobileNavigation[^]*\/app\/support/);
  assert.match(navigation, /mobileNavigation[^]*\/app\/settings/);
  assert.match(mobile, /grid-cols-6/);
});

test("customer support has validation retry and accessible ticket states", async () => {
  const support = await source("src/components/support/support-center.tsx");

  assert.match(support, /تلاش دوباره/);
  assert.match(support, /cleanSubject\.length < 3/);
  assert.match(support, /cleanMessage\.length < 10/);
  assert.match(support, /aria-pressed/);
  assert.match(support, /aria-label="پیام‌های تیکت"/);
  assert.match(support, /formatTehranPersianDateTime/);
});

test("generic service workspace uses customer-facing Persian terminology", async () => {
  const page = await source("src/app/app/services/[serviceId]/page.tsx");

  assert.doesNotMatch(page, /Workspace سرویس|Catalog نمایش|KPI غیرواقعی/);
  assert.match(page, /فضای مدیریت سرویس/);
});
