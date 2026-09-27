type ApiErrorPayload = {
  success: false;
  error: { code: string; message: string };
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
};

export type CustomerOrderStatus =
  | "pending-payment"
  | "paid"
  | "payment-failed"
  | "canceled"
  | "expired"
  | "refunded"
  | "partially-refunded";

export type CustomerPaymentStatus =
  | "initiated"
  | "pending"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded"
  | "partially-refunded";

export type CustomerOrderApiItem = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  currency: string;
  amounts: {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
  };
  expiresAt: string | null;
  paidAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  receiptAvailable: boolean;
  items: Array<{
    id: string;
    serviceId: string | null;
    serviceName: string;
    planName: string;
    type: "new-subscription" | "renewal" | "upgrade" | "custom-service";
    billingPeriod: "monthly" | "quarterly" | "yearly" | "custom";
    unitAmount: string;
    quantity: number;
    totalAmount: string;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: CustomerPaymentStatus;
    amount: string;
    refundedAmount: string;
    currency: string;
    reference: string | null;
    requestedAt: string;
    paidAt: string | null;
  }>;
};

export type CustomerOrdersResponse = {
  orders: CustomerOrderApiItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

async function getJson<T>(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;

  if (!response.ok || !payload.success) {
    throw new Error(
      (payload as ApiErrorPayload).error?.message ||
        "اطلاعات سفارش‌ها قابل دریافت نیست.",
    );
  }

  return payload.data;
}

export function getCustomerOrdersApi(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return getJson<CustomerOrdersResponse>(`/api/v1/orders?${params}`);
}

export function getCustomerOrderApi(orderId: string) {
  return getJson<{ order: CustomerOrderApiItem }>(
    `/api/v1/orders/${encodeURIComponent(orderId)}`,
  );
}
