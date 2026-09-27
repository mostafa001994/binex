import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("customer dashboard aggregates persisted operational sources", async () => {
  const service = await source("src/server/dashboard/dashboard-service.ts");

  assert.match(service, /listServicesForBusinessContext/);
  assert.match(service, /listMyNotifications/);
  assert.match(service, /listMyTickets/);
  assert.match(service, /listForBusiness/);
  assert.match(service, /countOpenOrdersForBusiness/);
  assert.doesNotMatch(service, /recentActivity:\s*\[\]|aiInsights:\s*\[\]/);
});

test("dashboard never fetches owner finance for business members", async () => {
  const service = await source("src/server/dashboard/dashboard-service.ts");

  assert.match(service, /membership\.role === "owner"/);
  assert.match(service, /subscriptionCount: isOwner/);
  assert.match(service, /openOrders: isOwner/);
  assert.match(service, /isOwner\s*\?\s*getSubscriptionRepository/);
  assert.match(service, /isOwner\s*\?\s*getCommerceRepository/);
});

test("dashboard actions are derived from real attention states", async () => {
  const service = await source("src/server/dashboard/dashboard-service.ts");

  assert.match(service, /payment-required/);
  assert.match(service, /setup-failed/);
  assert.match(service, /waiting-customer/);
  assert.match(service, /unreadNotifications > 0/);
  assert.match(service, /priority\[a\.priority\]/);
});

test("dashboard UI replaces placeholder AI and activity sections", async () => {
  const page = await source("src/app/app/page.tsx");

  assert.match(page, /dashboard\.summary/);
  assert.match(page, /recentNotifications/);
  assert.match(page, /اقدام‌های بعدی شما/);
  assert.match(page, /دسترسی سریع/);
  assert.doesNotMatch(page, /Activity Repository|insight ساختگی|Binix AI/);
});

test("dashboard has retry loading empty and role-aware states", async () => {
  const page = await source("src/app/app/page.tsx");

  assert.match(page, /DashboardSkeleton/);
  assert.match(page, /تلاش دوباره/);
  assert.match(page, /در حال حاضر اقدام فوری ندارید/);
  assert.match(page, /هنوز سرویسی به این کسب‌وکار متصل نشده است/);
  assert.match(page, /const isOwner/);
});

test("dashboard route delegates active-business enforcement once", async () => {
  const route = await source("src/app/api/v1/dashboard/route.ts");
  const service = await source("src/server/dashboard/dashboard-service.ts");

  assert.doesNotMatch(route, /getCurrentBusinessContext|requireBusinessActive/);
  assert.match(service, /requireBusinessActive/);
});
