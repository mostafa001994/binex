import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("new local blog drafts are recoverable without deleting a declined backup", async () => {
  const page = await read("src/app/admin/blog/page.tsx");
  assert.match(page, /binix-blog-draft:\$\{user\.id\}:new/);
  assert.match(page, /recovered\.version === null/);
  assert.doesNotMatch(
    page,
    /recovered\.version === post\.version[\s\S]{0,300}else localStorage\.removeItem/,
  );
});

test("scheduled dates use a local datetime value and clean posts cannot be saved again", async () => {
  const page = await read("src/app/admin/blog/page.tsx");
  assert.match(page, /function toLocalDateTimeInput/);
  assert.match(page, /date\.getTimezoneOffset\(\)/);
  assert.match(page, /toLocalDateTimeInput\(post\.publishedAt\)/);
  assert.match(page, /disabled=\{saving \|\| !dirty\}/);
});

test("blog preview is gated by saved state and mirrors important public sections", async () => {
  const [admin, preview] = await Promise.all([
    read("src/app/admin/blog/page.tsx"),
    read("src/app/admin/blog/preview/[postId]/page.tsx"),
  ]);
  assert.match(admin, /disabled=\{dirty\}/);
  assert.match(admin, /ابتدا ذخیره کنید/);
  assert.match(preview, /مقاله.های مرتبط/);
  assert.match(preview, /post\.sources\.length/);
  assert.match(preview, /tags\.length/);
  assert.match(preview, /post\.ctaTitle/);
  assert.match(preview, /error instanceof NotFoundApiError/);
});

test("taxonomy delete controls follow publish permission", async () => {
  const page = await read("src/app/admin/blog/page.tsx");
  assert.match(page, /canDelete=\{canPublish\}/);
  assert.match(page, /\{canDelete \? \(/);
});

test("out of range blog pages redirect and structured data images are absolute", async () => {
  const [index, article] = await Promise.all([
    read("src/components/blog/blog-index.tsx"),
    read("src/app/blog/[slug]/page.tsx"),
  ]);
  assert.match(index, /page > data\.pagination\.totalPages/);
  assert.match(index, /redirect\(pageHref\(data\.pagination\.totalPages\)\)/);
  assert.match(article, /image: post\.coverImageUrl[\s\S]*absoluteUrl\(post\.coverImageUrl\)/);
});

test("incomplete drafts can be saved and new posts can enter review or publication directly", async () => {
  const [page, service, client] = await Promise.all([
    read("src/app/admin/blog/page.tsx"),
    read("src/server/admin/admin-blog-service.ts"),
    read("src/lib/api-client/admin.ts"),
  ]);
  assert.match(service, /allowIncompleteDraft: operation === "save"/);
  assert.match(service, /operation === "publish"[\s\S]*blog_post_published/);
  assert.match(page, /createAdminBlogPostApi\(\{[\s\S]*operation:/);
  assert.match(page, /!selected \|\| selected\.status !== "PUBLISHED"/);
  assert.match(client, /operation\?: "save" \| "submit" \| "publish" \| "schedule"/);
});

test("editor exposes save state, guarded operations, conflict recovery and loading errors", async () => {
  const page = await read("src/app/admin/blog/page.tsx");
  assert.match(page, /lastLocalSavedAt\.toLocaleTimeString/);
  assert.match(page, /<ConfirmDialog/);
  assert.match(page, /conflictDetected/);
  assert.match(page, /نسخه محلی شما حفظ شده/);
  assert.match(page, /supportingLoading/);
  assert.match(page, /supportingError/);
  assert.match(page, /نسخه انتخابی/);
  assert.match(page, /نسخه فعلی/);
});

test("review rejection stores a note and taxonomy supports safe edit and merge", async () => {
  const [page, service, route, schema] = await Promise.all([
    read("src/app/admin/blog/page.tsx"),
    read("src/server/admin/admin-blog-service.ts"),
    read("src/app/api/v1/admin/blog/taxonomy/route.ts"),
    read("prisma/schema.prisma"),
  ]);
  assert.match(schema, /reviewNote\s+String\?/);
  assert.match(service, /operation === "reject"/);
  assert.match(service, /blogPostTag\.createMany/);
  assert.match(service, /blogPost\.updateMany/);
  assert.match(service, /updateBlogTaxonomy/);
  assert.match(route, /export const PATCH/);
  assert.match(page, /بازگرداندن برای اصلاح/);
  assert.match(page, /یادداشت آخرین بازبینی/);
  assert.match(page, /انتقال و ادغام طبقه/);
  assert.match(page, /ویرایش \$\{item\.name\}/);
});

test("taxonomy creation is accessible, responsive and preserves manually edited slugs", async () => {
  const page = await read("src/app/admin/blog/page.tsx");
  assert.match(page, /function normalizeTaxonomySlug/);
  assert.match(page, /if \(!slugEdited\) setSlug\(normalizeTaxonomySlug\(value\)\)/);
  assert.match(page, /aria-label="نوع طبقه‌بندی"/);
  assert.match(page, /<form onSubmit=\{submitCreate\} noValidate/);
  assert.match(page, /sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2/);
  assert.match(page, /توضیح دسته/);
  assert.match(page, /هنوز \$\{kind === "category" \? "دسته‌ای" : "برچسبی"\} ساخته نشده است/);
  assert.match(page, /disabled=\{!formValid \|\| creating\}/);
});

test("taxonomy API aligns validation, field conflicts and audit coverage", async () => {
  const [service, errors, audit, repository, schema, migration] = await Promise.all([
    read("src/server/admin/admin-blog-service.ts"),
    read("src/server/core/api-error.ts"),
    read("src/lib/audit.ts"),
    read("src/server/repositories/database/database-audit-repository.ts"),
    read("prisma/schema.prisma"),
    read("prisma/migrations/20260926150000_add_blog_taxonomy_audit/migration.sql"),
  ]);
  assert.match(service, /\^\[a-z0-9\]\+\(\?:-\[a-z0-9\]\+\)\*\$/);
  assert.match(service, /assertTaxonomyUnique/);
  assert.match(service, /fields\.name/);
  assert.match(service, /fields\.slug/);
  assert.match(errors, /ConflictApiError[\s\S]*fields\?: ApiFieldErrors/);
  for (const action of ["created", "updated", "deleted", "merged"]) {
    assert.match(audit, new RegExp(`blog_taxonomy_${action}`));
    assert.match(repository, new RegExp(`BLOG_TAXONOMY_${action.toUpperCase()}`));
    assert.match(schema, new RegExp(`BLOG_TAXONOMY_${action.toUpperCase()}`));
    assert.match(migration, new RegExp(`BLOG_TAXONOMY_${action.toUpperCase()}`));
  }
});
