import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";

const root = process.cwd();
const requiredDocs = [
  "README.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "docs/README.md",
  "docs/00-product/product-overview.md",
  "docs/01-architecture/system-overview.md",
  "docs/02-database/data-model.md",
  "docs/02-database/erd.md",
  "docs/03-backend/api-overview.md",
  "docs/04-features/current-capabilities.md",
  "docs/07-operations/docker-runbook.md",
  "docs/08-development/definition-of-done.md",
  "docs/adr/README.md",
];

test("required project documentation exists", () => {
  for (const file of requiredDocs) {
    assert.ok(existsSync(resolve(root, file)), `Missing documentation: ${file}`);
  }
});

test("local markdown links in documentation indexes resolve", () => {
  const indexes = ["README.md", "docs/README.md", "docs/adr/README.md"];
  const markdownLink = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const index of indexes) {
    const absoluteIndex = resolve(root, index);
    const content = readFileSync(absoluteIndex, "utf8");
    for (const match of content.matchAll(markdownLink)) {
      const link = match[1].trim();
      if (/^(?:https?:|mailto:|#)/i.test(link)) continue;
      const target = decodeURIComponent(link.split("#", 1)[0]);
      assert.ok(
        existsSync(resolve(dirname(absoluteIndex), target)),
        `Broken link in ${index}: ${link}`,
      );
    }
  }
});
