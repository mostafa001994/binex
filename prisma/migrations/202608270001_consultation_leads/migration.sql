CREATE TYPE "ConsultationLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED');

CREATE TABLE "consultation_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120),
    "phone" VARCHAR(11) NOT NULL,
    "business_name" VARCHAR(160),
    "business_type" VARCHAR(100),
    "need" VARCHAR(120) NOT NULL,
    "channel" VARCHAR(100),
    "note" VARCHAR(1000),
    "source" VARCHAR(80) NOT NULL DEFAULT 'homepage',
    "status" "ConsultationLeadStatus" NOT NULL DEFAULT 'NEW',
    "consent_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "consultation_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "consultation_leads_status_created_at_idx"
ON "consultation_leads"("status", "created_at");

CREATE INDEX "consultation_leads_phone_created_at_idx"
ON "consultation_leads"("phone", "created_at");
