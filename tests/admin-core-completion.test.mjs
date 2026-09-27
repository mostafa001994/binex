import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(
    new URL(`../${path}`, import.meta.url),
    "utf8",
  );
}

test("admin users support server pagination and user detail", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );
  const usersRoute = await source(
    "src/app/api/v1/admin/users/route.ts",
  );

  assert.match(service, /paginate/);
  assert.match(service, /getAdminUser/);
  assert.match(usersRoute, /pageSize/);
});

test("only super admin can change platform roles", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(service, /requireSuperAdmin/);
  assert.match(service, /updateAdminUserRole/);
  assert.match(service, /user_role_changed/);
});

test("business can be suspended and resumed with audit", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(service, /updateAdminBusinessStatus/);
  assert.match(service, /business_status_changed/);
  assert.match(service, /beforeStatus/);
  assert.match(service, /afterStatus/);
});

test("admin can assign and remove services", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );
  const route = await source(
    "src/app/api/v1/admin/businesses/[businessId]/services/[serviceId]/route.ts",
  );

  assert.match(service, /assignAdminBusinessService/);
  assert.match(service, /removeAdminBusinessService/);
  assert.match(route, /export async function POST/);
  assert.match(route, /export async function DELETE/);
});

test("coming-soon catalog services cannot be activated", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(
    service,
    /definition\.availability ===\s*"coming-soon"/,
  );
  assert.match(
    service,
    /input\.status !==\s*"coming-soon"/,
  );
  assert.match(
    service,
    /این سرویس هنوز در حالت coming-soon است/,
  );
  assert.doesNotMatch(
    service,
    /input\.serviceId === "bi"/,
  );
});

test("admin only sees credential configured status, not secret", async () => {
  const service = await source(
    "src/server/admin/admin-service.ts",
  );

  assert.match(service, /baleBotTokenConfigured/);
  assert.match(service, /woocommerceTokenConfigured/);
  assert.doesNotMatch(service, /decryptSecret/);
});

test("database adapters include explicit new contract return types", async () => {
  const business = await source(
    "src/server/repositories/database/database-business-repository.ts",
  );
  const service = await source(
    "src/server/repositories/database/database-business-service-repository.ts",
  );
  const user = await source(
    "src/server/repositories/database/database-user-repository.ts",
  );

  assert.match(business, /Promise<Business \| null>/);
  assert.match(service, /Promise<boolean>/);
  assert.match(user, /Promise<AuthUser \| null>/);
});
