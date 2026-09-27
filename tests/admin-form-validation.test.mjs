import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("admin layout mounts the shared client-side validator", async () => {
  const layout = await source("src/app/admin/layout.tsx");
  assert.match(layout, /AdminFormValidation/);
  assert.match(layout, /<AdminFormValidation\s*\/>/);
});

test("shared validator blocks submit and guides the user to the first invalid field", async () => {
  const validator = await source("src/components/admin/admin-form-validation.tsx");
  assert.match(validator, /input\[required\], select\[required\], textarea\[required\]/);
  assert.match(validator, /scrollIntoView\(\{ behavior: "smooth", block: "center"/);
  assert.match(validator, /focus\(\{ preventScroll: true \}\)/);
  assert.match(validator, /stopImmediatePropagation\(\)/);
  assert.match(validator, /data-admin-validation-error/);
  assert.match(validator, /addEventListener\("focusout", onBlur, true\)/);
  assert.match(validator, /getAttribute\("type"\) === "submit"/);
});

test("core admin create and edit forms declare their required fields", async () => {
  const files = await Promise.all([
    source("src/app/admin/services/page.tsx"),
    source("src/app/admin/plans/page.tsx"),
    source("src/app/admin/businesses/page.tsx"),
    source("src/app/admin/users/page.tsx"),
    source("src/app/admin/roles/page.tsx"),
    source("src/app/admin/subscriptions/page.tsx"),
  ]);
  for (const page of files) {
    assert.match(page, /required/);
    assert.match(page, /data-field-label/);
  }
});

test("content, notification, gateway and media forms use the shared validation contract", async () => {
  const files = await Promise.all([
    source("src/app/admin/faqs/page.tsx"),
    source("src/app/admin/seo/page.tsx"),
    source("src/app/admin/blog/page.tsx"),
    source("src/app/admin/notifications/events/page.tsx"),
    source("src/app/admin/notifications/templates/page.tsx"),
    source("src/app/admin/notifications/rules/page.tsx"),
    source("src/app/admin/notifications/providers/page.tsx"),
    source("src/app/admin/payment-gateways/page.tsx"),
    source("src/app/admin/media/page.tsx"),
    source("src/app/admin/support/[ticketId]/page.tsx"),
  ]);
  for (const page of files) {
    assert.match(page, /required/);
    assert.match(page, /data-field-label/);
  }
  assert.match(files[0], /data-admin-form-root/);
  assert.match(files[1], /data-admin-form-root/);
  assert.match(files[8], /data-admin-submit="true"/);
  assert.match(files[9], /data-admin-form-root/);
});
