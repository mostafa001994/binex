import { requireBusinessActive } from "@/server/business/business-access";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import {
  ForbiddenApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import type {
  AdminOrderRecord,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/server/repositories/contracts/commerce-repository";
import { getCommerceRepository } from "@/server/repositories/repository-provider";

type AuthenticatedBusinessUser = { id: string; phone: string };

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: AdminOrderStatus;
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
    status: AdminPaymentStatus;
    amount: string;
    refundedAmount: string;
    currency: string;
    reference: string | null;
    requestedAt: string;
    paidAt: string | null;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const financialOrderStatuses = new Set<AdminOrderStatus>([
  "paid",
  "refunded",
  "partially-refunded",
]);
const financialPaymentStatuses = new Set<AdminPaymentStatus>([
  "succeeded",
  "refunded",
  "partially-refunded",
]);

function requireFinanceOwner(role: "owner" | "admin" | "member") {
  if (role !== "owner") {
    throw new ForbiddenApiError(
      "فقط مالک کسب‌وکار می‌تواند سفارش‌ها و پرداخت‌ها را مشاهده کند.",
    );
  }
}

async function ownerBusinessContext(user: AuthenticatedBusinessUser) {
  const context = requireBusinessActive(await getCurrentBusinessContext(user));
  requireFinanceOwner(context.membership.role);
  return context;
}

function toCustomerOrder(order: AdminOrderRecord): CustomerOrder {
  const receiptPayment = order.payments.find(
    (payment) =>
      financialPaymentStatuses.has(payment.status) &&
      payment.amount === order.totalAmount,
  );
  const receiptAvailable = Boolean(
    receiptPayment && financialOrderStatuses.has(order.status),
  );

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    amounts: {
      subtotal: order.subtotalAmount,
      discount: order.discountAmount,
      tax: order.taxAmount,
      total: order.totalAmount,
    },
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
    canceledAt: order.canceledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    receiptAvailable,
    items: order.items.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      planName: item.planName,
      type: item.type,
      billingPeriod: item.billingPeriod,
      unitAmount: item.unitAmount,
      quantity: item.quantity,
      totalAmount: item.totalAmount,
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      status: payment.status,
      amount: payment.amount,
      refundedAmount: payment.refundedAmount,
      currency: payment.currency,
      reference:
        receiptAvailable && payment.id === receiptPayment?.id
          ? payment.providerReference
          : null,
      requestedAt: payment.requestedAt,
      paidAt: payment.paidAt,
    })),
  };
}

export async function listCustomerOrders(
  user: AuthenticatedBusinessUser,
  input: { page: number; pageSize: number },
) {
  if (
    !Number.isInteger(input.page) ||
    input.page < 1 ||
    !Number.isInteger(input.pageSize) ||
    input.pageSize < 1 ||
    input.pageSize > 50
  ) {
    throw new ValidationApiError("صفحه‌بندی سفارش‌ها معتبر نیست.");
  }

  const context = await ownerBusinessContext(user);
  const result = await getCommerceRepository().listOrdersForBusiness(
    context.business.id,
    input,
  );

  return {
    orders: result.items.map(toCustomerOrder),
    pagination: result.pagination,
  };
}

export async function getCustomerOrder(
  user: AuthenticatedBusinessUser,
  orderId: string,
) {
  const context = await ownerBusinessContext(user);

  if (!UUID_PATTERN.test(orderId)) {
    throw new NotFoundApiError("سفارش موردنظر پیدا نشد.");
  }

  const order = await getCommerceRepository().findOrderForBusiness(
    context.business.id,
    orderId,
  );

  if (!order) {
    throw new NotFoundApiError("سفارش موردنظر پیدا نشد.");
  }

  return toCustomerOrder(order);
}
