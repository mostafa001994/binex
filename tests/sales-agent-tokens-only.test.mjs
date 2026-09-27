import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("sales agent credentials contain exactly Bale and WooCommerce tokens", async () => {
  const types = await source(
    "src/server/sales-agent/sales-agent-types.ts",
  );

  assert.match(types, /baleBotTokenEncrypted/);
  assert.match(types, /woocommerceTokenEncrypted/);

  assert.doesNotMatch(types, /Conversation/);
  assert.doesNotMatch(types, /Order/);
  assert.doesNotMatch(types, /Knowledge/);
  assert.doesNotMatch(types, /Product/);
});

test("credentials API returns safe status object, never raw token values", async () => {
  const route = await source(
    "src/app/api/v1/sales-agent/credentials/route.ts",
  );
  const service = await source(
    "src/server/sales-agent/sales-agent-service.ts",
  );

  assert.match(route, /getSalesAgentCredentialStatus/);
  assert.match(service, /baleBotTokenConfigured/);
  assert.match(service, /woocommerceTokenConfigured/);
  assert.match(service, /baleBotTokenMasked/);
  assert.match(service, /woocommerceTokenMasked/);

  assert.doesNotMatch(route, /baleBotTokenEncrypted/);
  assert.doesNotMatch(route, /woocommerceTokenEncrypted/);
  assert.doesNotMatch(route, /decryptSecret/);
});

test("sales agent UI exposes only the two requested credential inputs", async () => {
  const ui = await source(
    "src/components/sales-agent/sales-agent-console.tsx",
  );

  assert.match(ui, /توکن بات بله/);
  assert.match(ui, /توکن ووکامرس/);

  assert.doesNotMatch(ui, /مکالمه|سفارش|Knowledge|Handoff/);
  assert.doesNotMatch(ui, /getSalesAgentOverviewApi/);
  assert.doesNotMatch(ui, /createSalesAgentProductApi/);
  assert.doesNotMatch(ui, /connectMockBaleApi/);
});
