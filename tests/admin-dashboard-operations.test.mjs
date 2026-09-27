import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) { return readFile(new URL(`../${path}`, import.meta.url), "utf8"); }

test("admin dashboard uses a driver-specific aggregate repository", async () => {
  const provider = await source("src/server/repositories/repository-provider.ts");
  const service = await source("src/server/admin/admin-service.ts");
  assert.match(provider, /DatabaseAdminDashboardRepository/);
  assert.match(provider, /MockAdminDashboardRepository/);
  assert.match(service, /getAdminDashboardRepository\(\)\.getSnapshot\(\)/);
  assert.doesNotMatch(service, /serviceGroups/);
});

test("database dashboard aggregates financial subscription and n8n health", async () => {
  const repository = await source("src/server/repositories/database/database-admin-dashboard-repository.ts");
  assert.match(repository, /activeSubscriptions/);
  assert.match(repository, /pastDueSubscriptions/);
  assert.match(repository, /pendingOrders/);
  assert.match(repository, /failedPayments/);
  assert.match(repository, /failedProvisioning/);
  assert.match(repository, /paidVolume30d/);
  assert.match(repository, /\$transaction/);
});

test("admin dashboard links operational alerts to filtered destinations", async () => {
  const page = await source("src/app/admin/page.tsx");
  assert.match(page, /\/admin\/provisioning\?status=failed/);
  assert.match(page, /\/admin\/orders\?paymentStatus=failed/);
  assert.match(page, /\/admin\/subscriptions\?status=past-due/);
  assert.match(page, /نیازمند توجه/);
  assert.match(page, /فروش پرداخت‌شده ۳۰ روز/);
});
