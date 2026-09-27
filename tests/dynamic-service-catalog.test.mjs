import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("service ids are dynamic strings", async () => {
  const serviceTypes = await source(
    "src/server/services/service-types.ts",
  );
  const businessTypes = await source(
    "src/server/business/business-types.ts",
  );

  assert.match(
    serviceTypes,
    /export type ServiceId = string/,
  );
  assert.match(
    businessTypes,
    /serviceId: string/,
  );
});

test("service catalog supports CRUD and slug lookup", async () => {
  const contract = await source(
    "src/server/repositories/contracts/service-catalog-repository.ts",
  );

  assert.match(contract, /findBySlug/);
  assert.match(contract, /create\(/);
  assert.match(contract, /update\(/);
  assert.match(contract, /delete\(/);
});

test("mock service catalog persists admin changes", async () => {
  const store = await source(
    "src/server/repositories/mock/mock-service-catalog-store.ts",
  );

  assert.match(
    store,
    /mock-service-catalog\.json/,
  );
  assert.match(
    store,
    /persistMockServiceCatalogStore/,
  );
});

test("public marketing catalog is API driven", async () => {
  const products = await source(
    "src/components/landing/products.tsx",
  );
  const footer = await source(
    "src/components/footer/footer.tsx",
  );
  const navbar = await source(
    "src/components/navbar/navbar.tsx",
  );
  const pricing = await source(
    "src/components/landing/pricing.tsx",
  );

  assert.match(
    products,
    /usePublicServices/,
  );
  assert.match(
    footer,
    /usePublicServices/,
  );
  assert.match(
    navbar,
    /usePublicServices/,
  );
  assert.match(
    pricing,
    /usePublicServices/,
  );

  assert.doesNotMatch(
    products,
    /servicesConfig/,
  );
  assert.doesNotMatch(
    footer,
    /servicesConfig/,
  );
  assert.doesNotMatch(
    navbar,
    /servicesConfig/,
  );
  assert.doesNotMatch(
    pricing,
    /servicesConfig/,
  );
});

test("app search and app services consume services API", async () => {
  const search = await source(
    "src/components/shell/app-search.tsx",
  );
  const services = await source(
    "src/app/app/services/page.tsx",
  );

  assert.match(
    search,
    /getServicesApi/,
  );
  assert.match(
    services,
    /getServicesApi/,
  );
});

test("admin has dynamic service catalog management", async () => {
  const page = await source(
    "src/app/admin/services/page.tsx",
  );
  const route = await source(
    "src/app/api/v1/admin/services/route.ts",
  );
  const detail = await source(
    "src/app/api/v1/admin/services/[serviceId]/route.ts",
  );

  assert.match(
    page,
    /سرویس جدید/,
  );
  assert.match(
    route,
    /export const POST/,
  );
  assert.match(
    detail,
    /export async function PATCH/,
  );
  assert.match(
    detail,
    /export async function DELETE/,
  );
});

test("admin business service route no longer hardcodes catalog ids", async () => {
  const route = await source(
    "src/app/api/v1/admin/businesses/[businessId]/services/[serviceId]/route.ts",
  );

  assert.doesNotMatch(
    route,
    /allowedServices/,
  );
  assert.doesNotMatch(
    route,
    /sales-agent.*smart-booking.*excel-analyzer/s,
  );
});

test("generic marketing service page exists for newly created services", async () => {
  const route = await source("src/app/services/[slug]/page.tsx");
  const page = await source("src/components/services/shared/DynamicServiceMarketingPage.tsx");

  assert.match(route, /<DynamicServiceMarketingPage slug=\{slug\}/);
  assert.match(page, /getPublicServiceApi/);
  assert.match(
    page,
    /service\.features/,
  );
});
