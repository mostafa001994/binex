UPDATE "service_definitions"
SET
  "availability" = 'AVAILABLE',
  "app_href" = '/app/services/bi',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'bi';
