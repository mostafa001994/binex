import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { searchAdminOrders, validateAdminOrderStatus, validateAdminPaymentStatus } from "@/server/admin/admin-commerce-service";
import { ValidationApiError } from "@/server/core/api-error";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const params = request.nextUrl.searchParams;
  const orderStatus = params.get("orderStatus") || "";
  const paymentStatus = params.get("paymentStatus") || "";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "20");
  if (orderStatus && !validateAdminOrderStatus(orderStatus)) throw new ValidationApiError("وضعیت سفارش معتبر نیست.");
  if (paymentStatus && !validateAdminPaymentStatus(paymentStatus)) throw new ValidationApiError("وضعیت پرداخت معتبر نیست.");
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ValidationApiError("صفحه‌بندی معتبر نیست.");
  return apiSuccess(await searchAdminOrders(user, {
    search: params.get("search") || "", orderStatus: orderStatus as Parameters<typeof searchAdminOrders>[1]["orderStatus"],
    paymentStatus: paymentStatus as Parameters<typeof searchAdminOrders>[1]["paymentStatus"],
    serviceId: params.get("serviceId") || "", page, pageSize,
  }));
});
