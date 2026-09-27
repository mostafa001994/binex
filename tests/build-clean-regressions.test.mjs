import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("internal root navigation uses Next Link", async () => {
  const footer = await source("src/components/footer/footer.tsx");
  const biHero = await source(
    "src/components/services/bi-modules/BIHero.tsx",
  );

  assert.doesNotMatch(footer, /<a\s+href="\/"/);
  assert.doesNotMatch(biHero, /<a\s+href="\/#products"/);
  assert.match(footer, /import Link from "next\/link"/);
  assert.match(biHero, /import Link from "next\/link"/);
});

test("admin business refresh has stable hook dependency", async () => {
  const page = await source(
    "src/app/admin/businesses/[businessId]/page.tsx",
  );

  assert.match(page, /useCallback/);
  assert.match(page, /\[refresh\]/);
});

test("legacy unused phoneSaved state is removed", async () => {
  const hero = await source("src/components/landing/hero.tsx");
  assert.doesNotMatch(hero, /phoneSaved/);
  assert.doesNotMatch(hero, /setPhoneSaved/);
});
