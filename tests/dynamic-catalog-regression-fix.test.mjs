import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("footer root navigation uses Next Link", async () => {
  const footer = await source(
    "src/components/footer/footer.tsx",
  );

  assert.match(
    footer,
    /import Link from "next\/link"/,
  );
  assert.doesNotMatch(
    footer,
    /<a\s+href="\/"/,
  );
  assert.match(
    footer,
    /<Link\s+href="\/"/,
  );
});

test("roadmap activation policy is catalog-driven, not BI hardcoded", async () => {
  const admin = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(
    admin,
    /definition\.availability ===\s*"coming-soon"/,
  );
  assert.doesNotMatch(
    admin,
    /input\.serviceId === "bi"/,
  );
});

test("dynamic service route has no fixed allowed id list", async () => {
  const route = await source(
    "src/app/api/v1/services/[serviceId]/route.ts",
  );

  assert.match(route, /getServiceForUser/);
  assert.doesNotMatch(
    route,
    /allowedServiceIds/,
  );
});
