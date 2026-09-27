import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("content generator is registered in database, seed and built-in UI config", async () => {
  const [migration, seed, config, mockCatalog] = await Promise.all([
    read("prisma/migrations/202609240001_add_content_generator_service/migration.sql"),
    read("prisma/seed.ts"),
    read("src/constants/services-config.ts"),
    read("src/server/repositories/mock/mock-service-catalog-store.ts"),
  ]);

  for (const source of [migration, seed, config, mockCatalog]) {
    assert.match(source, /content-generator/);
    assert.match(source, /تولید محتوای هوشمند/);
  }

  assert.match(migration, /ON CONFLICT \("id"\) DO UPDATE/);
  assert.match(config, /\/app\/services\/content-generator/);
});

test("content generator secrets are encrypted and never returned by its public status", async () => {
  const [service, types, route] = await Promise.all([
    read("src/server/content-generator/content-generator-service.ts"),
    read("src/server/content-generator/content-generator-types.ts"),
    read("src/app/api/v1/content-generator/settings/route.ts"),
  ]);

  assert.match(service, /apiKeyEncrypted: encryptSecret\(apiKey\)/);
  assert.match(service, /secretKeyEncrypted: encryptSecret\(secretKey\)/);
  assert.match(service, /apiKeyConfigured/);
  assert.match(service, /secretKeyConfigured/);
  assert.doesNotMatch(types, /apiKey: string/);
  assert.doesNotMatch(types, /secretKey: string/);
  assert.match(route, /getAuthenticatedUser/);
});

test("content generator validates keyword, source URL and destination settings", async () => {
  const service = await read("src/server/content-generator/content-generator-service.ts");
  const page = await read("src/components/content-generator/content-generator-settings.tsx");

  assert.match(service, /normalizeStrings\(body\.keywords/);
  assert.match(service, /normalizeStrings\(body\.sourceUrls/);
  assert.match(service, /normalizeUrl\(body\.targetSiteUrl/);
  assert.match(service, /\["http:", "https:"\]/);
  assert.match(page, /URL منابع محتوا/);
  assert.match(page, /API Key/);
  assert.match(page, /Secret Key/);
  assert.match(page, /به‌تنهایی محتوایی منتشر نمی‌کند/);
});

test("content generator has a dedicated marketing page with dynamic plans", async () => {
  const [page, template, plans] = await Promise.all([
    read("src/app/services/ai-content/page.tsx"),
    read("src/components/services/shared/DynamicServiceMarketingPage.tsx"),
    read("src/components/services/shared/ServicePlans.tsx"),
  ]);

  assert.match(page, /<DynamicServiceMarketingPage slug="ai-content" \/>/);
  assert.match(template, /normalizeServiceMarketingContent/);
  assert.match(template, /<ServicePlans serviceId=\{service\.id\}/);
  assert.match(plans, /showWhenEmpty/);
});
