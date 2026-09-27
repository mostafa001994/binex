CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "BlogContentOrigin" AS ENUM ('MANUAL', 'AI_ASSISTED', 'IMPORTED');

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_SUBMITTED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_PUBLISHED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_ARCHIVED';

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", permission FROM "access_roles"
CROSS JOIN (VALUES ('admin.content.read'), ('admin.content.write'), ('admin.content.publish')) AS p(permission)
WHERE "code" IN ('admin', 'super-admin')
ON CONFLICT DO NOTHING;

CREATE TABLE "blog_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(120) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "description" VARCHAR(500),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blog_tags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(120) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blog_posts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(160) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "excerpt" VARCHAR(500) NOT NULL,
  "content_markdown" TEXT NOT NULL,
  "cover_image_url" VARCHAR(2048),
  "cover_image_alt" VARCHAR(255),
  "seo_title" VARCHAR(70),
  "seo_description" VARCHAR(170),
  "canonical_url" VARCHAR(2048),
  "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
  "origin" "BlogContentOrigin" NOT NULL DEFAULT 'MANUAL',
  "author_user_id" UUID NOT NULL,
  "reviewer_user_id" UUID,
  "category_id" UUID,
  "published_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blog_post_tags" (
  "post_id" UUID NOT NULL,
  "tag_id" UUID NOT NULL,
  CONSTRAINT "blog_post_tags_pkey" PRIMARY KEY ("post_id", "tag_id")
);

CREATE TABLE "blog_post_revisions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL,
  "editor_user_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "excerpt" VARCHAR(500) NOT NULL,
  "content_markdown" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_post_revisions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blog_content_sources" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL,
  "url" VARCHAR(2048) NOT NULL,
  "title" VARCHAR(300),
  "publisher" VARCHAR(200),
  "license_note" VARCHAR(500),
  "retrieved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_content_sources_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");
CREATE UNIQUE INDEX "blog_tags_slug_key" ON "blog_tags"("slug");
CREATE UNIQUE INDEX "blog_tags_name_key" ON "blog_tags"("name");
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_status_published_at_idx" ON "blog_posts"("status", "published_at");
CREATE INDEX "blog_posts_category_id_status_published_at_idx" ON "blog_posts"("category_id", "status", "published_at");
CREATE INDEX "blog_posts_author_user_id_created_at_idx" ON "blog_posts"("author_user_id", "created_at");
CREATE INDEX "blog_post_tags_tag_id_idx" ON "blog_post_tags"("tag_id");
CREATE INDEX "blog_post_revisions_post_id_created_at_idx" ON "blog_post_revisions"("post_id", "created_at");
CREATE UNIQUE INDEX "blog_content_sources_post_id_url_key" ON "blog_content_sources"("post_id", "url");
CREATE INDEX "blog_content_sources_post_id_idx" ON "blog_content_sources"("post_id");

ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blog_post_revisions" ADD CONSTRAINT "blog_post_revisions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blog_post_revisions" ADD CONSTRAINT "blog_post_revisions_editor_user_id_fkey" FOREIGN KEY ("editor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "blog_content_sources" ADD CONSTRAINT "blog_content_sources_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blog_posts"
ADD COLUMN "content_json" JSONB,
ADD COLUMN "content_html" TEXT,
ADD COLUMN "content_text" TEXT;

ALTER TABLE "blog_post_revisions"
ADD COLUMN "content_json" JSONB,
ADD COLUMN "content_html" TEXT,
ADD COLUMN "content_text" TEXT;

UPDATE "blog_posts"
SET "content_text" = "content_markdown"
WHERE "content_text" IS NULL;

UPDATE "blog_post_revisions"
SET "content_text" = "content_markdown"
WHERE "content_text" IS NULL;
ALTER TABLE "blog_post_revisions"
ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_SCHEDULED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_UNPUBLISHED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_REVISION_RESTORED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_POST_DELETED';

CREATE TABLE "blog_media_assets" (
    "id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "alt_text" VARCHAR(255),
    "checksum_sha256" CHAR(64) NOT NULL,
    "data" BYTEA NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_media_assets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "blog_media_assets_byte_size_check" CHECK ("byte_size" > 0 AND "byte_size" <= 5242880)
);

CREATE INDEX "blog_media_assets_created_at_idx" ON "blog_media_assets"("created_at");
CREATE INDEX "blog_media_assets_uploaded_by_id_created_at_idx" ON "blog_media_assets"("uploaded_by_id", "created_at");

