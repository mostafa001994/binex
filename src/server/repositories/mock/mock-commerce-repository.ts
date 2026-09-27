import type { AdminOrderRecord, CommerceRepository } from "@/server/repositories/contracts/commerce-repository";

const orders: AdminOrderRecord[] = [];
export class MockCommerceRepository implements CommerceRepository {
  async searchOrders(input: Parameters<CommerceRepository["searchOrders"]>[0]) {
    const query = input.search?.trim().toLowerCase();
    const filtered = orders.filter((order) =>
      (!input.orderStatus || order.status === input.orderStatus) &&
      (!input.paymentStatus || order.payments.some((payment) => payment.status === input.paymentStatus)) &&
      (!input.serviceId || order.items.some((item) => item.serviceId === input.serviceId)) &&
      (!query || order.orderNumber.toLowerCase().includes(query) || order.businessName.toLowerCase().includes(query)),
    );
    return { items: filtered, pagination: { page: 1, pageSize: input.pageSize || 20, total: filtered.length, totalPages: 1 } };
  }
  async findOrderById(id: string) { return orders.find((order) => order.id === id) ?? null; }
  async listOrdersForBusiness(businessId: string, input: { page: number; pageSize: number }) {
    const filtered = orders.filter((order) => order.businessId === businessId);
    const totalPages = Math.max(1, Math.ceil(filtered.length / input.pageSize));
    const safePage = Math.min(input.page, totalPages);
    const start = (safePage - 1) * input.pageSize;
    return {
      items: filtered.slice(start, start + input.pageSize),
      pagination: { page: safePage, pageSize: input.pageSize, total: filtered.length, totalPages },
    };
  }
  async findOrderForBusiness(businessId: string, id: string) {
    return orders.find((order) => order.id === id && order.businessId === businessId) ?? null;
  }
  async countOpenOrdersForBusiness(businessId: string) {
    return orders.filter(
      (order) =>
        order.businessId === businessId &&
        ["pending-payment", "payment-failed"].includes(order.status),
    ).length;
  }
  async updateOrderNote(id: string, note: string | null) {
    const order = await this.findOrderById(id); if (!order) return null; order.internalNote = note; return order;
  }
  async transitionUnpaidOrder(id: string, status: "canceled" | "expired") {
    const order = await this.findOrderById(id); if (!order || !["pending-payment", "payment-failed"].includes(order.status) || order.payments.some((payment) => payment.status === "succeeded")) return null;
    order.status = status; order.canceledAt = status === "canceled" ? new Date().toISOString() : null; return order;
  }
}
