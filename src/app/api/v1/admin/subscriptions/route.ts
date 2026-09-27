import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { ValidationApiError } from "@/server/core/api-error";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { createAdminSubscription, searchAdminSubscriptions, validateSubscriptionStatus } from "@/server/admin/admin-subscription-service";

export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const params = request.nextUrl.searchParams;
  const status = params.get("status") || "";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "20");
  if (status && !validateSubscriptionStatus(status)) throw new ValidationApiError("وضعیت اشتراک معتبر نیست.");
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ValidationApiError("صفحه‌بندی معتبر نیست.");
  return apiSuccess(await searchAdminSubscriptions(user, {
    search: params.get("search") || "", status: status as Parameters<typeof searchAdminSubscriptions>[1]["status"],
    serviceId: params.get("serviceId") || "", page, pageSize,
  }));
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  return apiSuccess({ subscription: await createAdminSubscription(user, await request.json().catch(() => ({}))) });
});
