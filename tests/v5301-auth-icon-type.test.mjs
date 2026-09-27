import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("auth service intent banner uses generic LucideIcon type", async () => {
  const source = await readFile(
    new URL(
      "../src/components/auth/auth-experience-shell.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    source,
    /type LucideIcon/,
  );
  assert.match(
    source,
    /icon: LucideIcon/,
  );
  assert.doesNotMatch(
    source,
    /typeof MessageSquareText/,
  );
});
