import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("BI page has a complete sales conversion journey", async () => {
  const page = await read("src/app/services/bi-modules/page.tsx");
  const template = await read("src/components/services/shared/DynamicServiceMarketingPage.tsx");
  assert.match(page, /getPublicFaqItems\("\/services\/bi-modules"\)/);
  assert.match(page, /<DynamicServiceMarketingPage slug="bi-modules" faqItems=\{faqItems\} \/>/);
  for (const section of ["content.benefits", "content.steps", "content.trust", "content.faq", "content.cta"]) assert.match(template, new RegExp(section.replace(".", "\\.")));
  assert.match(template, /<ServicePlans serviceId=\{service\.id\}/);
  assert.match(page, /getManagedSeoMetadata\("\/services\/bi-modules"\)/);
});

test("BI consultation persists a qualified lead", async () => {
  const form = await read("src/components/services/bi-modules/BIConsultationForm.tsx");
  assert.match(form, /fetch\("\/api\/leads"/);
  assert.match(form, /source:\s*"bi-sales-consultation"/);
  assert.match(form, /need:\s*"درخواست راه‌اندازی BI فروش"/);
  for (const name of ["phone", "businessName", "salesModel", "excelState", "mainNeed", "consent"]) assert.match(form, new RegExp(`name="${name}"`));
});

test("BI lead source has a Persian label in admin", async () => {
  const adminLeads = await read("src/app/admin/leads/page.tsx");
  assert.match(adminLeads, /"bi-sales-consultation":\s*"درخواست BI فروش"/);
});

test("BI primary CTA targets its qualified consultation form", async () => {
  const hero = await read("src/components/services/bi-modules/BIHero.tsx");
  assert.match(hero, /href="#bi-request"/);
  assert.match(hero, /درخواست بررسی رایگان BI/);
  assert.match(hero, /href="#bi-preview"/);
});

test("BI is available in config, seed and additive migration", async () => {
  const config = await read("src/constants/services-config.ts");
  const seed = await read("prisma/seed.ts");
  const migration = await read("prisma/migrations/202608280002_mark_bi_available/migration.sql");
  const seedBlock = seed.match(/id:\s*"bi"[\s\S]*?features:\s*\[[\s\S]*?\],\s*\n\s*},/)?.[0];
  assert.ok(seedBlock);
  assert.match(seedBlock, /availability:\s*ServiceAvailability\.AVAILABLE/);
  assert.match(config, /id:\s*"bi"[\s\S]*?appHref:\s*"\/app\/services\/bi"[\s\S]*?availability:\s*"available"/);
  assert.match(migration, /UPDATE "service_definitions"/);
  assert.match(migration, /"id" = 'bi'/);
  assert.match(migration, /'AVAILABLE'/);
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|DELETE)\b/i);
});
