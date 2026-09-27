import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("customer subscription repository queries are scoped by business", async () => {
  const contract = await source("src/server/repositories/contracts/subscription-repository.ts");
  const database = await source("src/server/repositories/database/database-subscription-repository.ts");

  assert.match(contract, /listForBusiness\(businessId: string\)/);
  assert.match(contract, /findForBusiness\(businessId: string, id: string\)/);
  assert.match(database, /where: \{ businessId \}/);
  assert.match(database, /where: \{ id, businessId \}/);
});

test("customer subscription access is owner-only and checks active business", async () => {
  const service = await source("src/server/subscriptions/customer-subscription-service.ts");

  assert.match(service, /requireBusinessActive/);
  assert.match(service, /role !== "owner"/);
  assert.match(service, /ForbiddenApiError/);
  assert.match(service, /listForBusiness\(/);
  assert.match(service, /findForBusiness\(/);
  assert.doesNotMatch(service, /\.search\(/);
  assert.doesNotMatch(service, /\.findById\(/);
});

test("customer subscription response excludes internal operational data", async () => {
  const service = await source("src/server/subscriptions/customer-subscription-service.ts");

  assert.match(service, /lifecycleStatus/);
  assert.match(service, /nextAction/);
  assert.doesNotMatch(service, /metadata:/);
  assert.doesNotMatch(service, /externalReference:/);
  assert.doesNotMatch(service, /payload:/);
  assert.doesNotMatch(service, /lastError:/);
  assert.doesNotMatch(service, /providerPaymentId:/);
});

test("customer subscription routes authenticate list and detail requests", async () => {
  const listRoute = await source("src/app/api/v1/subscriptions/route.ts");
  const detailRoute = await source("src/app/api/v1/subscriptions/[subscriptionId]/route.ts");

  assert.match(listRoute, /getAuthenticatedUser/);
  assert.match(listRoute, /listCustomerSubscriptions/);
  assert.match(detailRoute, /getAuthenticatedUser/);
  assert.match(detailRoute, /getCustomerSubscription/);
});

test("invalid or inaccessible subscription ids use a generic not-found response", async () => {
  const service = await source("src/server/subscriptions/customer-subscription-service.ts");
  const matches = service.match(/اشتراک موردنظر پیدا نشد/g) ?? [];

  assert.equal(matches.length, 2);
  assert.match(service, /UUID_PATTERN/);
});
