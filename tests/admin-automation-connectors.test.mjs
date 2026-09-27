import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("automation connector secrets are encrypted and never returned", async () => {
  const service = await source("src/server/admin/admin-automation-service.ts");
  assert.match(service, /encryptSecret\(endpoint\)/);
  assert.match(service, /encryptSecret\(authSecret\)/);
  assert.match(service, /endpointConfigured/);
  assert.match(service, /authSecretConfigured/);
  assert.doesNotMatch(service, /decryptSecret/);
});

test("automation setup does not make network requests before contracts are known", async () => {
  const service = await source("src/server/admin/admin-automation-service.ts");
  assert.doesNotMatch(service, /fetch\s*\(/);
  assert.doesNotMatch(service, /axios|request\s*\(/);
});

test("provisioning retry requires an active configured connector", async () => {
  const service = await source("src/server/admin/admin-provisioning-service.ts");
  assert.match(service, /AutomationConnectorStatus\.ACTIVE/);
  assert.match(service, /endpointEncrypted/);
  assert.match(service, /مرکز اتوماسیون/);
});

test("automation migration stores endpoint and auth secret encrypted", async () => {
  const migration = await source("prisma/migrations/202608260009_automation_connectors/migration.sql");
  assert.match(migration, /endpoint_encrypted/);
  assert.match(migration, /auth_secret_encrypted/);
  assert.doesNotMatch(migration, /endpoint_url|auth_token/);
});
