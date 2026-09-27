import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("sales agent credential lifecycle supports replace and delete", async () => {
  const service = await source(
    "src/server/sales-agent/sales-agent-service.ts",
  );

  assert.match(service, /replaceSalesAgentCredential/);
  assert.match(service, /deleteSalesAgentCredential/);
  assert.match(service, /provider !== "bale"/);
  assert.match(service, /provider !== "woocommerce"/);
});

test("raw tokens are encrypted before repository storage", async () => {
  const service = await source(
    "src/server/sales-agent/sales-agent-service.ts",
  );
  const types = await source(
    "src/server/sales-agent/sales-agent-types.ts",
  );

  assert.match(service, /encryptSecret\(token\)/);
  assert.match(types, /baleBotTokenEncrypted/);
  assert.match(types, /woocommerceTokenEncrypted/);
  assert.doesNotMatch(types, /baleBotToken:\s*string/);
  assert.doesNotMatch(types, /woocommerceToken:\s*string/);
});

test("credential GET returns status and masking, never raw secrets", async () => {
  const service = await source(
    "src/server/sales-agent/sales-agent-service.ts",
  );
  const route = await source(
    "src/app/api/v1/sales-agent/credentials/route.ts",
  );

  assert.match(service, /baleBotTokenMasked/);
  assert.match(service, /woocommerceTokenMasked/);
  assert.doesNotMatch(route, /decryptSecret/);
});

test("production requires explicit credential encryption key", async () => {
  const crypto = await source(
    "src/server/security/secret-crypto.ts",
  );

  assert.match(crypto, /BINIX_CREDENTIALS_ENCRYPTION_KEY/);
  assert.match(crypto, /NODE_ENV === "production"/);
  assert.match(crypto, /aes-256-gcm/);
});

test("credential UI supports replace, delete and hidden input", async () => {
  const ui = await source(
    "src/components/sales-agent/sales-agent-console.tsx",
  );

  assert.match(ui, /جایگزینی/);
  assert.match(ui, /حذف/);
  assert.match(ui, /type=\{visible \? "text" : "password"\}/);
  assert.match(ui, /دوباره در پنل نمایش داده نمی‌شود/);
});
