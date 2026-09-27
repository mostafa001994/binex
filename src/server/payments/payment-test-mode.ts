export const LOCAL_TEST_GATEWAY_ID =
  "00000000-0000-4000-8000-000000000001";

const LOOPBACK_HOSTS = new Set([
  "127.0.0.1",
  "localhost",
  "[::1]",
]);

export function isLocalTestPaymentEnabled() {
  return (
    process.env.BINIX_RUNTIME_ENV === "local" &&
    process.env.BINIX_PAYMENT_TEST_MODE === "true"
  );
}

export function isLocalRealPaymentEnabled() {
  return (
    isLocalTestPaymentEnabled() &&
    process.env.BINIX_LOCAL_REAL_PAYMENT === "true"
  );
}

export function isLocalTestPaymentRequest(
  url: string | URL,
  hostHeader?: string | null,
) {
  if (!isLocalTestPaymentEnabled()) {
    return false;
  }

  const parsed = typeof url === "string" ? new URL(url) : url;
  const requestHost = hostHeader
    ? new URL(`http://${hostHeader}`).hostname
    : "";

  return (
    LOOPBACK_HOSTS.has(parsed.hostname) ||
    LOOPBACK_HOSTS.has(requestHost)
  );
}

export function resolvePaymentCallbackUrl(
  requestUrl: string | URL,
  gatewayId: string,
  hostHeader?: string | null,
) {
  if (gatewayId === LOCAL_TEST_GATEWAY_ID) {
    if (!isLocalTestPaymentRequest(requestUrl, hostHeader)) {
      throw new Error("درگاه آزمایشی فقط در محیط محلی در دسترس است.");
    }

    return new URL(
      "/api/payment/callback/local-test",
      requestUrl,
    ).toString();
  }

  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new Error("APP_URL تنظیم نشده است.");
  }

  return new URL(
    "/api/payment/callback/zarinpal",
    appUrl,
  ).toString();
}

export function resolveLocalPaymentRedirectUrl(
  requestUrl: string | URL,
  pathname: string,
  hostHeader?: string | null,
) {
  if (!isLocalTestPaymentRequest(requestUrl, hostHeader)) {
    throw new Error("مسیر پرداخت آزمایشی فقط در محیط محلی در دسترس است.");
  }

  const parsed = typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  const publicOrigin = hostHeader
    ? `${parsed.protocol}//${hostHeader}`
    : parsed.origin;

  return new URL(pathname, publicOrigin);
}
