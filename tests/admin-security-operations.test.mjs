import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("admin permission matrix separates admin and super-admin", async () => {
  const permissions = await source(
    "src/lib/admin-permissions.ts",
  );

  assert.match(permissions, /admin\.roles\.manage/);
  assert.match(permissions, /super-admin/);
  assert.match(permissions, /admin\.system\.read/);
  assert.match(permissions, /support:/);
  assert.match(permissions, /finance:/);
  assert.doesNotMatch(
    permissions.match(/support:[\s\S]*?finance:/)?.[0] ?? "",
    /admin\.roles\.manage/,
  );
});

test("support and finance remain distinct application roles", async () => {
  const roles = await source("src/lib/roles.ts");
  const repository = await source(
    "src/server/repositories/database/database-user-repository.ts",
  );
  const userPage = await source("src/app/admin/users/page.tsx");

  assert.match(roles, /"support"/);
  assert.match(roles, /"finance"/);
  assert.match(repository, /SystemRole\.SUPPORT/);
  assert.match(repository, /return "support"/);
  assert.match(repository, /SystemRole\.FINANCE/);
  assert.match(repository, /return "finance"/);
  assert.match(userPage, /getAdminRoleOptionsApi/);
  assert.match(userPage, /roleId/);
});

test("role management uses explicit permission", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(service, /admin\.roles\.manage/);
  assert.match(service, /requireSuperAdmin/);
});

test("audit repository supports filters and pagination", async () => {
  const contract = await source(
    "src/server/repositories/contracts/audit-repository.ts",
  );

  assert.match(contract, /action\?/);
  assert.match(contract, /actorUserId\?/);
  assert.match(contract, /actorQuery\?/);
  assert.match(contract, /targetType\?/);
  assert.match(contract, /from\?/);
  assert.match(contract, /to\?/);
  assert.match(contract, /pageSize\?/);
});

test("admin system only exposes encryption configured state, not secret value", async () => {
  const service = await source(
    "src/server/admin/admin-system-service.ts",
  );

  assert.match(service, /credentialsEncryptionConfigured/);
  assert.match(
    service,
    /credentialsEncryptionConfigured:\s*Boolean\(\s*process\.env\.BINIX_CREDENTIALS_ENCRYPTION_KEY/,
  );

  // The raw key must never be returned as an object field/value.
  assert.doesNotMatch(
    service,
    /credentialsEncryptionKey\s*:/i,
  );
  assert.doesNotMatch(
    service,
    /encryptionKey\s*:\s*process\.env\.BINIX_CREDENTIALS_ENCRYPTION_KEY/i,
  );
  assert.doesNotMatch(
    service,
    /return\s+process\.env\.BINIX_CREDENTIALS_ENCRYPTION_KEY/i,
  );
});

test("admin system reports runtime driver information", async () => {
  const service = await source(
    "src/server/admin/admin-system-service.ts",
  );

  assert.match(service, /BINIX_DATA_DRIVER/);
  assert.match(service, /BINIX_OTP_DRIVER/);
  assert.match(service, /repositoryMode/);
});

test("audit page exposes operational filters", async () => {
  const page = await source(
    "src/app/admin/audit/page.tsx",
  );

  assert.match(page, /نام، موبایل یا شناسه عامل/);
  assert.match(page, /شناسه هدف/);
  assert.match(page, /AUDIT_ACTION_LABELS/);
  assert.match(page, /AUDIT_TARGET_LABELS/);
  assert.match(page, /PersianDateFilter/);
  assert.match(page, /AuditMetadata/);
  assert.doesNotMatch(page, /JSON\.stringify/);
});

test("audit dates use Persian calendar and Tehran boundaries", async () => {
  const dates = await source("src/lib/persian-date.ts");
  const page = await source("src/app/admin/audit/page.tsx");

  assert.match(dates, /u-ca-persian/);
  assert.match(dates, /Asia\/Tehran/);
  assert.match(dates, /\+03:30/);
  assert.match(page, /formatTehranPersianDateTime/);
  assert.match(page, /۱۴۰۵\/۰۶\/۰۳/);
});

test("audit API validates filters, dates and pagination", async () => {
  const route = await source(
    "src/app/api/v1/admin/audit/route.ts",
  );

  assert.match(route, /isAuditAction/);
  assert.match(route, /isAuditTargetType/);
  assert.match(route, /Date\.parse/);
  assert.match(route, /Number\.isInteger\(page\)/);
  assert.match(route, /pageSize > 100/);
});

test("audit entries capture request context and redact sensitive metadata", async () => {
  const context = await source(
    "src/server/core/request-context.ts",
  );
  const handler = await source(
    "src/server/core/route-handler.ts",
  );
  const repository = await source(
    "src/server/repositories/database/database-audit-repository.ts",
  );
  const auditTypes = await source(
    "src/server/admin/audit-types.ts",
  );

  assert.match(context, /AsyncLocalStorage/);
  assert.match(handler, /runWithRequestContext/);
  assert.match(repository, /getRequestContext/);
  assert.match(repository, /requestId:\s*input\.requestId/);
  assert.match(repository, /sanitizeAuditMetadata/);
  assert.match(auditTypes, /SENSITIVE_METADATA_KEY/);
  assert.match(auditTypes, /\[REDACTED\]/);
});

test("audit storage migration is additive and indexed by request id", async () => {
  const migration = await source(
    "prisma/migrations/202608250004_audit_request_context/migration.sql",
  );

  assert.match(migration, /ADD COLUMN\s+"request_id"/i);
  assert.match(migration, /ADD COLUMN\s+"ip_address"/i);
  assert.match(migration, /ADD COLUMN\s+"user_agent"/i);
  assert.match(migration, /CREATE INDEX/i);
  assert.doesNotMatch(migration, /DROP\s+(TABLE|COLUMN)/i);
});
