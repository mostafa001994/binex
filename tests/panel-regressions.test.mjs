import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("reports and billing no longer use accountPreview", async () => {
  const reports = await source("src/app/app/reports/page.tsx");
  const billing = await source("src/app/app/billing/page.tsx");

  assert.doesNotMatch(reports, /accountPreview/);
  assert.doesNotMatch(billing, /accountPreview/);
  assert.match(reports, /getServicesApi/);
  assert.match(billing, /useBusiness/);
  assert.doesNotMatch(reports, /serviceById/);
  assert.doesNotMatch(billing, /serviceById/);
});

test("business loading has a retryable error state", async () => {
  const gate = await source(
    "src/components/business/business-gate.tsx",
  );

  assert.match(gate, /تلاش مجدد/);
  assert.match(gate, /setError/);
});

test("dynamic service route resolves ids through catalog inside API wrapper", async () => {
  const route = await source(
    "src/app/api/v1/services/[serviceId]/route.ts",
  );
  const service = await source(
    "src/server/services/services-service.ts",
  );

  const wrapper = route.indexOf("withApiHandler");
  const resolver = route.lastIndexOf("getServiceForUser");

  assert.ok(wrapper >= 0);
  assert.ok(resolver > wrapper);
  assert.doesNotMatch(route, /allowedServiceIds/);
  assert.match(service, /item\.id === serviceId/);
  assert.match(service, /NotFoundApiError/);
});

test("settings are connected to backend profile/business APIs", async () => {
  const settings = await source("src/app/app/settings/page.tsx");

  assert.match(settings, /updateMeApi/);
  assert.match(settings, /updateCurrentBusinessApi/);
  assert.match(settings, /getSessionOverviewApi/);
  assert.match(settings, /importantNotificationsOnly/);
  assert.doesNotMatch(settings, /binix-profile-name/);
  assert.doesNotMatch(settings, /binix-business-name/);
  assert.doesNotMatch(settings, /binix-important-notifications/);
});

test("connected service counts use persisted business assignments", async () => {
  const dashboard = await source("src/app/app/page.tsx");
  const dashboardService = await source("src/server/dashboard/dashboard-service.ts");
  const services = await source("src/app/app/services/page.tsx");

  assert.match(dashboardService, /service\.businessServiceId !== null/);
  assert.match(dashboard, /dashboard\.summary\.enabledServices/);
  assert.match(services, /service\.businessServiceId !== null/);
  assert.match(services, /service\.businessServiceId === null/);
  assert.doesNotMatch(
    dashboard,
    /service\.businessStatus !== "not-enabled"/,
  );
  assert.doesNotMatch(
    services,
    /service\.businessStatus !== "not-enabled"/,
  );
  assert.match(dashboard, /هنوز سرویسی به این کسب‌وکار متصل نشده است/);
  assert.match(services, /هنوز سرویسی به این کسب‌وکار متصل نشده است/);
});
