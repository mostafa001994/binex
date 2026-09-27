import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("logout uses backend logout endpoint instead of login link", async () => {
  const menu = await source("src/components/shell/user-menu.tsx");
  assert.match(menu, /logoutApi\(\)/);
  assert.doesNotMatch(menu, /href="\/login"[^>]*>.*خروج/s);
});

test("OTP production generation does not use Math.random", async () => {
  const auth = await source("src/server/auth/auth-service.ts");
  assert.doesNotMatch(auth, /Math\.random/);
  assert.match(auth, /randomInt\(10000,\s*100000\)/);
});

test("auth me supports profile update", async () => {
  const route = await source("src/app/api/v1/auth/me/route.ts");
  assert.match(route, /export const PATCH/);
  assert.match(route, /updateProfile/);
});
