export type AdminOrderStatus = "pending-payment" | "paid" | "payment-failed" | "canceled" | "expired" | "refunded" | "partially-refunded";
export type AdminPaymentStatus = "initiated" | "pending" | "succeeded" | "failed" | "canceled" | "refunded" | "partially-refunded";

export type AdminOrderRecord = {
  id: string;
  orderNumber: string;
  businessId: string;
  businessName: string;
  createdByName: string | null;
  createdByPhone: string | null;
  status: AdminOrderStatus;
  currency: string;
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  expiresAt: string | null;
  paidAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
  internalNote: string | null;
  items: Array<{
    id: string;
    serviceId: string | null;
    serviceName: string;
    planName: string;
    planCode: string;
    type: "new-subscription" | "renewal" | "upgrade" | "custom-service";
    billingPeriod: "monthly" | "quarterly" | "yearly" | "custom";
    unitAmount: string;
    quantity: number;
    totalAmount: string;
    subscriptionId: string | null;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: AdminPaymentStatus;
    amount: string;
    refundedAmount: string;
    currency: string;
    providerPaymentId: string | null;
    providerReference: string | null;
    failureCode: string | null;
    failureMessage: string | null;
    requestedAt: string;
    paidAt: string | null;
    failedAt: string | null;
  }>;
};

export type CommerceSearchInput = {
  search?: string;
  orderStatus?: AdminOrderStatus | "";
  paymentStatus?: AdminPaymentStatus | "";
  serviceId?: string;
  page?: number;
  pageSize?: number;
};

export interface CommerceRepository {
  searchOrders(input: CommerceSearchInput): Promise<{
    items: AdminOrderRecord[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }>;
  findOrderById(id: string): Promise<AdminOrderRecord | null>;
  listOrdersForBusiness(
    businessId: string,
    input: { page: number; pageSize: number },
  ): Promise<{
    items: AdminOrderRecord[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }>;
  findOrderForBusiness(
    businessId: string,
    id: string,
  ): Promise<AdminOrderRecord | null>;
  countOpenOrdersForBusiness(businessId: string): Promise<number>;
  updateOrderNote(id: string, note: string | null): Promise<AdminOrderRecord | null>;
  transitionUnpaidOrder(id: string, status: "canceled" | "expired"): Promise<AdminOrderRecord | null>;
}
