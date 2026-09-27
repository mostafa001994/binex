import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("customer service journey derives operational states from persisted sources", async () => {
  const service = await source("src/server/services/services-service.ts");

  assert.match(service, /listServicesForBusinessContext\(context\)/);
  assert.match(service, /getSubscriptionRepository\(\)\.listForBusiness\(context\.business\.id\)/);
  assert.match(service, /getCustomerSubscriptionLifecycle\(subscription\)/);
  assert.match(service, /payment-required/);
  assert.match(service, /setup-failed/);
  assert.match(service, /provisioning/);
  assert.match(service, /setup-required/);
});

test("members never trigger subscription repository reads in services snapshot", async () => {
  const service = await source("src/server/services/services-service.ts");
  const ownerCheck = service.indexOf('const canManageBilling = context.membership.role === "owner"');
  const guardedBlock = service.indexOf("if (canManageBilling)", ownerCheck);
  const subscriptionRead = service.indexOf("getSubscriptionRepository().listForBusiness", guardedBlock);

  assert.ok(ownerCheck >= 0);
  assert.ok(guardedBlock > ownerCheck);
  assert.ok(subscriptionRead > guardedBlock);
});

test("service API delegates active-business enforcement to the service layer once", async () => {
  const listRoute = await source("src/app/api/v1/services/route.ts");
  const detailRoute = await source("src/app/api/v1/services/[serviceId]/route.ts");
  const service = await source("src/server/services/services-service.ts");

  assert.doesNotMatch(listRoute, /getCurrentBusinessContext|requireBusinessActive/);
  assert.doesNotMatch(detailRoute, /getCurrentBusinessContext|requireBusinessActive/);
  assert.match(service, /requireBusinessActive\(await getCurrentBusinessContext\(user\)\)/);
});

test("all specialized workspaces use the shared service journey gate", async () => {
  for (const path of [
    "src/app/app/services/sales-agent/page.tsx",
    "src/app/app/services/booking/page.tsx",
    "src/app/app/services/bi/page.tsx",
    "src/app/app/services/excel/page.tsx",
  ]) {
    const page = await source(path);
    assert.match(page, /ServiceWorkspace/);
  }
});

test("services UI exposes real action states and retryable loading", async () => {
  const page = await source("src/app/app/services/page.tsx");
  const workspace = await source("src/components/app/service-workspace.tsx");

  assert.match(page, /service\.journey\.status/);
  assert.match(page, /service\.journey\.nextAction/);
  assert.match(page, /تلاش دوباره/);
  assert.match(workspace, /BlockedServiceState/);
  assert.match(workspace, /فعال‌سازی و خرید سرویس فقط توسط مالک کسب‌وکار/);
});
