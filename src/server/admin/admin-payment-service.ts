import { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { getPrismaClient } from "@/server/db/prisma";
import type { AdminPaymentStatus } from "@/server/repositories/contracts/commerce-repository";

const paymentStatusToDb: Record<AdminPaymentStatus, PaymentStatus> = {
  initiated: PaymentStatus.INITIATED,
  pending: PaymentStatus.PENDING,
  succeeded: PaymentStatus.SUCCEEDED,
  failed: PaymentStatus.FAILED,
  canceled: PaymentStatus.CANCELED,
  refunded: PaymentStatus.REFUNDED,
  "partially-refunded": PaymentStatus.PARTIALLY_REFUNDED,
};

function kebab(value: string) { return value.toLowerCase().replaceAll("_", "-"); }

function reconciliation(payment: {
  status: PaymentStatus;
  amount: bigint;
  order: { status: OrderStatus; totalAmount: bigint; payments: Array<{ status: PaymentStatus }> };
}) {
  const verifiedPaymentStatuses = new Set<PaymentStatus>([PaymentStatus.SUCCEEDED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED]);
  const succeeded = payment.order.payments.some((item) => verifiedPaymentStatuses.has(item.status));
  const financialOrderStatuses = new Set<OrderStatus>([OrderStatus.PAID, OrderStatus.REFUNDED, OrderStatus.PARTIALLY_REFUNDED]);
  const issues: string[] = [];
  if (verifiedPaymentStatuses.has(payment.status) && !financialOrderStatuses.has(payment.order.status)) issues.push("پرداخت مالی ثبت شده اما وضعیت سفارش مالی نیست.");
  if (verifiedPaymentStatuses.has(payment.status) && payment.amount !== payment.order.totalAmount) issues.push("مبلغ پرداخت با مبلغ نهایی سفارش برابر نیست.");
  if (financialOrderStatuses.has(payment.order.status) && !succeeded) issues.push("سفارش وضعیت مالی دارد اما پرداخت موفقی برای آن ثبت نشده است.");
  return { status: issues.length ? "needs-review" as const : "consistent" as const, issues };
}

export function validatePaymentStatus(value: string): value is AdminPaymentStatus {
  return Object.hasOwn(paymentStatusToDb, value);
}

export async function listAdminPayments(user: AuthUser, input: { search?: string; status?: AdminPaymentStatus | ""; provider?: string; page?: number; pageSize?: number }) {
  requireAdminPermission(user, "admin.orders.read");
  const prisma = getPrismaClient();
  const page = Math.max(1, Math.floor(input.page || 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize || 20)));
  const search = input.search?.trim();
  const provider = input.provider?.trim();
  const where: Prisma.PaymentWhereInput = {
    status: input.status ? paymentStatusToDb[input.status] : undefined,
    provider: provider ? { contains: provider, mode: "insensitive" } : undefined,
    OR: search ? [
      { providerReference: { contains: search, mode: "insensitive" } },
      { providerPaymentId: { contains: search, mode: "insensitive" } },
      { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      { order: { business: { name: { contains: search, mode: "insensitive" } } } },
    ] : undefined,
  };
  const [total, providers, succeededCount, failedCount, pendingCount, anomalyRows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({ distinct: ["provider"], select: { provider: true }, orderBy: { provider: "asc" } }),
    prisma.payment.count({ where: { status: PaymentStatus.SUCCEEDED } }),
    prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
    prisma.payment.count({ where: { status: { in: [PaymentStatus.INITIATED, PaymentStatus.PENDING] } } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM payments p JOIN orders o ON o.id = p.order_id WHERE (p.status IN ('SUCCEEDED','REFUNDED','PARTIALLY_REFUNDED') AND (o.status NOT IN ('PAID','REFUNDED','PARTIALLY_REFUNDED') OR p.amount <> o.total_amount)) OR (o.status IN ('PAID','REFUNDED','PARTIALLY_REFUNDED') AND NOT EXISTS (SELECT 1 FROM payments sp WHERE sp.order_id = o.id AND sp.status IN ('SUCCEEDED','REFUNDED','PARTIALLY_REFUNDED')))`,
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const payments = await prisma.payment.findMany({
    where,
    orderBy: { requestedAt: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    include: { order: { include: { business: { select: { name: true } }, payments: { select: { status: true } } } } },
  });
  return {
    items: payments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      businessId: payment.order.businessId,
      businessName: payment.order.business.name,
      provider: payment.provider,
      status: kebab(payment.status) as AdminPaymentStatus,
      amount: payment.amount.toString(),
      refundedAmount: payment.refundedAmount.toString(),
      currency: payment.currency,
      providerPaymentId: payment.providerPaymentId,
      providerReference: payment.providerReference,
      failureCode: payment.failureCode,
      failureMessage: payment.failureMessage,
      requestedAt: payment.requestedAt.toISOString(),
      paidAt: payment.paidAt?.toISOString() ?? null,
      failedAt: payment.failedAt?.toISOString() ?? null,
      reconciliation: reconciliation(payment),
    })),
    providers: providers.map((item) => item.provider),
    summary: { succeeded: succeededCount, failed: failedCount, pending: pendingCount, needsReview: Number(anomalyRows[0]?.count ?? 0n) },
    pagination: { page: safePage, pageSize, total, totalPages },
  };
}
