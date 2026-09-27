import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/client";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { getPrismaClient } from "@/server/db/prisma";
import { fulfillPaidOrder } from "@/server/payments/payment-fulfillment-service";
import { releaseCustomServiceOfferAfterFailedPayment } from "@/server/custom-services/custom-service-service";
import { getPaymentProvider } from "@/server/payments/payment-provider-factory";
import {
  isLocalTestPaymentRequest,
  resolveLocalPaymentRedirectUrl,
} from "@/server/payments/payment-test-mode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isLocalTestPaymentRequest(
    request.url,
    request.headers.get("host"),
  )) {
    return NextResponse.json(
      { success: false, message: "درگاه آزمایشی در دسترس نیست." },
      { status: 404 },
    );
  }

  const user = await getAuthenticatedUser(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );
  const paymentId = request.nextUrl.searchParams.get("paymentId") ?? "";
  const authority = request.nextUrl.searchParams.get("authority") ?? "";
  const result = request.nextUrl.searchParams.get("result") ?? "";
  const prisma = getPrismaClient();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (
    !payment ||
    payment.provider !== "local-test" ||
    payment.providerReference !== authority ||
    payment.order.createdByUserId !== user.id
  ) {
    return NextResponse.json(
      { success: false, message: "پرداخت آزمایشی پیدا نشد." },
      { status: 404 },
    );
  }

  const terminalResult =
    payment.status === PaymentStatus.SUCCEEDED
      ? "success"
      : payment.status === PaymentStatus.FAILED
        ? "failed"
        : payment.status === PaymentStatus.CANCELED
          ? "canceled"
          : null;

  if (terminalResult && terminalResult !== result) {
    return NextResponse.json(
      { success: false, message: "نتیجه نهایی این پرداخت قبلاً ثبت شده است." },
      { status: 409 },
    );
  }

  if (result === "failed" || result === "canceled") {
    const canceled = result === "canceled";
    if (!terminalResult) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: canceled ? PaymentStatus.CANCELED : PaymentStatus.FAILED,
            failedAt: canceled ? null : new Date(),
            failureCode: canceled ? "LOCAL_TEST_CANCELED" : "LOCAL_TEST_FAILED",
            failureMessage: canceled
              ? "پرداخت آزمایشی توسط کاربر لغو شد."
              : "پرداخت آزمایشی ناموفق شبیه‌سازی شد.",
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: canceled ? OrderStatus.CANCELED : OrderStatus.PAYMENT_FAILED,
            canceledAt: canceled ? new Date() : null,
          },
        }),
      ]);
      await releaseCustomServiceOfferAfterFailedPayment(payment.orderId);
    }

    const retryUrl = resolveLocalPaymentRedirectUrl(
      request.url,
      "/payment/test",
      request.headers.get("host"),
    );
    retryUrl.searchParams.set("paymentId", payment.id);
    retryUrl.searchParams.set("authority", authority);
    retryUrl.searchParams.set("result", result);
    return NextResponse.redirect(retryUrl);
  }

  if (result !== "success") {
    return NextResponse.json(
      { success: false, message: "نتیجه پرداخت آزمایشی معتبر نیست." },
      { status: 400 },
    );
  }

  const provider = getPaymentProvider("local-test", {});
  const verification = await provider.verifyPayment({
    authority,
    amount: payment.amount,
  });

  if (!verification.success) {
    return NextResponse.json(
      { success: false, message: "تأیید پرداخت آزمایشی ناموفق بود." },
      { status: 400 },
    );
  }

  if (
    payment.status !== PaymentStatus.SUCCEEDED ||
    payment.order.status !== OrderStatus.PAID
  ) {
    const paidAt = new Date();
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          providerPaymentId: verification.referenceId,
          paidAt,
          failedAt: null,
          failureCode: null,
          failureMessage: null,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PAID,
          paidAt,
          canceledAt: null,
        },
      }),
    ]);
  }

  await fulfillPaidOrder(payment.orderId);

  const successUrl = resolveLocalPaymentRedirectUrl(
    request.url,
    "/payment/success",
    request.headers.get("host"),
  );
  successUrl.searchParams.set("orderId", payment.orderId);
  return NextResponse.redirect(successUrl);
}
