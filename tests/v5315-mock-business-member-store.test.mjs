import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("mock business member mutations use shared business store", async () => {
  const source = await readFile(
    new URL(
      "../src/server/repositories/mock/mock-business-member-repository.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /getMockBusinessStore\(\)\.members/,
  );
  assert.doesNotMatch(
    source,
    /\bmockBusinessMembers\b/,
  );
});
