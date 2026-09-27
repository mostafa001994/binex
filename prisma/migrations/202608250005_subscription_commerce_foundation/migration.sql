-- Subscription commerce foundation. This migration is additive and does not mutate existing rows.

CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELED', 'EXPIRED');
CREATE TYPE "ProvisioningStatus" AS ENUM ('NOT_STARTED', 'QUEUED', 'IN_PROGRESS', 'READY', 'FAILED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'CANCELED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "OrderItemType" AS ENUM ('NEW_SUBSCRIPTION', 'RENEWAL', 'UPGRADE');
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "ProvisioningAction" AS ENUM ('ACTIVATE', 'UPDATE', 'SUSPEND', 'CANCEL');
CREATE TYPE "ProvisioningJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED');

CREATE TABLE "service_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" VARCHAR(80) NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "billing_period" "BillingPeriod" NOT NULL,
    "custom_duration_days" INTEGER,
    "price_amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'IRR',
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "service_plans_price_amount_check" CHECK ("price_amount" >= 0),
    CONSTRAINT "service_plans_trial_days_check" CHECK ("trial_days" >= 0),
    CONSTRAINT "service_plans_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "service_plans_custom_duration_check" CHECK (
        ("billing_period" = 'CUSTOM' AND "custom_duration_days" IS NOT NULL AND "custom_duration_days" > 0)
        OR
        ("billing_period" <> 'CUSTOM' AND "custom_duration_days" IS NULL)
    )
);

CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "service_id" VARCHAR(80) NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "provisioning_status" "ProvisioningStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "plan_code_snapshot" VARCHAR(80) NOT NULL,
    "plan_name_snapshot" VARCHAR(120) NOT NULL,
    "billing_period" "BillingPeriod" NOT NULL,
    "custom_duration_days" INTEGER,
    "price_amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'IRR',
    "starts_at" TIMESTAMPTZ(3),
    "current_period_starts_at" TIMESTAMPTZ(3),
    "current_period_ends_at" TIMESTAMPTZ(3),
    "trial_ends_at" TIMESTAMPTZ(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMPTZ(3),
    "ended_at" TIMESTAMPTZ(3),
    "external_reference" VARCHAR(120),
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_price_amount_check" CHECK ("price_amount" >= 0),
    CONSTRAINT "subscriptions_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "subscriptions_custom_duration_check" CHECK (
        ("billing_period" = 'CUSTOM' AND "custom_duration_days" IS NOT NULL AND "custom_duration_days" > 0)
        OR
        ("billing_period" <> 'CUSTOM' AND "custom_duration_days" IS NULL)
    ),
    CONSTRAINT "subscriptions_period_check" CHECK (
        "current_period_starts_at" IS NULL
        OR "current_period_ends_at" IS NULL
        OR "current_period_ends_at" > "current_period_starts_at"
    )
);

CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_number" VARCHAR(40) NOT NULL,
    "business_id" UUID NOT NULL,
    "created_by_user_id" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "currency" CHAR(3) NOT NULL DEFAULT 'IRR',
    "subtotal_amount" BIGINT NOT NULL,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "tax_amount" BIGINT NOT NULL DEFAULT 0,
    "total_amount" BIGINT NOT NULL,
    "expires_at" TIMESTAMPTZ(3),
    "paid_at" TIMESTAMPTZ(3),
    "canceled_at" TIMESTAMPTZ(3),
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_amounts_check" CHECK (
        "subtotal_amount" >= 0
        AND "discount_amount" >= 0
        AND "tax_amount" >= 0
        AND "discount_amount" <= "subtotal_amount"
        AND "total_amount" = "subtotal_amount" - "discount_amount" + "tax_amount"
    ),
    CONSTRAINT "orders_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$')
);

CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "service_id" VARCHAR(80) NOT NULL,
    "plan_id" UUID NOT NULL,
    "subscription_id" UUID,
    "type" "OrderItemType" NOT NULL DEFAULT 'NEW_SUBSCRIPTION',
    "service_name_snapshot" VARCHAR(120) NOT NULL,
    "plan_code_snapshot" VARCHAR(80) NOT NULL,
    "plan_name_snapshot" VARCHAR(120) NOT NULL,
    "billing_period_snapshot" "BillingPeriod" NOT NULL,
    "custom_duration_days" INTEGER,
    "unit_amount" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total_amount" BIGINT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_amounts_check" CHECK (
        "unit_amount" >= 0
        AND "quantity" > 0
        AND "total_amount" = "unit_amount" * "quantity"
    ),
    CONSTRAINT "order_items_custom_duration_check" CHECK (
        ("billing_period_snapshot" = 'CUSTOM' AND "custom_duration_days" IS NOT NULL AND "custom_duration_days" > 0)
        OR
        ("billing_period_snapshot" <> 'CUSTOM' AND "custom_duration_days" IS NULL)
    )
);

CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "provider" VARCHAR(80) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "amount" BIGINT NOT NULL,
    "refunded_amount" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'IRR',
    "idempotency_key" VARCHAR(120) NOT NULL,
    "provider_payment_id" VARCHAR(160),
    "provider_reference" VARCHAR(160),
    "failure_code" VARCHAR(80),
    "failure_message" VARCHAR(500),
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMPTZ(3),
    "failed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_amounts_check" CHECK (
        "amount" > 0
        AND "refunded_amount" >= 0
        AND "refunded_amount" <= "amount"
    ),
    CONSTRAINT "payments_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$')
);

CREATE TABLE "provisioning_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscription_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "service_id" VARCHAR(80) NOT NULL,
    "action" "ProvisioningAction" NOT NULL,
    "status" "ProvisioningJobStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" VARCHAR(160) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "next_attempt_at" TIMESTAMPTZ(3),
    "locked_at" TIMESTAMPTZ(3),
    "n8n_execution_id" VARCHAR(160),
    "last_error" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "provisioning_jobs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "provisioning_jobs_attempts_check" CHECK (
        "attempt_count" >= 0
        AND "max_attempts" > 0
        AND "attempt_count" <= "max_attempts"
    )
);

CREATE UNIQUE INDEX "service_plans_service_id_code_key" ON "service_plans"("service_id", "code");
CREATE INDEX "service_plans_service_id_status_sort_order_idx" ON "service_plans"("service_id", "status", "sort_order");

CREATE INDEX "subscriptions_business_id_status_current_period_ends_at_idx" ON "subscriptions"("business_id", "status", "current_period_ends_at");
CREATE INDEX "subscriptions_service_id_status_idx" ON "subscriptions"("service_id", "status");
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");
CREATE UNIQUE INDEX "subscriptions_one_open_per_business_service_key"
    ON "subscriptions"("business_id", "service_id")
    WHERE "status" IN ('PENDING', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED');

CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_business_id_status_created_at_idx" ON "orders"("business_id", "status", "created_at");
CREATE INDEX "orders_created_by_user_id_created_at_idx" ON "orders"("created_by_user_id", "created_at");

CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_service_id_plan_id_idx" ON "order_items"("service_id", "plan_id");
CREATE INDEX "order_items_subscription_id_idx" ON "order_items"("subscription_id");

CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");
CREATE UNIQUE INDEX "payments_provider_provider_reference_key" ON "payments"("provider", "provider_reference");
CREATE INDEX "payments_order_id_status_created_at_idx" ON "payments"("order_id", "status", "created_at");
CREATE INDEX "payments_provider_provider_payment_id_idx" ON "payments"("provider", "provider_payment_id");

CREATE UNIQUE INDEX "provisioning_jobs_idempotency_key_key" ON "provisioning_jobs"("idempotency_key");
CREATE INDEX "provisioning_jobs_status_next_attempt_at_created_at_idx" ON "provisioning_jobs"("status", "next_attempt_at", "created_at");
CREATE INDEX "provisioning_jobs_subscription_id_created_at_idx" ON "provisioning_jobs"("subscription_id", "created_at");
CREATE INDEX "provisioning_jobs_business_id_service_id_status_idx" ON "provisioning_jobs"("business_id", "service_id", "status");

ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "service_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "service_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "provisioning_jobs" ADD CONSTRAINT "provisioning_jobs_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provisioning_jobs" ADD CONSTRAINT "provisioning_jobs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "provisioning_jobs" ADD CONSTRAINT "provisioning_jobs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
