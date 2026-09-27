import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("database audit repository declares contract return types", async () => {
  const code = await source(
    "src/server/repositories/database/database-audit-repository.ts",
  );

  assert.match(code, /Promise<AuditLog>/);
  assert.match(code, /Promise<AuditLog\[\]>/);
});

test("database adapters use explicit repository return types", async () => {
  const files = [
    "database-business-member-repository.ts",
    "database-business-repository.ts",
    "database-business-service-repository.ts",
    "database-otp-repository.ts",
    "database-service-catalog-repository.ts",
    "database-session-repository.ts",
    "database-user-repository.ts",
  ];

  for (const file of files) {
    const code = await source(
      `src/server/repositories/database/${file}`,
    );
    assert.match(code, /Promise</, file);
  }
});
