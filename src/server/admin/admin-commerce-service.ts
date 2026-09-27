import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import { getAuditRepository, getCommerceRepository } from "@/server/repositories/repository-provider";
import { ConflictApiError, NotFoundApiError, ValidationApiError } from "@/server/core/api-error";
import type { AdminOrderStatus, AdminPaymentStatus, CommerceSearchInput } from "@/server/repositories/contracts/commerce-repository";

const orderStatuses = new Set<AdminOrderStatus>(["pending-payment", "paid", "payment-failed", "canceled", "expired", "refunded", "partially-refunded"]);
const paymentStatuses = new Set<AdminPaymentStatus>(["initiated", "pending", "succeeded", "failed", "canceled", "refunded", "partially-refunded"]);

export function searchAdminOrders(user: AuthUser, input: CommerceSearchInput) {
  requireAdminPermission(user, "admin.orders.read");
  return getCommerceRepository().searchOrders(input);
}
export function validateAdminOrderStatus(value: string): value is AdminOrderStatus {
  return orderStatuses.has(value as AdminOrderStatus);
}
export function validateAdminPaymentStatus(value: string): value is AdminPaymentStatus {
  return paymentStatuses.has(value as AdminPaymentStatus);
}

export async function getAdminOrder(user: AuthUser, orderId: string) {
  requireAdminPermission(user, "admin.orders.read");
  const order = await getCommerceRepository().findOrderById(orderId);
  if (!order) throw new NotFoundApiError("سفارش پیدا نشد.");
  return order;
}

export async function updateAdminOrderNote(user: AuthUser, orderId: string, noteValue: unknown) {
  requireAdminPermission(user, "admin.orders.manage");
  if (typeof noteValue !== "string") throw new ValidationApiError("متن یادداشت معتبر نیست.");
  const note = noteValue.trim() || null;
  if (note && note.length > 2000) throw new ValidationApiError("یادداشت حداکثر ۲۰۰۰ کاراکتر است.");
  const before = await getCommerceRepository().findOrderById(orderId);
  if (!before) throw new NotFoundApiError("سفارش پیدا نشد.");
  const updated = await getCommerceRepository().updateOrderNote(orderId, note);
  if (!updated) throw new NotFoundApiError("سفارش پیدا نشد.");
  await getAuditRepository().create({ actorUserId: user.id, action: "order_note_updated", targetType: "order", targetId: orderId, metadata: { businessId: before.businessId, hadNote: Boolean(before.internalNote), hasNote: Boolean(note) } });
  return updated;
}

export async function transitionAdminUnpaidOrder(user: AuthUser, orderId: string, operation: unknown) {
  requireAdminPermission(user, "admin.orders.manage");
  if (operation !== "cancel" && operation !== "expire") throw new ValidationApiError("عملیات سفارش معتبر نیست.");
  const before = await getCommerceRepository().findOrderById(orderId);
  if (!before) throw new NotFoundApiError("سفارش پیدا نشد.");
  if (before.payments.some((payment) => payment.status === "succeeded")) throw new ConflictApiError("سفارش دارای پرداخت موفق از پنل قابل تغییر نیست.");
  const updated = await getCommerceRepository().transitionUnpaidOrder(orderId, operation === "cancel" ? "canceled" : "expired");
  if (!updated) throw new ConflictApiError("فقط سفارش پرداخت‌نشده و باز قابل لغو یا انقضا است.");
  await getAuditRepository().create({ actorUserId: user.id, action: operation === "cancel" ? "order_canceled" : "order_expired", targetType: "order", targetId: orderId, metadata: { businessId: before.businessId, beforeStatus: before.status, afterStatus: updated.status } });
  return updated;
}
