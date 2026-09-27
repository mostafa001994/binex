import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("mock business member repository imports BusinessMember type", async () => {
  const source = await readFile(
    new URL(
      "../src/server/repositories/mock/mock-business-member-repository.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /import type \{ BusinessMember \} from "@\/server\/business\/business-types";/,
  );
  assert.match(
    source,
    /role:\s*BusinessMember\["role"\]/,
  );
});
