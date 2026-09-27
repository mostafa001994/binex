import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("consultation leads are persisted in PostgreSQL instead of a JSON file", () => {
  const route = read("src/app/api/leads/route.ts");
  const schema = read("prisma/schema.prisma");

  assert.match(route, /tx\.consultationLead\.create/);
  assert.doesNotMatch(route, /fs\/promises|leads\.json|writeFile/);
  assert.match(schema, /model ConsultationLead/);
  assert.match(schema, /@@map\("consultation_leads"\)/);
});

test("consultation lead API validates phone, need and contact consent", () => {
  const route = read("src/app/api/leads/route.ts");

  assert.match(route, /\^09\\d\{9\}\$/);
  assert.match(route, /if \(!need\)/);
  assert.match(route, /if \(!consent\)/);
});

test("consultation lead migration is additive and indexed", () => {
  const migration = read("prisma/migrations/202608270001_consultation_leads/migration.sql");

  assert.match(migration, /CREATE TABLE "consultation_leads"/);
  assert.match(migration, /consultation_leads_status_created_at_idx/);
  assert.doesNotMatch(migration, /DROP TABLE|TRUNCATE|DELETE FROM/);
});
