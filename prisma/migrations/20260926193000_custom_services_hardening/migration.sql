ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_OFFER_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_OFFER_EXPIRED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_SUBSCRIPTION_PAUSED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_SUBSCRIPTION_RESUMED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_SUBSCRIPTION_ENDED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_SUBSCRIPTION_EXTENDED';

ALTER TABLE "custom_service_offers" ADD COLUMN "terms_accepted_at" TIMESTAMPTZ(3);
ALTER TABLE "custom_service_offers" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "custom_service_subscriptions" ADD COLUMN "paused_at" TIMESTAMPTZ(3);
ALTER TABLE "custom_service_subscriptions" ADD COLUMN "ended_at" TIMESTAMPTZ(3);

ALTER TABLE "custom_service_offers" ADD CONSTRAINT "custom_service_offers_price_positive" CHECK ("price_amount" > 0);
ALTER TABLE "custom_service_offers" ADD CONSTRAINT "custom_service_offers_duration_valid" CHECK (
  ("billing_period" = 'CUSTOM' AND "custom_duration_days" BETWEEN 1 AND 3650)
  OR ("billing_period" <> 'CUSTOM' AND "custom_duration_days" IS NULL)
);
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_price_positive" CHECK ("price_amount" > 0);
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_dates_valid" CHECK ("ends_at" > "starts_at");
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_duration_valid" CHECK (
  ("billing_period" = 'CUSTOM' AND "custom_duration_days" BETWEEN 1 AND 3650)
  OR ("billing_period" <> 'CUSTOM' AND "custom_duration_days" IS NULL)
);

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", 'admin.custom-services.read' FROM "access_roles"
WHERE "code" IN ('finance', 'admin', 'super-admin') ON CONFLICT DO NOTHING;

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", 'admin.custom-services.manage' FROM "access_roles"
WHERE "code" IN ('admin', 'super-admin') ON CONFLICT DO NOTHING;
