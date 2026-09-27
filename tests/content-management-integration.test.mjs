import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public home renders managed FAQ content and its structured data", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /getPublicFaqItems\("\/"\)/);
  assert.match(page, /<FaqStructuredData items=\{faqItems\}/);
  assert.match(page, /<HomeFaq items=\{faqItems\}/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
});

test("managed SEO is used by every known service page", async () => {
  for (const slug of ["ai-sales-agent", "smart-booking", "bi-modules", "excel-analyzer", "ai-content"]) {
    const page = await read(`src/app/services/${slug}/page.tsx`);
    assert.match(page, new RegExp(`getManagedSeoMetadata\\(\"/services/${slug}\"\\)`));
    assert.match(page, /export const dynamic = "force-dynamic"/);
  }
});

test("canonical base honors the configured application URL", async () => {
  const config = await read("src/lib/site-config.ts");
  const dockerfile = await read("Dockerfile");
  const compose = await read("compose.portable.yaml");
  assert.match(config, /process\.env\.APP_URL/);
  assert.match(dockerfile, /ARG BINIX_PUBLIC_SITE_URL/);
  assert.match(compose, /BINIX_PUBLIC_SITE_URL: \$\{APP_URL\}/);
});

test("robots, sitemap and dynamic service 404 are implemented", async () => {
  const robots = await read("src/app/robots.ts");
  const sitemap = await read("src/app/sitemap.ts");
  const servicePage = await read("src/app/services/[slug]/page.tsx");
  assert.match(robots, /sitemap: absoluteUrl/);
  assert.match(sitemap, /listPublishedBlogPosts/);
  assert.match(servicePage, /notFound\(\)/);
  assert.match(servicePage, /generateMetadata/);
});

test("media usage protection includes service marketing content", async () => {
  const service = await read("src/server/admin/admin-blog-service.ts");
  const page = await read("src/app/admin/media/page.tsx");
  assert.match(service, /FROM "service_definitions"/);
  assert.match(service, /usedInService/);
  assert.match(page, /details\.usage\.servicePages/);
});

test("blog, FAQ and SEO admin protect risky edits before submission", async () => {
  const blog = await read("src/app/admin/blog/page.tsx");
  const faq = await read("src/app/admin/faqs/page.tsx");
  const seo = await read("src/server/seo/site-seo-service.ts");
  assert.match(blog, /data-blog-field="publish-at"/);
  assert.match(blog, /محتوای مقاله باید حداقل ۲۰۰ کاراکتر/);
  assert.match(blog, /binix-blog-draft:\$\{user\.id\}/);
  assert.match(faq, /سوال تکراری/);
  assert.match(faq, /items\.length >= 30/);
  assert.match(seo, /updatedAt: expectedDate/);
  assert.match(seo, /ConflictApiError/);
});
