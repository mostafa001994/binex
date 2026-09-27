-- DropIndex
DROP INDEX "users_access_role_id_idx";

-- AlterTable
ALTER TABLE "access_roles" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "automation_connectors" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "automation_instances" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "automation_templates" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "consultation_leads" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "provisioning_jobs" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "service_credentials" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "service_plans" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "support_ticket_messages" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "payment_gateways" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "provider" VARCHAR(80) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_slug_key" ON "payment_gateways"("slug");

-- CreateIndex
CREATE INDEX "payment_gateways_enabled_priority_idx" ON "payment_gateways"("enabled", "priority");

-- RenameIndex
ALTER INDEX "service_credentials_business_id_service_id_instance_key_kind_ke" RENAME TO "service_credentials_business_id_service_id_instance_key_kin_key";
