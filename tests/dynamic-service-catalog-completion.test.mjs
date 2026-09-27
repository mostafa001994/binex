import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("business API contract uses dynamic enriched services", async () => {
  const client = await source(
    "src/lib/api-client/business.ts",
  );
  const response = await source(
    "src/server/business/business-response.ts",
  );

  assert.match(
    client,
    /serviceId: string/,
  );
  assert.match(
    client,
    /service:\s*\{/,
  );
  assert.match(
    response,
    /getServiceCatalogRepository/,
  );
});

test("sidebar billing and reports do not use static service config", async () => {
  for (const path of [
    "src/components/shell/app-sidebar.tsx",
    "src/app/app/billing/page.tsx",
    "src/app/app/reports/page.tsx",
  ]) {
    const text = await source(path);
    assert.doesNotMatch(
      text,
      /serviceById|servicesConfig/,
    );
    assert.match(
      text,
      /assignment\.service|item\.service|services/,
    );
  }
});

test("new businesses start with no implicit service ownership", async () => {
  const service = await source(
    "src/server/business/business-service.ts",
  );

  assert.match(
    service,
    /const services:\s*CurrentBusinessContext\["services"\]\s*=\s*\[\]/,
  );
  assert.doesNotMatch(
    service,
    /serviceId:\s*"sales-agent"/,
  );
  assert.doesNotMatch(
    service,
    /serviceId:\s*"smart-booking"/,
  );
});

test("dynamic services have a generic app workspace fallback", async () => {
  const page = await source(
    "src/app/app/services/[serviceId]/page.tsx",
  );
  const links = await source(
    "src/lib/service-links.ts",
  );

  assert.match(
    page,
    /getServiceApi/,
  );
  assert.match(
    links,
    /\/app\/services\/\$\{service\.id\}/,
  );
});

test("admin service paths cannot point to arbitrary app routes", async () => {
  const service = await source(
    "src/server/admin/admin-service-catalog.ts",
  );

  assert.match(
    service,
    /cleanAppPath/,
  );
  assert.match(
    service,
    /\/app\/services\/\$\{id\}/,
  );
  assert.match(
    service,
    /cleanMarketingPath/,
  );
});

test("auth service intent is catalog validated and dynamic", async () => {
  const hook = await source(
    "src/hooks/use-service-intent.ts",
  );
  const login = await source(
    "src/app/(auth)/login/page.tsx",
  );
  const otp = await source(
    "src/app/(auth)/otp/page.tsx",
  );

  assert.match(
    hook,
    /usePublicServices/,
  );
  assert.match(
    hook,
    /item\.id ===\s*candidate/,
  );
  assert.match(
    login,
    /useServiceIntent/,
  );
  assert.match(
    otp,
    /useServiceIntent/,
  );
  assert.doesNotMatch(
    login,
    /value === "sales-agent"/,
  );
  assert.match(
    login,
    /serviceIntentPending/,
  );
  assert.match(
    otp,
    /serviceIntentReady/,
  );
});

test("generic marketing service selects a plan before login", async () => {
  const page = await source("src/components/services/shared/DynamicServiceMarketingPage.tsx");

  assert.match(
    page,
    /getPurchasablePlansApi/,
  );
  assert.match(page, /href="#plans"/);
  assert.match(page, /href=\{content\.cta\.href\}/);
});

test("authenticated services hide globally disabled catalog items", async () => {
  const service = await source(
    "src/server/services/services-service.ts",
  );

  assert.match(
    service,
    /service\.status !==\s*"active"/,
  );
  assert.match(
    service,
    /service\.visibility ===\s*"public"/,
  );
});
