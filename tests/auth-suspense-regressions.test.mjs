import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("login wraps useSearchParams consumer in Suspense", async () => {
  const code = await source("src/app/(auth)/login/page.tsx");

  assert.match(code, /useSearchParams/);
  assert.match(code, /<Suspense/);
  assert.match(code, /<LoginPageContent \/>/);
});

test("otp wraps useSearchParams consumer in Suspense", async () => {
  const code = await source("src/app/(auth)/otp/page.tsx");

  assert.match(code, /useSearchParams/);
  assert.match(code, /<Suspense/);
  assert.match(code, /<OtpPageContent \/>/);
});
