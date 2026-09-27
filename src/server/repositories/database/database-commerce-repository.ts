import { OrderStatus, PaymentStatus, Prisma, type Order } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type { AdminOrderRecord, AdminOrderStatus, AdminPaymentStatus, CommerceRepository } from "@/server/repositories/contracts/commerce-repository";

const orderStatusToDb: Record<AdminOrderStatus, OrderStatus> = {
  "pending-payment": OrderStatus.PENDING_PAYMENT,
  paid: OrderStatus.PAID,
  "payment-failed": OrderStatus.PAYMENT_FAILED,
  canceled: OrderStatus.CANCELED,
  expired: OrderStatus.EXPIRED,
  refunded: OrderStatus.REFUNDED,
  "partially-refunded": OrderStatus.PARTIALLY_REFUNDED,
};
const paymentStatusToDb: Record<AdminPaymentStatus, PaymentStatus> = {
  initiated: PaymentStatus.INITIATED,
  pending: PaymentStatus.PENDING,
  succeeded: PaymentStatus.SUCCEEDED,
  failed: PaymentStatus.FAILED,
  canceled: PaymentStatus.CANCELED,
  refunded: PaymentStatus.REFUNDED,
  "partially-refunded": PaymentStatus.PARTIALLY_REFUNDED,
};
const include = {
  business: { select: { name: true } },
  createdBy: { select: { name: true, phone: true } },
  items: { orderBy: { createdAt: "asc" as const } },
  payments: { orderBy: { createdAt: "desc" as const } },
} as const;
type OrderWithRelations = Order & {
  business: { name: string };
  createdBy: { name: string | null; phone: string } | null;
  items: Array<{
    id: string; serviceId: string | null; serviceNameSnapshot: string; planNameSnapshot: string;
    planCodeSnapshot: string; type: string; billingPeriodSnapshot: string; unitAmount: bigint;
    quantity: number; totalAmount: bigint; subscriptionId: string | null;
  }>;
  payments: Array<{
    id: string; provider: string; status: string; amount: bigint; refundedAmount: bigint;
    currency: string; providerPaymentId: string | null; providerReference: string | null;
    failureCode: string | null; failureMessage: string | null;
    requestedAt: Date; paidAt: Date | null; failedAt: Date | null;
  }>;
};

function kebab(value: string) { return value.toLowerCase().replaceAll("_", "-"); }
function internalNote(metadata: Prisma.JsonValue) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  return typeof metadata.internalNote === "string" ? metadata.internalNote : null;
}
function record(order: OrderWithRelations): AdminOrderRecord {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    businessId: order.businessId,
    businessName: order.business.name,
    createdByName: order.createdBy?.name ?? null,
    createdByPhone: order.createdBy?.phone ?? null,
    status: kebab(order.status) as AdminOrderStatus,
    currency: order.currency,
    subtotalAmount: order.subtotalAmount.toString(),
    discountAmount: order.discountAmount.toString(),
    taxAmount: order.taxAmount.toString(),
    totalAmount: order.totalAmount.toString(),
    expiresAt: order.expiresAt?.toISOString() ?? null,
    paidAt: order.paidAt?.toISOString() ?? null,
    canceledAt: order.canceledAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    internalNote: internalNote(order.metadata),
    items: order.items.map((item) => ({
      id: item.id, serviceId: item.serviceId, serviceName: item.serviceNameSnapshot,
      planName: item.planNameSnapshot, planCode: item.planCodeSnapshot,
      type: kebab(item.type) as AdminOrderRecord["items"][number]["type"],
      billingPeriod: kebab(item.billingPeriodSnapshot) as AdminOrderRecord["items"][number]["billingPeriod"],
      unitAmount: item.unitAmount.toString(), quantity: item.quantity,
      totalAmount: item.totalAmount.toString(), subscriptionId: item.subscriptionId,
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id, provider: payment.provider,
      status: kebab(payment.status) as AdminPaymentStatus,
      amount: payment.amount.toString(), refundedAmount: payment.refundedAmount.toString(),
      currency: payment.currency, providerPaymentId: payment.providerPaymentId,
      providerReference: payment.providerReference, failureCode: payment.failureCode,
      failureMessage: payment.failureMessage, requestedAt: payment.requestedAt.toISOString(),
      paidAt: payment.paidAt?.toISOString() ?? null, failedAt: payment.failedAt?.toISOString() ?? null,
    })),
  };
}

