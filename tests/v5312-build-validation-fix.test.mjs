import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("all V5.31 business audit actions belong to AuditAction", async () => {
  const audit = await source(
    "src/lib/audit.ts",
  );

  for (const action of [
    "business_member_added",
    "business_member_removed",
    "business_ownership_transferred",
  ]) {
    assert.match(
      audit,
      new RegExp(
        `"${action}"`,
      ),
    );
  }
});

test("services layer enforces active business before listing services", async () => {
  const route = await source(
    "src/app/api/v1/services/route.ts",
  );
  const service = await source(
    "src/server/services/services-service.ts",
  );

  assert.match(
    service,
    /requireBusinessActive/,
  );
  assert.match(
    service,
    /getCurrentBusinessContext/,
  );
  assert.doesNotMatch(route, /requireBusinessActive|getCurrentBusinessContext/);
});

test("admin users validates role and pagination", async () => {
  const route = await source(
    "src/app/api/v1/admin/users/route.ts",
  );

  assert.match(
    route,
    /ValidationApiError/,
  );
  assert.match(
    route,
    /roleId && !\/\^\[0-9a-f-\]/,
  );
  assert.match(
    route,
    /pageSize > 100/,
  );
});

test("admin businesses validates business and service status filters", async () => {
  const route = await source(
    "src/app/api/v1/admin/businesses/route.ts",
  );

  assert.match(
    route,
    /statusParam !==\s*"suspended"/,
  );
  assert.match(
    route,
    /serviceStatusParam !==\s*"coming-soon"/,
  );
  assert.match(
    route,
    /pageSize > 100/,
  );
});
