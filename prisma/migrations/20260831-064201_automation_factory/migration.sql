CREATE TYPE "AutomationTemplateStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'DISABLED'
);

CREATE TYPE "AutomationInstanceStatus" AS ENUM (
  'CREATING',
  'ACTIVE',
  'SUSPENDED',
  'FAILED',
  'DELETING',
  'DELETED'
);

CREATE TABLE "automation_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "service_id" VARCHAR(80) NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "AutomationTemplateStatus" NOT NULL DEFAULT 'DRAFT',
  "n8n_template_workflow_id" VARCHAR(160) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "automation_templates_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "automation_instances" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL,
  "subscription_id" UUID NOT NULL,
  "service_id" VARCHAR(80) NOT NULL,
  "template_id" UUID NOT NULL,
  "template_version" INTEGER NOT NULL,
  "n8n_workflow_id" VARCHAR(160),
  "status" "AutomationInstanceStatus" NOT NULL DEFAULT 'CREATING',
  "last_error" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "activated_at" TIMESTAMPTZ(3),
  "suspended_at" TIMESTAMPTZ(3),
  "deleted_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "automation_instances_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "automation_templates_service_id_version_key"
  ON "automation_templates"("service_id", "version");

CREATE INDEX "automation_templates_service_id_status_idx"
  ON "automation_templates"("service_id", "status");

CREATE UNIQUE INDEX "automation_instances_subscription_id_key"
  ON "automation_instances"("subscription_id");

CREATE UNIQUE INDEX "automation_instances_n8n_workflow_id_key"
  ON "automation_instances"("n8n_workflow_id");

CREATE INDEX "automation_instances_business_id_service_id_status_idx"
  ON "automation_instances"("business_id", "service_id", "status");

CREATE INDEX "automation_instances_template_id_status_idx"
  ON "automation_instances"("template_id", "status");

CREATE INDEX "automation_instances_service_id_status_idx"
  ON "automation_instances"("service_id", "status");

ALTER TABLE "automation_templates"
  ADD CONSTRAINT "automation_templates_service_id_fkey"
  FOREIGN KEY ("service_id")
  REFERENCES "service_definitions"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "automation_instances"
  ADD CONSTRAINT "automation_instances_business_id_fkey"
  FOREIGN KEY ("business_id")
  REFERENCES "businesses"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "automation_instances"
  ADD CONSTRAINT "automation_instances_subscription_id_fkey"
  FOREIGN KEY ("subscription_id")
  REFERENCES "subscriptions"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "automation_instances"
  ADD CONSTRAINT "automation_instances_service_id_fkey"
  FOREIGN KEY ("service_id")
  REFERENCES "service_definitions"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "automation_instances"
  ADD CONSTRAINT "automation_instances_template_id_fkey"
  FOREIGN KEY ("template_id")
  REFERENCES "automation_templates"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
