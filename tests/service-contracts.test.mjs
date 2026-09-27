import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("BI id is aligned between specialized config and dynamic catalog seed", async () => {
  const config = await source(
    "src/constants/services-config.ts",
  );
  const catalogStore = await source(
    "src/server/repositories/mock/mock-service-catalog-store.ts",
  );

  assert.match(config, /id:\s*"bi"/);
  assert.doesNotMatch(config, /id:\s*"bi-modules"/);
  assert.match(catalogStore, /id:\s*"bi"/);
  assert.match(
    catalogStore,
    /marketingHref:\s*"\/services\/bi-modules"/,
  );
});

test("dashboard does not request business context twice", async () => {
  const dashboard = await source(
    "src/server/dashboard/dashboard-service.ts",
  );

  const matches =
    dashboard.match(/getCurrentBusinessContext\(user\)/g) ?? [];

  assert.equal(matches.length, 1);
  assert.match(dashboard, /listServicesForBusinessContext/);
});

test("service workspace gates every non-usable journey state", async () => {
  const workspace = await source(
    "src/components/app/service-workspace.tsx",
  );

  assert.match(workspace, /getServiceApi\(service\)/);
  assert.match(workspace, /!\["ready", "setup-required"\]\.includes\(journey\.status\)/);
  assert.match(workspace, /journey\.status === "payment-required"/);
  assert.match(workspace, /journey\.status === "setup-failed"/);
});
