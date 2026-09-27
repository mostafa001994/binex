ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CONSULTATION_LEAD_UPDATED';

ALTER TABLE "consultation_leads"
ADD COLUMN "internal_note" VARCHAR(2000);

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", permission FROM "access_roles"
CROSS JOIN (VALUES ('admin.leads.read'), ('admin.leads.manage')) AS p(permission)
WHERE "code" IN ('admin', 'super-admin', 'support')
ON CONFLICT DO NOTHING;
