import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("modal focus lifecycle is not restarted by inline onClose callbacks", async () => {
  const modal = await readFile(new URL("../src/components/ui/modal.tsx", import.meta.url), "utf8");
  assert.match(modal, /onCloseRef = useRef\(onClose\)/);
  assert.match(modal, /onCloseRef\.current = onClose/);
  assert.match(modal, /onCloseRef\.current\(\)/);
  assert.match(modal, /\},\[open\]\)/);
  assert.doesNotMatch(modal, /\[open,onClose\]/);
});
