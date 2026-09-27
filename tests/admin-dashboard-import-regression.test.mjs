import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("admin dashboard imports Layers3 exactly once", async () => {
  const source = await readFile(
    new URL("../src/app/admin/page.tsx", import.meta.url),
    "utf8",
  );

  const importBlock =
    source.match(/import\s*\{([\s\S]*?)\}\s*from\s*"lucide-react";/)?.[1] ?? "";

  const count =
    (importBlock.match(/\bLayers3\b/g) || []).length;

  assert.equal(count, 1);
});
