ALTER TYPE "AuditAction" ADD VALUE 'ACCESS_ROLE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'ACCESS_ROLE_UPDATED';

CREATE TABLE "access_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "system_role" "SystemRole",
    "is_protected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "access_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "access_roles_code_key" ON "access_roles"("code");
CREATE UNIQUE INDEX "access_roles_system_role_key" ON "access_roles"("system_role");

CREATE TABLE "access_role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_code" VARCHAR(100) NOT NULL,
    CONSTRAINT "access_role_permissions_pkey" PRIMARY KEY ("role_id", "permission_code")
);
CREATE INDEX "access_role_permissions_permission_code_idx" ON "access_role_permissions"("permission_code");
ALTER TABLE "access_role_permissions" ADD CONSTRAINT "access_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "access_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "access_roles" ("code", "name", "description", "system_role", "is_protected") VALUES
('user', 'کاربر', 'دسترسی عادی پنل کاربری', 'USER', false),
('support', 'پشتیبانی', 'مشاهده کاربران، کسب‌وکارها و وضعیت عملیات', 'SUPPORT', false),
('finance', 'مالی', 'مشاهده پلن‌ها، اشتراک‌ها، سفارش‌ها و گزارش‌ها', 'FINANCE', false),
('admin', 'مدیر', 'مدیریت عملیاتی سامانه بدون مدیریت نقش‌ها', 'ADMIN', false),
('super-admin', 'مدیر ارشد', 'دسترسی کامل و حفاظت‌شده سامانه', 'SUPER_ADMIN', true);

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code FROM "access_roles" r CROSS JOIN (VALUES
('admin.dashboard.read'),('admin.users.read'),('admin.users.manage'),('admin.businesses.read'),('admin.businesses.manage'),
('admin.services.manage'),('admin.audit.read'),('admin.system.read'),('admin.catalog.manage'),('admin.catalog.read'),
('admin.plans.read'),('admin.plans.manage'),('admin.subscriptions.read'),('admin.subscriptions.manage'),('admin.orders.read'),
('admin.provisioning.read'),('admin.provisioning.manage'),('admin.roles.manage')
) AS p(code) WHERE r.code = 'super-admin';

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code FROM "access_roles" r CROSS JOIN (VALUES
('admin.dashboard.read'),('admin.users.read'),('admin.users.manage'),('admin.businesses.read'),('admin.businesses.manage'),
('admin.services.manage'),('admin.audit.read'),('admin.system.read'),('admin.catalog.manage'),('admin.catalog.read'),
('admin.plans.read'),('admin.plans.manage'),('admin.subscriptions.read'),('admin.subscriptions.manage'),('admin.orders.read'),
('admin.provisioning.read'),('admin.provisioning.manage')
) AS p(code) WHERE r.code = 'admin';

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code FROM "access_roles" r CROSS JOIN (VALUES
('admin.dashboard.read'),('admin.users.read'),('admin.businesses.read'),('admin.audit.read'),('admin.system.read'),
('admin.subscriptions.read'),('admin.orders.read'),('admin.provisioning.read')
) AS p(code) WHERE r.code = 'support';

INSERT INTO "access_role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code FROM "access_roles" r CROSS JOIN (VALUES
('admin.dashboard.read'),('admin.users.read'),('admin.businesses.read'),('admin.audit.read'),('admin.plans.read'),
('admin.catalog.read'),('admin.subscriptions.read'),('admin.orders.read')
) AS p(code) WHERE r.code = 'finance';

ALTER TABLE "users" ADD COLUMN "access_role_id" UUID;
UPDATE "users" u SET "access_role_id" = r.id FROM "access_roles" r WHERE r."system_role" = u."system_role";
ALTER TABLE "users" ALTER COLUMN "access_role_id" SET NOT NULL;
CREATE INDEX "users_access_role_id_idx" ON "users"("access_role_id");
ALTER TABLE "users" ADD CONSTRAINT "users_access_role_id_fkey" FOREIGN KEY ("access_role_id") REFERENCES "access_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