export class DatabaseCommerceRepository implements CommerceRepository {
  async searchOrders(input: Parameters<CommerceRepository["searchOrders"]>[0]) {
    const page = Math.max(1, Math.floor(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize || 20)));
    const query = input.search?.trim();
    const where: Prisma.OrderWhereInput = {
      status: input.orderStatus ? orderStatusToDb[input.orderStatus] : undefined,
      items: input.serviceId ? { some: { serviceId: input.serviceId } } : undefined,
      payments: input.paymentStatus ? { some: { status: paymentStatusToDb[input.paymentStatus] } } : undefined,
      OR: query ? [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { business: { name: { contains: query, mode: "insensitive" } } },
        { createdBy: { is: { name: { contains: query, mode: "insensitive" } } } },
        { createdBy: { is: { phone: { contains: query } } } },
        { payments: { some: { providerReference: { contains: query, mode: "insensitive" } } } },
      ] : undefined,
    };
    const prisma = getPrismaClient();
    const total = await prisma.order.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const items = await prisma.order.findMany({
      where, include, orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize, take: pageSize,
    });
    return { items: items.map((item) => record(item as OrderWithRelations)), pagination: { page: safePage, pageSize, total, totalPages } };
  }

  async findOrderById(id: string) {
    const order = await getPrismaClient().order.findUnique({ where: { id }, include });
    return order ? record(order as OrderWithRelations) : null;
  }

  async listOrdersForBusiness(
    businessId: string,
    input: { page: number; pageSize: number },
  ) {
    const prisma = getPrismaClient();
    const total = await prisma.order.count({ where: { businessId } });
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
    const safePage = Math.min(input.page, totalPages);
    const orders = await prisma.order.findMany({
      where: { businessId },
      include,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * input.pageSize,
      take: input.pageSize,
    });

    return {
      items: orders.map((order) => record(order as OrderWithRelations)),
      pagination: {
        page: safePage,
        pageSize: input.pageSize,
        total,
        totalPages,
      },
    };
  }

  async findOrderForBusiness(businessId: string, id: string) {
    const order = await getPrismaClient().order.findFirst({
      where: { id, businessId },
      include,
    });
    return order ? record(order as OrderWithRelations) : null;
  }

  async countOpenOrdersForBusiness(businessId: string) {
    return getPrismaClient().order.count({
      where: {
        businessId,
        status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_FAILED] },
      },
    });
  }

  async updateOrderNote(id: string, note: string | null) {
    const prisma = getPrismaClient();
    const current = await prisma.order.findUnique({ where: { id }, select: { metadata: true } });
    if (!current) return null;
    const metadata = current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
      ? { ...current.metadata, internalNote: note }
      : { internalNote: note };
    const order = await prisma.order.update({ where: { id }, data: { metadata: metadata as Prisma.InputJsonValue }, include });
    return record(order as OrderWithRelations);
  }

  async transitionUnpaidOrder(id: string, status: "canceled" | "expired") {
    const prisma = getPrismaClient();
    const changed = await prisma.order.updateMany({
      where: {
        id,
        status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_FAILED] },
        payments: { none: { status: PaymentStatus.SUCCEEDED } },
      },
      data: {
        status: status === "canceled" ? OrderStatus.CANCELED : OrderStatus.EXPIRED,
        canceledAt: status === "canceled" ? new Date() : null,
      },
    });
    if (!changed.count) return null;
    return this.findOrderById(id);
  }
}
