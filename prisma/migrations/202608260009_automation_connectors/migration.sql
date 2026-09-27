CREATE TYPE "AutomationConnectorStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'AUTOMATION_CONNECTOR_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'AUTOMATION_CONNECTOR_CLEARED';

CREATE TABLE "automation_connectors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "service_id" VARCHAR(80) NOT NULL,
  "status" "AutomationConnectorStatus" NOT NULL DEFAULT 'DRAFT',
  "endpoint_encrypted" TEXT,
  "auth_secret_encrypted" TEXT,
  "contract_version" VARCHAR(20) NOT NULL DEFAULT 'v1',
  "timeout_seconds" INTEGER NOT NULL DEFAULT 30,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "automation_connectors_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "automation_connectors_timeout_check" CHECK ("timeout_seconds" BETWEEN 5 AND 120)
);

CREATE UNIQUE INDEX "automation_connectors_service_id_key" ON "automation_connectors"("service_id");
CREATE INDEX "automation_connectors_status_idx" ON "automation_connectors"("status");

ALTER TABLE "automation_connectors"
  ADD CONSTRAINT "automation_connectors_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "service_definitions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
