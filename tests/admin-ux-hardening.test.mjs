import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("admin navigation is grouped and localized", async () => {
  const shell = await read("../src/components/admin/admin-shell.tsx");
  for (const label of ["مدیریت مشتریان", "محصول و فروش", "مالی", "عملیات", "سیستم"]) {
    assert.match(shell, new RegExp(label));
  }
  assert.match(shell, /مرکز عملیات و مدیریت/);
  assert.doesNotMatch(shell, /Operational Console/);
  assert.match(shell, /max-h-\[calc\(100dvh-112px\)\]/);
});

test("admin destructive actions use the shared confirmation dialog", async () => {
  const paths = [
    "../src/app/admin/users/[userId]/page.tsx",
    "../src/app/admin/orders/[orderId]/page.tsx",
    "../src/app/admin/subscriptions/page.tsx",
    "../src/app/admin/automations/page.tsx",
    "../src/app/admin/provisioning/page.tsx",
  ];
  for (const path of paths) {
    const source = await read(path);
    assert.match(source, /ConfirmDialog/);
    assert.doesNotMatch(source, /window\.confirm/);
  }
});

test("payments provide a mobile card view and modal has bounded scrolling", async () => {
  const payments = await read("../src/app/admin/payments/page.tsx");
  const modal = await read("../src/components/ui/modal.tsx");
  assert.match(payments, /md:hidden/);
  assert.match(payments, /hidden overflow-hidden[\s\S]*md:block/);
  assert.match(modal, /overflow-y-auto overscroll-contain/);
  assert.match(modal, /sticky bottom-0/);
});
