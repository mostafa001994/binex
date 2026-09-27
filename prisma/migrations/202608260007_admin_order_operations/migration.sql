ALTER TYPE "AuditAction" ADD VALUE 'ORDER_NOTE_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'ORDER_CANCELED';
ALTER TYPE "AuditAction" ADD VALUE 'ORDER_EXPIRED';

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT "id", 'admin.orders.manage' FROM "access_roles"
WHERE "code" IN ('admin', 'super-admin')
ON CONFLICT DO NOTHING;
