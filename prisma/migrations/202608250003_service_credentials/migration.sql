CREATE TABLE "service_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "service_id" VARCHAR(80) NOT NULL,
    "instance_key" VARCHAR(80) NOT NULL DEFAULT 'default',
    "kind" VARCHAR(80) NOT NULL,
    "encrypted_value" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_credentials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_credentials_business_id_service_id_instance_key_kind_key"
ON "service_credentials"("business_id", "service_id", "instance_key", "kind");

CREATE INDEX "service_credentials_service_id_kind_idx"
ON "service_credentials"("service_id", "kind");

ALTER TABLE "service_credentials"
ADD CONSTRAINT "service_credentials_business_id_fkey"
FOREIGN KEY ("business_id")
REFERENCES "businesses"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "service_credentials"
ADD CONSTRAINT "service_credentials_service_id_fkey"
FOREIGN KEY ("service_id")
REFERENCES "service_definitions"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;