import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isLocalTestPaymentEnabled,
} from "@/server/payments/payment-test-mode";
import { LocalTestPaymentActions } from "@/components/payment/local-test-payment-actions";

export const dynamic = "force-dynamic";

export default async function LocalTestPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    paymentId?: string;
    authority?: string;
    result?: string;
  }>;
}) {
  if (!isLocalTestPaymentEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const paymentId = params.paymentId ?? "";
  const authority = params.authority ?? "";
  const terminalResult =
    params.result === "failed" || params.result === "canceled"
      ? params.result
      : null;

  if (!paymentId || !authority) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4" dir="rtl">
      <section className="w-full max-w-lg rounded-card border border-border bg-surface p-7 text-center shadow-binix-lg">
        <div className="text-sm font-semibold text-warning">محیط آزمایشی محلی</div>
        <h1 className="mt-3 text-2xl font-bold">شبیه‌سازی نتیجه پرداخت</h1>
        <p className="mt-3 text-sm leading-7 text-foreground-muted">
          هیچ تراکنش مالی واقعی انجام نمی‌شود. نتیجه موردنظر را برای ادامه تست انتخاب کنید.
        </p>

        {terminalResult ? (
          <div className="mt-6">
            <p
              className={`rounded-control border p-4 text-sm ${
                terminalResult === "failed"
                  ? "border-error/25 bg-error/10 text-error"
                  : "border-warning/25 bg-warning/10 text-warning"
              }`}
            >
              {terminalResult === "failed"
                ? "پرداخت آزمایشی ناموفق ثبت شد."
                : "انصراف از پرداخت آزمایشی ثبت شد."}
            </p>
            <Link
              href="/services/ai-sales-agent#plans"
              className="mt-4 inline-flex rounded-control border border-border px-4 py-3 text-sm font-bold"
            >
              بازگشت به انتخاب اشتراک
            </Link>
          </div>
        ) : (
          <div className="mt-7">
            <LocalTestPaymentActions
              paymentId={paymentId}
              authority={authority}
            />
          </div>
        )}
      </section>
    </main>
  );
}
