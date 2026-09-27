import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("subscription commerce schema covers plans, subscriptions, orders and payments", async () => {
  const schema = await source("prisma/schema.prisma");

  for (const model of [
    "ServicePlan",
    "Subscription",
    "Order",
    "OrderItem",
    "Payment",
    "ProvisioningJob",
  ]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }

  assert.match(schema, /enum BillingPeriod/);
  assert.match(schema, /MONTHLY/);
  assert.match(schema, /QUARTERLY/);
  assert.match(schema, /YEARLY/);
  assert.match(schema, /CUSTOM/);
});

test("financial records preserve price and plan snapshots", async () => {
  const schema = await source("prisma/schema.prisma");

  assert.match(schema, /planCodeSnapshot/);
  assert.match(schema, /planNameSnapshot/);
  assert.match(schema, /serviceNameSnapshot/);
  assert.match(schema, /billingPeriodSnapshot/);
  assert.match(schema, /unitAmount\s+BigInt/);
  assert.match(schema, /totalAmount\s+BigInt/);
  assert.match(schema, /currency\s+String\s+@default\("IRR"\)/);
});

test("subscription migration enforces one open subscription per business service", async () => {
  const migration = await source(
    "prisma/migrations/202608250005_subscription_commerce_foundation/migration.sql",
  );

  assert.match(migration, /subscriptions_one_open_per_business_service_key/);
  assert.match(migration, /WHERE "status" IN \('PENDING', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED'\)/);
});

test("payments and n8n provisioning are idempotent and retryable", async () => {
  const schema = await source("prisma/schema.prisma");
  const migration = await source(
    "prisma/migrations/202608250005_subscription_commerce_foundation/migration.sql",
  );

  assert.match(schema, /idempotencyKey\s+String\s+@unique/);
  assert.match(schema, /attemptCount\s+Int/);
  assert.match(schema, /maxAttempts\s+Int/);
  assert.match(schema, /n8nExecutionId/);
  assert.match(migration, /provisioning_jobs_status_next_attempt_at_created_at_idx/);
});

test("subscription migration is additive and validates money invariants", async () => {
  const migration = await source(
    "prisma/migrations/202608250005_subscription_commerce_foundation/migration.sql",
  );

  assert.doesNotMatch(migration, /\bDROP\s+(TABLE|COLUMN|TYPE)\b/i);
  assert.doesNotMatch(migration, /\bDELETE\s+FROM\b/i);
  assert.doesNotMatch(migration, /\bTRUNCATE\b/i);
  assert.match(migration, /orders_amounts_check/);
  assert.match(migration, /order_items_amounts_check/);
  assert.match(migration, /payments_amounts_check/);
  assert.match(migration, /custom_duration_check/);
});

test("subscription foundation does not invent prices or seed subscriptions", async () => {
  const seed = await source("prisma/seed.ts");

  assert.doesNotMatch(seed, /servicePlan\.(create|upsert)/);
  assert.doesNotMatch(seed, /subscription\.(create|upsert)/);
});
