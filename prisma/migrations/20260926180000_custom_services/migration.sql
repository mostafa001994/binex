ALTER TYPE "OrderItemType" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_OFFER_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_OFFER_SENT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_OFFER_CANCELED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOM_SERVICE_OFFER_PAID';

CREATE TYPE "CustomServiceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "CustomServiceOfferStatus" AS ENUM ('DRAFT', 'SENT', 'PAYMENT_PENDING', 'PAID', 'EXPIRED', 'CANCELED');
CREATE TYPE "CustomServiceSubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

CREATE TABLE "custom_services" (
  "id" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "short_name" VARCHAR(80) NOT NULL,
  "description" TEXT NOT NULL,
  "features" JSONB NOT NULL DEFAULT '[]',
  "app_href" VARCHAR(255),
  "accent" VARCHAR(40) NOT NULL DEFAULT '#078BFF',
  "icon_key" VARCHAR(80) NOT NULL DEFAULT 'sparkles',
  "status" "CustomServiceStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "custom_services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "custom_service_offers" (
  "id" UUID NOT NULL,
  "custom_service_id" UUID NOT NULL,
  "business_id" UUID NOT NULL,
  "created_by_user_id" UUID NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "description" TEXT NOT NULL,
  "terms" TEXT,
  "features" JSONB NOT NULL DEFAULT '[]',
  "status" "CustomServiceOfferStatus" NOT NULL DEFAULT 'DRAFT',
  "price_amount" BIGINT NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'IRR',
  "billing_period" "BillingPeriod" NOT NULL,
  "custom_duration_days" INTEGER,
  "valid_until" TIMESTAMPTZ(3) NOT NULL,
  "sent_at" TIMESTAMPTZ(3),
  "paid_at" TIMESTAMPTZ(3),
  "canceled_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "custom_service_offers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "custom_service_subscriptions" (
  "id" UUID NOT NULL,
  "offer_id" UUID NOT NULL,
  "custom_service_id" UUID NOT NULL,
  "business_id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "status" "CustomServiceSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "service_name_snapshot" VARCHAR(120) NOT NULL,
  "offer_title_snapshot" VARCHAR(160) NOT NULL,
  "description_snapshot" TEXT NOT NULL,
  "features_snapshot" JSONB NOT NULL DEFAULT '[]',
  "price_amount" BIGINT NOT NULL,
  "currency" CHAR(3) NOT NULL DEFAULT 'IRR',
  "billing_period" "BillingPeriod" NOT NULL,
  "custom_duration_days" INTEGER,
  "starts_at" TIMESTAMPTZ(3) NOT NULL,
  "ends_at" TIMESTAMPTZ(3) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "custom_service_subscriptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "order_items" ALTER COLUMN "service_id" DROP NOT NULL;
ALTER TABLE "order_items" ALTER COLUMN "plan_id" DROP NOT NULL;
ALTER TABLE "order_items" ADD COLUMN "custom_service_offer_id" UUID;
ALTER TABLE "order_items" ADD COLUMN "custom_subscription_id" UUID;

CREATE UNIQUE INDEX "custom_service_subscriptions_offer_id_key" ON "custom_service_subscriptions"("offer_id");
CREATE UNIQUE INDEX "custom_service_subscriptions_order_id_key" ON "custom_service_subscriptions"("order_id");
CREATE INDEX "custom_services_status_created_at_idx" ON "custom_services"("status", "created_at");
CREATE INDEX "custom_service_offers_business_id_status_valid_until_idx" ON "custom_service_offers"("business_id", "status", "valid_until");
CREATE INDEX "custom_service_offers_custom_service_id_status_idx" ON "custom_service_offers"("custom_service_id", "status");
CREATE INDEX "custom_service_subscriptions_business_id_status_ends_at_idx" ON "custom_service_subscriptions"("business_id", "status", "ends_at");
CREATE INDEX "custom_service_subscriptions_custom_service_id_status_idx" ON "custom_service_subscriptions"("custom_service_id", "status");
CREATE INDEX "order_items_custom_service_offer_id_idx" ON "order_items"("custom_service_offer_id");
CREATE INDEX "order_items_custom_subscription_id_idx" ON "order_items"("custom_subscription_id");

ALTER TABLE "custom_service_offers" ADD CONSTRAINT "custom_service_offers_custom_service_id_fkey" FOREIGN KEY ("custom_service_id") REFERENCES "custom_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "custom_service_offers" ADD CONSTRAINT "custom_service_offers_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "custom_service_offers" ADD CONSTRAINT "custom_service_offers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "custom_service_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_custom_service_id_fkey" FOREIGN KEY ("custom_service_id") REFERENCES "custom_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "custom_service_subscriptions" ADD CONSTRAINT "custom_service_subscriptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_custom_service_offer_id_fkey" FOREIGN KEY ("custom_service_offer_id") REFERENCES "custom_service_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_custom_subscription_id_fkey" FOREIGN KEY ("custom_subscription_id") REFERENCES "custom_service_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
