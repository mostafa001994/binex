"use client";

import { useState } from "react";

type TestResult = "success" | "failed" | "canceled";

const actions: Array<{
  result: TestResult;
  label: string;
  className: string;
}> = [
  {
    result: "success",
    label: "شبیه‌سازی پرداخت موفق",
    className: "bg-success text-white",
  },
  {
    result: "failed",
    label: "شبیه‌سازی پرداخت ناموفق",
    className: "bg-error text-white",
  },
  {
    result: "canceled",
    label: "شبیه‌سازی انصراف",
    className: "border border-border",
  },
];

export function LocalTestPaymentActions({
  paymentId,
  authority,
}: {
  paymentId: string;
  authority: string;
}) {
  const [submitting, setSubmitting] = useState<TestResult | null>(null);
  const [error, setError] = useState("");

  async function simulate(result: TestResult) {
    if (submitting) return;

    setSubmitting(result);
    setError("");

    const query = new URLSearchParams({ paymentId, authority, result });

    try {
      const response = await fetch(
        `/api/payment/callback/local-test?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          redirect: "follow",
          headers: { Accept: "text/html,application/json" },
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.error?.message ||
            payload?.message ||
            "ثبت نتیجه پرداخت آزمایشی انجام نشد.",
        );
      }

      window.location.assign(response.url);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "ثبت نتیجه پرداخت آزمایشی انجام نشد.",
      );
      setSubmitting(null);
    }
  }

  return (
    <>
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-control border border-error/30 bg-error/10 p-3 text-sm text-error"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-3">
        {actions.map((action) => (
          <button
            key={action.result}
            type="button"
            disabled={Boolean(submitting)}
            onClick={() => void simulate(action.result)}
            className={`rounded-control px-4 py-3 text-sm font-bold disabled:cursor-wait disabled:opacity-50 ${action.className}`}
          >
            {submitting === action.result ? "در حال ثبت نتیجه..." : action.label}
          </button>
        ))}
      </div>
    </>
  );
}
