import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("customer order repository queries are scoped by business", async () => {
  const contract = await source("src/server/repositories/contracts/commerce-repository.ts");
  const database = await source("src/server/repositories/database/database-commerce-repository.ts");

  assert.match(contract, /listOrdersForBusiness/);
  assert.match(contract, /findOrderForBusiness/);
  assert.match(database, /count\(\{ where: \{ businessId \} \}\)/);
  assert.match(database, /where: \{ id, businessId \}/);
});

test("customer commerce is owner-only and validates pagination", async () => {
  const service = await source("src/server/commerce/customer-commerce-service.ts");

  assert.match(service, /requireBusinessActive/);
  assert.match(service, /role !== "owner"/);
  assert.match(service, /pageSize > 50/);
  assert.match(service, /ForbiddenApiError/);
  assert.match(service, /ValidationApiError/);
});

test("customer commerce excludes admin and provider-internal fields", async () => {
  const service = await source("src/server/commerce/customer-commerce-service.ts");

  assert.doesNotMatch(service, /internalNote:/);
  assert.doesNotMatch(service, /createdByPhone:/);
  assert.doesNotMatch(service, /createdByName:/);
  assert.doesNotMatch(service, /providerPaymentId:/);
  assert.doesNotMatch(service, /failureCode:/);
  assert.doesNotMatch(service, /failureMessage:/);
  assert.doesNotMatch(service, /planCode:/);
});

test("receipt is exposed only after order payment and amount reconcile", async () => {
  const service = await source("src/server/commerce/customer-commerce-service.ts");

  assert.match(service, /financialOrderStatuses\.has\(order\.status\)/);
  assert.match(service, /payment\.amount === order\.totalAmount/);
  assert.match(service, /receiptAvailable/);
  assert.match(service, /payment\.id === receiptPayment\?\.id/);
});

test("customer order list and detail routes authenticate requests", async () => {
  const listRoute = await source("src/app/api/v1/orders/route.ts");
  const detailRoute = await source("src/app/api/v1/orders/[orderId]/route.ts");

  assert.match(listRoute, /getAuthenticatedUser/);
  assert.match(listRoute, /listCustomerOrders/);
  assert.match(detailRoute, /getAuthenticatedUser/);
  assert.match(detailRoute, /getCustomerOrder/);
});

test("invalid and inaccessible order ids share generic not-found response", async () => {
  const service = await source("src/server/commerce/customer-commerce-service.ts");
  const matches = service.match(/سفارش موردنظر پیدا نشد/g) ?? [];

  assert.equal(matches.length, 2);
  assert.match(service, /UUID_PATTERN/);
});
