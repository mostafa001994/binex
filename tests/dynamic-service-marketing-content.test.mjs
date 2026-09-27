import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("service marketing content is persisted and managed from the admin catalog", async () => {
  const [schema, migration, repository, adminService, adminPage] = await Promise.all([
    read("prisma/schema.prisma"),
    read("prisma/migrations/202609250001_add_service_marketing_content/migration.sql"),
    read("src/server/repositories/database/database-service-catalog-repository.ts"),
    read("src/server/admin/admin-service-catalog.ts"),
    read("src/app/admin/services/page.tsx"),
  ]);

  assert.match(schema, /marketingContent\s+Json/);
  assert.match(migration, /ADD COLUMN "marketing_content" JSONB NOT NULL/);
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|DELETE)\b/i);
  assert.match(repository, /marketingContent: normalizeServiceMarketingContent/);
  assert.match(adminService, /cleanMarketingContent/);
  assert.match(adminService, /لینک دکمه پایانی باید یک مسیر داخلی سایت باشد/);
  assert.match(adminService, /تصویر Hero باید از کتابخانه رسانه Binix انتخاب شود/);
  assert.match(adminPage, /محتوای صفحه معرفی/);
  assert.match(adminPage, /انتخاب یا آپلود تصویر/);
  assert.match(adminPage, /MediaPickerDialog/);
  assert.match(adminPage, /پرسش‌های متداول — هر خط: پرسش \| پاسخ/);
});

test("hero media is optional and falls back to the service summary card", async () => {
  const [content, template] = await Promise.all([
    read("src/types/service-marketing.ts"),
    read("src/components/services/shared/DynamicServiceMarketingPage.tsx"),
  ]);

  assert.match(content, /imageUrl:\s*""/);
  assert.match(content, /imageAlt:\s*""/);
  assert.match(template, /content\.hero\.imageUrl \? \(/);
  assert.match(template, /src=\{content\.hero\.imageUrl\}/);
  assert.match(template, /service\.features\.slice\(0, 4\)/);
});
