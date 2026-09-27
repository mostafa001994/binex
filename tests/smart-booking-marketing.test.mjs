import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("smart booking page has a complete conversion journey", async () => {
  const page = await read("src/app/services/smart-booking/page.tsx");
  const template = await read("src/components/services/shared/DynamicServiceMarketingPage.tsx");
  assert.match(page, /getPublicFaqItems\("\/services\/smart-booking"\)/);
  assert.match(page, /<DynamicServiceMarketingPage slug="smart-booking" faqItems=\{faqItems\} \/>/);
  for (const section of ["content.benefits", "content.steps", "content.trust", "content.faq", "content.cta"]) assert.match(template, new RegExp(section.replace(".", "\\.")));
  assert.match(page, /getManagedSeoMetadata\("\/services\/smart-booking"\)/);
});

test("smart booking consultation persists a qualified lead", async () => {
  const form = await read(
    "src/components/services/smart-booking/BookingConsultationForm.tsx",
  );

  assert.match(form, /fetch\("\/api\/leads"/);
  assert.match(form, /source:\s*"smart-booking-consultation"/);
  assert.match(form, /need:\s*"درخواست راه‌اندازی نوبت‌دهی هوشمند"/);
  assert.match(form, /name="phone"/);
  assert.match(form, /name="businessName"/);
  assert.match(form, /name="businessType"/);
  assert.match(form, /name="currentMethod"/);
  assert.match(form, /name="consent"/);
});

test("smart booking primary CTA targets its consultation form", async () => {
  const hero = await read("src/components/services/smart-booking/BookingHero.tsx");

  assert.match(hero, /href="#booking-request"/);
  assert.match(hero, /درخواست بررسی رایگان/);
  assert.doesNotMatch(hero, /href="\/login\?service=smart-booking"/);
});

test("smart booking is available in seed and additive migration", async () => {
  const seed = await read("prisma/seed.ts");
  const migration = await read(
    "prisma/migrations/202608280001_mark_smart_booking_available/migration.sql",
  );
  const bookingBlock = seed.match(
    /id:\s*"smart-booking"[\s\S]*?features:\s*\[[\s\S]*?\],\s*\n\s*},/,
  )?.[0];

  assert.ok(bookingBlock);
  assert.match(bookingBlock, /availability:\s*ServiceAvailability\.AVAILABLE/);
  assert.match(migration, /UPDATE "service_definitions"/);
  assert.match(migration, /"id" = 'smart-booking'/);
  assert.match(migration, /'AVAILABLE'/);
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|DELETE)\b/i);
});
