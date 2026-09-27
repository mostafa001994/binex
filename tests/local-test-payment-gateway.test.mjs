import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("local payment gateway requires explicit local runtime flags and loopback", async () => {
  const source = await read("src/server/payments/payment-test-mode.ts");

  assert.match(source, /BINIX_RUNTIME_ENV === "local"/);
  assert.match(source, /BINIX_PAYMENT_TEST_MODE === "true"/);
  assert.match(source, /127\.0\.0\.1/);
  assert.match(source, /localhost/);
  assert.match(source, /LOOPBACK_HOSTS\.has/);
  assert.match(source, /hostHeader/);
});

test("portable compose passes test payment flags without replacing APP_URL", async () => {
  const compose = await read("compose.portable.yaml");

  assert.match(compose, /BINIX_RUNTIME_ENV: \$\{BINIX_RUNTIME_ENV:-production\}/);
  assert.match(compose, /BINIX_PAYMENT_TEST_MODE: \$\{BINIX_PAYMENT_TEST_MODE:-false\}/);
  assert.match(compose, /APP_URL: \$\{APP_URL\}/);
  assert.doesNotMatch(compose, /APP_URL:\s*http:\/\/127\.0\.0\.1/);
});

test("local payment provider and callback use the real fulfillment pipeline", async () => {
  const [factory, callback, fulfillment] = await Promise.all([
    read("src/server/payments/payment-provider-factory.ts"),
    read("src/app/api/payment/callback/local-test/route.ts"),
    read("src/server/payments/payment-fulfillment-service.ts"),
  ]);

  assert.match(factory, /case "local-test"/);
  assert.match(callback, /isLocalTestPaymentRequest/);
  assert.match(callback, /payment\.order\.createdByUserId !== user\.id/);
  assert.match(callback, /fulfillPaidOrder\(payment\.orderId\)/);
  assert.match(fulfillment, /ProvisioningAction\.ACTIVATE/);
});

test("local payment page uses the browser origin instead of Docker internal origin", async () => {
  const provider = await read("src/server/payments/providers/local-test-provider.ts");

  assert.match(provider, /paymentUrl: `\/payment\/test\?\$\{query\.toString\(\)\}`/);
  assert.doesNotMatch(provider, /callbackUrl\.origin/);
});

test("local payment actions call the callback without navigating to an API link", async () => {
  const [page, actions] = await Promise.all([
    read("src/app/payment/test/page.tsx"),
    read("src/components/payment/local-test-payment-actions.tsx"),
  ]);

  assert.match(page, /<LocalTestPaymentActions/);
  assert.doesNotMatch(page, /href=.*api\/payment\/callback\/local-test/);
  assert.match(actions, /fetch\(/);
  assert.match(actions, /credentials: "include"/);
  assert.match(actions, /window\.location\.assign\(response\.url\)/);
});

test("local callback redirects to the published host instead of Docker internal origin", async () => {
  const [mode, callback] = await Promise.all([
    read("src/server/payments/payment-test-mode.ts"),
    read("src/app/api/payment/callback/local-test/route.ts"),
  ]);

  assert.match(mode, /resolveLocalPaymentRedirectUrl/);
  assert.match(mode, /`\$\{parsed\.protocol\}\/\/\$\{hostHeader\}`/);
  assert.match(callback, /resolveLocalPaymentRedirectUrl/);
  assert.doesNotMatch(callback, /new URL\("\/payment\/(?:test|success)", request\.url\)/);
});

test("fulfillment preserves an already configured active service", async () => {
  const fulfillment = await read("src/server/payments/payment-fulfillment-service.ts");

  assert.match(fulfillment, /serviceAlreadyReady/);
  assert.match(fulfillment, /existingBusinessService\?\.status === BusinessServiceStatus\.ACTIVE/);
  assert.match(fulfillment, /if\(!serviceAlreadyReady\)/);
  assert.match(fulfillment, /if\(serviceAlreadyReady\)[\s\S]*continue/);
});

test("payment fulfillment is idempotent on callback replay", async () => {
  const fulfillment = await read("src/server/payments/payment-fulfillment-service.ts");

  assert.match(fulfillment, /if\(item\.subscriptionId\)[\s\S]*continue/);
  assert.match(fulfillment, /idempotencyKey:\s*`payment:\$\{order\.id\}:\$\{subscription\.id\}`/);
});

test("terminal local payment results cannot be changed", async () => {
  const [callback, page] = await Promise.all([
    read("src/app/api/payment/callback/local-test/route.ts"),
    read("src/app/payment/test/page.tsx"),
  ]);

  assert.match(callback, /terminalResult && terminalResult !== result/);
  assert.match(callback, /status: 409/);
  assert.match(page, /پرداخت آزمایشی ناموفق ثبت شد/);
  assert.match(page, /انصراف از پرداخت آزمایشی ثبت شد/);
  assert.match(page, /بازگشت به انتخاب اشتراک/);
});

test("real gateway can be explicitly exposed locally with a payment warning", async () => {
  const [mode, route, checkout, compose, example] = await Promise.all([
    read("src/server/payments/payment-test-mode.ts"),
    read("src/app/api/v1/payment-gateways/route.ts"),
    read("src/app/checkout/page.tsx"),
    read("compose.portable.yaml"),
    read(".env.portable.example"),
  ]);

  assert.match(mode, /BINIX_LOCAL_REAL_PAYMENT === "true"/);
  assert.match(route, /gateway\.provider === "zarinpal"/);
  assert.match(checkout, /این پرداخت واقعی است و مبلغ از حساب شما کسر می‌شود/);
  assert.match(checkout, /realPaymentConfirmed/);
  assert.match(compose, /BINIX_LOCAL_REAL_PAYMENT: \$\{BINIX_LOCAL_REAL_PAYMENT:-false\}/);
  assert.match(example, /BINIX_LOCAL_REAL_PAYMENT=false/);
});