ALTER TABLE "blog_media_assets"
ADD CONSTRAINT "blog_media_assets_uploaded_by_id_fkey"
FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Protect concurrent editorial updates.
ALTER TABLE "blog_posts" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- Keep old public URLs working after an editor changes a slug.
CREATE TABLE "blog_post_slugs" (
  "id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_post_slugs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "blog_post_slugs_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "blog_post_slugs_slug_key" ON "blog_post_slugs"("slug");
CREATE INDEX "blog_post_slugs_post_id_created_at_idx" ON "blog_post_slugs"("post_id", "created_at");

-- Record useful image metadata and prevent duplicate binary assets.
ALTER TABLE "blog_media_assets"
  ADD COLUMN "width" INTEGER,
  ADD COLUMN "height" INTEGER,
  ADD COLUMN "caption" VARCHAR(500),
  ADD COLUMN "focal_x" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "focal_y" INTEGER NOT NULL DEFAULT 50;

CREATE INDEX "blog_media_assets_checksum_sha256_idx" ON "blog_media_assets"("checksum_sha256");
ALTER TABLE "blog_media_assets" ADD CONSTRAINT "blog_media_assets_focal_point_check"
  CHECK ("focal_x" BETWEEN 0 AND 100 AND "focal_y" BETWEEN 0 AND 100);

-- Existing ILIKE searches become index-backed without changing Prisma queries.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "blog_posts_title_trgm_idx" ON "blog_posts" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "blog_posts_slug_trgm_idx" ON "blog_posts" USING GIN ("slug" gin_trgm_ops);
CREATE INDEX "blog_posts_content_text_trgm_idx" ON "blog_posts" USING GIN ("content_text" gin_trgm_ops);
ALTER TABLE "blog_posts"
  ADD COLUMN "cta_title" VARCHAR(160),
  ADD COLUMN "cta_description" VARCHAR(500),
  ADD COLUMN "cta_label" VARCHAR(80),
  ADD COLUMN "cta_href" VARCHAR(2048);

ALTER TABLE "blog_media_assets"
  ALTER COLUMN "data" DROP NOT NULL,
  ADD COLUMN "storage_driver" VARCHAR(20) NOT NULL DEFAULT 'database',
  ADD COLUMN "storage_key" VARCHAR(512),
  ADD COLUMN "storage_etag" VARCHAR(128);

CREATE UNIQUE INDEX "blog_media_assets_storage_key_key" ON "blog_media_assets"("storage_key");
ALTER TABLE "blog_media_assets" ADD CONSTRAINT "blog_media_assets_storage_check"
  CHECK (("storage_driver" = 'database' AND "data" IS NOT NULL) OR ("storage_driver" = 's3' AND "storage_key" IS NOT NULL));

CREATE TYPE "BlogAnalyticsEvent" AS ENUM ('VIEW', 'CTA_CLICK');

CREATE TABLE "blog_post_daily_metrics" (
  "id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "unique_views" INTEGER NOT NULL DEFAULT 0,
  "cta_clicks" INTEGER NOT NULL DEFAULT 0,
  "unique_cta_clicks" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "blog_post_daily_metrics_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "blog_post_daily_metrics_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "blog_post_daily_metrics_post_id_date_key" ON "blog_post_daily_metrics"("post_id", "date");
CREATE INDEX "blog_post_daily_metrics_date_idx" ON "blog_post_daily_metrics"("date");

CREATE TABLE "blog_post_analytics_visitors" (
  "id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "event" "BlogAnalyticsEvent" NOT NULL,
  "visitor_hash" CHAR(64) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_post_analytics_visitors_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "blog_post_analytics_visitors_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "blog_post_analytics_visitors_post_id_date_event_visitor_hash_key" ON "blog_post_analytics_visitors"("post_id", "date", "event", "visitor_hash");
CREATE INDEX "blog_post_analytics_visitors_date_idx" ON "blog_post_analytics_visitors"("date");
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'SITE_SEO_UPDATED';

CREATE TABLE "site_seo_settings" (
  "path" VARCHAR(255) NOT NULL,
  "title" VARCHAR(70),
  "description" VARCHAR(170),
  "canonical_url" VARCHAR(2048),
  "og_image_url" VARCHAR(2048),
  "og_image_alt" VARCHAR(255),
  "no_index" BOOLEAN NOT NULL DEFAULT false,
  "updated_by_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "site_seo_settings_pkey" PRIMARY KEY ("path"),
  CONSTRAINT "site_seo_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "site_seo_settings_updated_by_id_idx" ON "site_seo_settings"("updated_by_id");
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'FAQ_SETTINGS_UPDATED';

CREATE TABLE "faq_items" (
  "id" UUID NOT NULL,
  "page_path" VARCHAR(255) NOT NULL,
  "question" VARCHAR(300) NOT NULL,
  "answer" VARCHAR(2000) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "faq_items_page_path_is_active_sort_order_idx"
  ON "faq_items"("page_path", "is_active", "sort_order");

INSERT INTO "faq_items" ("id", "page_path", "question", "answer", "sort_order", "updated_at") VALUES
('10000000-0000-4000-8000-000000000001', '/', 'آیا لازم است همه فرایندهای کسب‌وکارم را تغییر دهم؟', 'خیر. مسیر همکاری از یک مسئله مشخص شروع می‌شود و اتصال سرویس متناسب با فرایند فعلی کسب‌وکار بررسی خواهد شد.', 0, CURRENT_TIMESTAMP),
('10000000-0000-4000-8000-000000000002', '/', 'از کدام سرویس باید شروع کنم؟', 'در مشاوره اولیه، نوع کسب‌وکار، کانال‌های فعلی و مهم‌ترین کار تکراری بررسی می‌شود تا سرویس مناسب پیشنهاد شود.', 1, CURRENT_TIMESTAMP),
('10000000-0000-4000-8000-000000000003', '/', 'کدام سرویس Binix اکنون آماده‌تر است؟', 'فروشنده هوشمند در اولویت ارائه و آماده نمایش دمو است. رزرو نوبت، ماژول‌های BI و تحلیل اکسل هنوز در مسیر توسعه قرار دارند.', 2, CURRENT_TIMESTAMP),
('10000000-0000-4000-8000-000000000004', '/', 'سرویس‌ها چگونه اجرا و مدیریت می‌شوند؟', 'فرایندهای عملیاتی سرویس‌ها در زیرساخت اتوماسیون اجرا می‌شوند و سایت Binix برای معرفی، خرید اشتراک و مدیریت وضعیت سرویس‌ها استفاده می‌شود.', 3, CURRENT_TIMESTAMP),
('10000000-0000-4000-8000-000000000005', '/', 'هزینه سرویس‌ها چگونه محاسبه می‌شود؟', 'مدل قیمت‌گذاری هنوز نهایی نشده است. در این مرحله، نیاز و دامنه راه‌اندازی بررسی می‌شود و از نمایش قیمت غیرقطعی خودداری می‌کنیم.', 4, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000001', '/services/smart-booking', 'نوبت‌دهی هوشمند برای چه کسب‌وکارهایی مناسب است؟', 'برای کسب‌وکارهایی که خدمت آن‌ها به زمان، ظرفیت یا برنامه فرد ارائه‌دهنده وابسته است؛ از کلینیک و سالن تا آموزش، مشاوره و خدمات حضوری.', 0, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000002', '/services/smart-booking', 'ساعت کاری و روزهای تعطیل قابل تنظیم هستند؟', 'بله. ساعات کاری، بازه‌های غیرقابل رزرو، تعطیلی و محدودیت ظرفیت جزو قوانین پایه راه‌اندازی هستند.', 1, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000003', '/services/smart-booking', 'اگر مشتری بخواهد نوبتش را تغییر دهد چه می‌شود؟', 'قواعد لغو و جابه‌جایی در زمان راه‌اندازی مشخص می‌شوند تا تغییرات بدون به‌هم‌ریختن برنامه روزانه مدیریت شوند.', 2, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000004', '/services/smart-booking', 'برای شروع چه اطلاعاتی لازم است؟', 'فهرست خدمات، مدت تقریبی هر خدمت، ساعات کاری، ظرفیت و روش فعلی ثبت نوبت برای بررسی اولیه کافی است.', 3, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000005', '/services/smart-booking', 'آیا برای درخواست بررسی باید حساب Binix داشته باشم؟', 'خیر. ابتدا فرم کوتاه همین صفحه را ثبت کنید؛ ساخت حساب و تنظیمات اجرایی در ادامه مسیر انجام می‌شود.', 4, CURRENT_TIMESTAMP),
('30000000-0000-4000-8000-000000000001', '/services/bi-modules', 'فایل Excel باید چه ساختاری داشته باشد؟', 'ساختار فایل در بررسی اولیه ارزیابی می‌شود. ستون‌های موردنیاز به مدل فروش و شاخص‌های مورد توافق بستگی دارند؛ بنابراین قبل از بررسی، قالب اجباری و یکسانی تحمیل نمی‌کنیم.', 0, CURRENT_TIMESTAMP),
('30000000-0000-4000-8000-000000000002', '/services/bi-modules', 'داشبورد کجا نمایش داده می‌شود؟', 'داشبورد BI در فضای کسب‌وکار شما داخل پنل Binix نمایش داده می‌شود و به یک فایل گزارش جداگانه محدود نیست.', 1, CURRENT_TIMESTAMP),
('30000000-0000-4000-8000-000000000003', '/services/bi-modules', 'اطلاعات با چه فاصله‌ای به‌روزرسانی می‌شوند؟', 'برنامه به‌روزرسانی براساس فرایند تأمین فایل و نیاز مدیریتی شما در مرحله راه‌اندازی تعیین می‌شود. صفحه معرفی وعده به‌روزرسانی لحظه‌ای نمی‌دهد.', 2, CURRENT_TIMESTAMP),
('30000000-0000-4000-8000-000000000004', '/services/bi-modules', 'آیا هر عدد قابل ردیابی است؟', 'تعریف KPI، منبع داده و زمان آخرین به‌روزرسانی باید روشن باشد تا مدیر بتواند به خروجی اعتماد کند و اختلاف‌ها را پیگیری کند.', 3, CURRENT_TIMESTAMP),
('30000000-0000-4000-8000-000000000005', '/services/bi-modules', 'چه کسانی داشبورد را می‌بینند؟', 'نمای BI در بستر کسب‌وکار Binix قرار می‌گیرد و دسترسی آن باید مطابق نقش‌ها و سطح دسترسی اعضای همان کسب‌وکار تنظیم شود.', 4, CURRENT_TIMESTAMP),
('40000000-0000-4000-8000-000000000001', '/services/excel-analyzer', 'چه نوع فایل‌هایی قابل بررسی‌اند؟', 'تمرکز محصول روی فایل‌های جدولی XLSX، XLS و CSV است که ردیف و ستون مشخص دارند. مناسب‌بودن ساختار در بررسی اولیه مشخص می‌شود.', 0, CURRENT_TIMESTAMP),
('40000000-0000-4000-8000-000000000002', '/services/excel-analyzer', 'آیا همین صفحه فایل را دریافت می‌کند؟', 'خیر. فرم این صفحه فقط برای درخواست تحلیل آزمایشی است و هیچ فایل شخصی یا سازمانی در آن بارگذاری نمی‌شود. دریافت فایل پس از هماهنگی و تعیین سیاست پردازش انجام می‌شود.', 1, CURRENT_TIMESTAMP),
('40000000-0000-4000-8000-000000000003', '/services/excel-analyzer', 'چه خروجی‌ای دریافت می‌کنم؟', 'خروجی هدف شامل گزارش کیفیت داده، شاخص‌ها و روندهای متناسب با مسئله، خلاصه مدیریتی و موارد نیازمند بررسی است. خروجی دقیق به ستون‌های موجود بستگی دارد.', 2, CURRENT_TIMESTAMP),
('40000000-0000-4000-8000-000000000004', '/services/excel-analyzer', 'آیا تحلیل AI همیشه قطعی است؟', 'خیر. پیشنهاد و تفسیر باید از واقعیت داده جدا باشد، محدودیت‌ها را نشان دهد و جای قضاوت مدیر یا کارشناس را نگیرد.', 3, CURRENT_TIMESTAMP),
('40000000-0000-4000-8000-000000000005', '/services/excel-analyzer', 'فایل تا چه زمانی نگهداری می‌شود؟', 'پیش از فعال‌شدن دریافت واقعی فایل، دوره نگهداری، حذف و سطح دسترسی باید در قرارداد اجرایی روشن شود. در وضعیت فعلی این صفحه فایلی ذخیره نمی‌کند.', 4, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_MEDIA_UPLOADED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_MEDIA_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'BLOG_MEDIA_DELETED';

ALTER TABLE "blog_media_assets"
ADD COLUMN "is_decorative" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "faq_page_states" (
  "path" VARCHAR(255) NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "faq_page_states_pkey" PRIMARY KEY ("path")
);

INSERT INTO "faq_page_states" ("path", "version", "updated_at") VALUES
('/', 1, CURRENT_TIMESTAMP),
('/services/smart-booking', 1, CURRENT_TIMESTAMP),
('/services/bi-modules', 1, CURRENT_TIMESTAMP),
('/services/excel-analyzer', 1, CURRENT_TIMESTAMP)
ON CONFLICT ("path") DO NOTHING;

-- Test-only content must not become indexable when the public domain is connected.
UPDATE "blog_posts"
SET "status" = 'ARCHIVED', "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" IN ('test', 'text') AND "title" = 'تست';
