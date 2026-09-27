import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin API lets the browser generate the multipart boundary for FormData", async () => {
  const client = await read("src/lib/api-client/admin.ts");
  assert.match(client, /init\?\.body instanceof FormData/);
  assert.match(client, /hasBody && !isMultipart/);
  assert.match(client, /body: form/);
});

test("media upload route parses multipart form data", async () => {
  const route = await read("src/app/api/v1/admin/blog/media/route.ts");
  assert.match(route, /await request\.formData\(\)/);
  assert.match(route, /file instanceof File/);
});
