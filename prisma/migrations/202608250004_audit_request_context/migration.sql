ALTER TABLE "audit_logs"
ADD COLUMN "request_id" UUID,
ADD COLUMN "ip_address" VARCHAR(64),
ADD COLUMN "user_agent" VARCHAR(512);

CREATE INDEX "audit_logs_request_id_idx"
ON "audit_logs"("request_id");
