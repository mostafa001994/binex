-- CreateTable
CREATE TABLE "notification_rules" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "eventKey" VARCHAR(120) NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_rules_eventKey_enabled_idx" ON "notification_rules"("eventKey", "enabled");
