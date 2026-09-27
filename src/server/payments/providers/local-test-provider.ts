import type {
  PaymentProvider,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyInput,
  PaymentVerifyResult,
} from "../payment-provider";
import {
  isLocalTestPaymentEnabled,
} from "../payment-test-mode";

export class LocalTestPaymentProvider implements PaymentProvider {
  async requestPayment(
    input: PaymentRequestInput,
  ): Promise<PaymentRequestResult> {
    if (!isLocalTestPaymentEnabled()) {
      throw new Error("درگاه آزمایشی محلی غیرفعال است.");
    }

    const paymentId = input.metadata?.paymentId;
    if (typeof paymentId !== "string" || !paymentId) {
      throw new Error("شناسه پرداخت آزمایشی معتبر نیست.");
    }

    const authority = `local-test-${paymentId}`;
    const query = new URLSearchParams({
      paymentId,
      authority,
    });

    return {
      authority,
      // Keep the browser on the public origin it used to open Binix. An
      // absolute URL derived inside Docker can incorrectly point to
      // localhost:3000 instead of the published host port.
      paymentUrl: `/payment/test?${query.toString()}`,
    };
  }

  async verifyPayment(
    input: PaymentVerifyInput,
  ): Promise<PaymentVerifyResult> {
    const prefix = "local-test-";
    const referenceId = input.authority.startsWith(prefix)
      ? input.authority.slice(prefix.length)
      : "";

    return {
      success:
        isLocalTestPaymentEnabled() &&
        Boolean(referenceId),
      referenceId: referenceId || undefined,
    };
  }
}
