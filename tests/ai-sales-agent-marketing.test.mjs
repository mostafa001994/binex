import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("sales agent marketing CTAs lead to the dedicated demo request", () => {
  const hero = read("src/components/services/ai-sales-agent/AiSalesHero.tsx");
  const dashboard = read("src/components/services/ai-sales-agent/MerchantDashboard.tsx");
  assert.match(hero, /href="#demo-request"/);
  assert.match(hero, /درخواست دموی فروشنده هوشمند/);
  assert.match(dashboard, /href="#demo-request"/);
});

test("sales agent demo form persists a qualified consultation lead", () => {
  const form = read("src/components/services/ai-sales-agent/AiSalesDemoForm.tsx");
  assert.match(form, /fetch\("\/api\/leads"/);
  assert.match(form, /need: "درخواست دموی فروشنده هوشمند"/);
  assert.match(form, /source: "ai-sales-agent-demo"/);
  assert.match(form, /consent: data\.get\("consent"\) === "on"/);
  assert.match(form, /\^09\\d\{9\}\$/);
});

test("sales agent page explains business fit without fabricated metrics", () => {
  const page = read("src/app/services/ai-sales-agent/page.tsx");
  const template = read("src/components/services/shared/DynamicServiceMarketingPage.tsx");
  assert.match(page, /<DynamicServiceMarketingPage slug="ai-sales-agent" \/>/);
  assert.match(template, /content\.benefits/);
  assert.match(template, /content\.steps/);
  assert.doesNotMatch(template, /درصد|افزایش فروش|کاهش هزینه/);
});

test("admin lead source identifies sales agent demo requests", () => {
  const page = read("src/app/admin/leads/page.tsx");
  assert.match(page, /"ai-sales-agent-demo": "دموی فروشنده هوشمند"/);
});
