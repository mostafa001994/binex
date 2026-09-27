CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "NotificationKind" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'SUPPORT_TICKET_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'SUPPORT_TICKET_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'SUPPORT_TICKET_REPLIED';

CREATE TABLE "support_tickets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "ticket_number" VARCHAR(40) NOT NULL,
  "business_id" UUID NOT NULL, "created_by_user_id" UUID NOT NULL, "assigned_to_user_id" UUID,
  "subject" VARCHAR(180) NOT NULL, "category" VARCHAR(80) NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN', "priority" "SupportTicketPriority" NOT NULL DEFAULT 'NORMAL',
  "last_message_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMPTZ(3), "closed_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "support_ticket_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "ticket_id" UUID NOT NULL, "author_user_id" UUID NOT NULL,
  "body" TEXT NOT NULL, "is_internal" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL,
  "kind" "NotificationKind" NOT NULL DEFAULT 'INFO', "title" VARCHAR(160) NOT NULL,
  "message" VARCHAR(500) NOT NULL, "href" VARCHAR(255), "read_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");
CREATE INDEX "support_tickets_status_priority_last_message_at_idx" ON "support_tickets"("status", "priority", "last_message_at");
CREATE INDEX "support_tickets_business_id_created_at_idx" ON "support_tickets"("business_id", "created_at");
CREATE INDEX "support_tickets_created_by_user_id_created_at_idx" ON "support_tickets"("created_by_user_id", "created_at");
CREATE INDEX "support_tickets_assigned_to_user_id_status_idx" ON "support_tickets"("assigned_to_user_id", "status");
CREATE INDEX "support_ticket_messages_ticket_id_created_at_idx" ON "support_ticket_messages"("ticket_id", "created_at");
CREATE INDEX "support_ticket_messages_author_user_id_created_at_idx" ON "support_ticket_messages"("author_user_id", "created_at");
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", permission FROM "access_roles"
CROSS JOIN (VALUES ('admin.support.read'), ('admin.support.manage'), ('admin.notifications.read')) AS p(permission)
WHERE "code" IN ('admin', 'super-admin', 'support') ON CONFLICT DO NOTHING;
INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", 'admin.notifications.read' FROM "access_roles" WHERE "code" = 'finance' ON CONFLICT DO NOTHING;
