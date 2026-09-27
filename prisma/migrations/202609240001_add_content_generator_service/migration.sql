INSERT INTO "service_definitions" (
  "id", "slug", "name", "short_name", "category", "description",
  "app_href", "marketing_href", "availability", "status", "visibility",
  "accent", "icon_key", "sort_order", "features", "created_at", "updated_at"
)
VALUES (
  'content-generator',
  'ai-content',
  'تولید محتوای هوشمند',
  'تولید محتوا',
  'بازاریابی محتوایی',
  'تولید محتوای هدفمند براساس کلمات کلیدی و منابع منتخب و آماده‌سازی برای انتشار در سایت شما.',
  '/app/services/content-generator',
  '/services/ai-content',
  'AVAILABLE',
  'ACTIVE',
  'PUBLIC',
  '#F97316',
  'sparkles',
  50,
  '["تعریف کلمات کلیدی هدف", "ثبت URL منابع منتخب", "اتصال امن به سایت مقصد", "آماده‌سازی محتوا برای انتشار"]'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "short_name" = EXCLUDED."short_name",
  "category" = EXCLUDED."category",
  "description" = EXCLUDED."description",
  "app_href" = EXCLUDED."app_href",
  "marketing_href" = EXCLUDED."marketing_href",
  "availability" = EXCLUDED."availability",
  "status" = EXCLUDED."status",
  "visibility" = EXCLUDED."visibility",
  "accent" = EXCLUDED."accent",
  "icon_key" = EXCLUDED."icon_key",
  "sort_order" = EXCLUDED."sort_order",
  "features" = EXCLUDED."features",
  "updated_at" = CURRENT_TIMESTAMP;
