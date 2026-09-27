ALTER TABLE "support_tickets"
ADD COLUMN "first_response_due_at" TIMESTAMPTZ(3),
ADD COLUMN "resolution_due_at" TIMESTAMPTZ(3),
ADD COLUMN "first_responded_at" TIMESTAMPTZ(3);

UPDATE "support_tickets"
SET "first_response_due_at" = "created_at" + INTERVAL '4 hours',
    "resolution_due_at" = "created_at" + INTERVAL '48 hours';

ALTER TABLE "support_tickets"
ALTER COLUMN "first_response_due_at" SET NOT NULL,
ALTER COLUMN "resolution_due_at" SET NOT NULL;

CREATE INDEX "support_tickets_status_first_response_due_at_idx"
ON "support_tickets"("status", "first_response_due_at");
CREATE INDEX "support_tickets_status_resolution_due_at_idx"
ON "support_tickets"("status", "resolution_due_at");
