import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { ValidationApiError } from "@/server/core/api-error";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { listAdminPayments, validatePaymentStatus } from "@/server/admin/admin-payment-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const params = request.nextUrl.searchParams;
  const status = params.get("status") || "";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "20");
  if (status && !validatePaymentStatus(status)) throw new ValidationApiError("وضعیت پرداخت معتبر نیست.");
  if (!Number.isInteger(page) || page < 1) throw new ValidationApiError("شماره صفحه معتبر نیست.");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ValidationApiError("تعداد نتایج هر صفحه باید بین ۱ تا ۱۰۰ باشد.");
  return apiSuccess(await listAdminPayments(user, {
    search: params.get("search") || "",
    provider: params.get("provider") || "",
    status: status as Parameters<typeof listAdminPayments>[1]["status"],
    page,
    pageSize,
  }));
});
