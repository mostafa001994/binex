-- CreateTable
CREATE TABLE "notification_providers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(80) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_events" (
    "id" UUID NOT NULL,
    "key" VARCHAR(120) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "module" VARCHAR(80) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL,
    "eventKey" VARCHAR(120) NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "eventKey" VARCHAR(120) NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "receiver" VARCHAR(120) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(40) NOT NULL,
    "providerId" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_providers_channel_enabled_priority_idx" ON "notification_providers"("channel", "enabled", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "notification_events_key_key" ON "notification_events"("key");

-- CreateIndex
CREATE INDEX "notification_templates_eventKey_idx" ON "notification_templates"("eventKey");

-- CreateIndex
CREATE INDEX "notification_logs_eventKey_status_idx" ON "notification_logs"("eventKey", "status");
