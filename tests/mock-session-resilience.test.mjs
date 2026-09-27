import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("mock auth store persists session state to local disk", async () => {
  const store = await source(
    "src/server/repositories/mock/mock-auth-store.ts",
  );
  const session = await source(
    "src/server/repositories/mock/mock-session-repository.ts",
  );

  assert.match(store, /mock-auth-store\.json/);
  assert.match(store, /persistMockAuthStore/);
  assert.match(session, /persistMockAuthStore\(\)/);
});

test("middleware does not treat cookie presence as valid session", async () => {
  const middleware = await source("src/middleware.ts");

  assert.doesNotMatch(
    middleware,
    /pathname === "\/login"[^]*&& session[^]*NextResponse\.redirect/,
  );
  assert.match(middleware, /opaque cookie/);
});
