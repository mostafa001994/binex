import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("admin service import section is not corrupted", async () => {
  const source = await readFile(
    new URL("../src/server/admin/admin-service.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /reexport function/);
  assert.match(
    source,
    /from "@\/server\/repositories\/repository-provider";/,
  );
  assert.match(source, /export function requireAdminPermission/);
});
