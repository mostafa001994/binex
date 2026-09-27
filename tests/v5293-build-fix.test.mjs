import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("admin business page does not duplicate coming-soon comparison", async () => {
  const page = await source(
    "src/app/admin/businesses/[businessId]/page.tsx",
  );

  assert.doesNotMatch(
    page,
    /definition\.availability ===\s*"coming-soon"\s*\|\|\s*definition\.availability ===\s*"coming-soon"/,
  );
});

test("service catalog mock store has no stale eslint-disable directive", async () => {
  const store = await source(
    "src/server/repositories/mock/mock-service-catalog-store.ts",
  );

  assert.doesNotMatch(
    store,
    /eslint-disable-next-line no-var/,
  );
});
