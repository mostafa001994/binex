import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("new business empty services array has explicit context type", async () => {
  const source = await readFile(
    new URL(
      "../src/server/business/business-service.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /const services:\s*CurrentBusinessContext\["services"\]\s*=\s*\[\]/,
  );
});
