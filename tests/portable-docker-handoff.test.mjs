import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("portable compose owns its database and migration lifecycle", async () => {
  const compose = await read("compose.portable.yaml");

  assert.match(compose, /database:\s*\n\s*image: postgres:17-alpine/);
  assert.match(compose, /migrate:\s*\n\s*build:/);
  assert.match(compose, /condition: service_completed_successfully/);
  assert.match(compose, /BINIX_DATA_DRIVER: database/);
  assert.match(compose, /binix_postgres_data:\/var\/lib\/postgresql\/data/);
  assert.doesNotMatch(compose, /external:\s*true/);
  assert.doesNotMatch(compose, /shared_postgres/);
});

test("Dockerfile provides a migration image and a non-root runtime", async () => {
  const dockerfile = await read("Dockerfile");

  assert.match(dockerfile, /FROM deps AS migrator/);
  assert.match(dockerfile, /npm run db:migrate:deploy && npm run db:seed/);
  assert.match(dockerfile, /USER nextjs/);
});

test("portable secrets are generated locally and excluded from exports", async () => {
  const [example, gitignore, bootstrap, exporter] = await Promise.all([
    read(".env.portable.example"),
    read(".gitignore"),
    read("scripts/bootstrap-portable.ps1"),
    read("scripts/export-portable.ps1"),
  ]);

  assert.match(example, /BINIX_DB_PASSWORD=replace-with-a-long-hex-password/);
  assert.match(example, /BINIX_CREDENTIALS_ENCRYPTION_KEY=replace-with-a-base64-encoded-32-byte-key/);
  assert.match(gitignore, /^\.env\.portable$/m);
  assert.match(bootstrap, /New-RandomHex 32/);
  assert.match(bootstrap, /New-RandomBase64 32/);
  assert.match(exporter, /name\.StartsWith\("\.env"/);
  assert.match(exporter, /name -ne "\.env\.portable\.example"/);
});
