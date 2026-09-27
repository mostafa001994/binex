export type PurchasablePlan = {
  id: string;
  serviceId: string;
  code: string;
  name: string;
  description: string | null;
  billingPeriod: "monthly" | "quarterly" | "yearly" | "custom";
  customDurationDays: number | null;
  priceAmount: string;
  currency: string;
  trialDays: number;
  sortOrder: number;
  features: string[];
};

type ErrorPayload = {
  success: false;
  error: {
    message: string;
  };
};

export async function getPurchasablePlansApi() {
  const response = await fetch("/api/v1/catalog/plans", {
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(
      (payload as ErrorPayload).error?.message ||
        "پلن‌های قابل خرید دریافت نشدند.",
    );
  }

  return payload.data as {
    plans: PurchasablePlan[];
  };
}

