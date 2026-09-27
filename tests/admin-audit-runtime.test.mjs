import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("mock audit repository uses array-shaped audit store", async () => {
  const store = await source(
    "src/server/repositories/mock/mock-audit-store.ts",
  );
  const repository = await source(
    "src/server/repositories/mock/mock-audit-repository.ts",
  );

  assert.match(
    store,
    /__binixMockAuditStore:\s*AuditLog\[\]/,
  );
  assert.match(
    repository,
    /\.\.\.getMockAuditStore\(\)/,
  );
  assert.doesNotMatch(
    repository,
    /store\.logs/,
  );
});

test("mock audit create and list preserve existing array contract", async () => {
  const repository = await source(
    "src/server/repositories/mock/mock-audit-repository.ts",
  );

  assert.match(
    repository,
    /getMockAuditStore\(\)\.unshift\(log\)/,
  );
  assert.match(
    repository,
    /getMockAuditStore\(\)\.slice/,
  );
});
