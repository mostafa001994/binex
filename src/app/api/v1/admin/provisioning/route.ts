import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { searchAdminProvisioningJobs, validateProvisioningAction, validateProvisioningStatus } from "@/server/admin/admin-provisioning-service";
import { ValidationApiError } from "@/server/core/api-error";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const params = request.nextUrl.searchParams;
  const status = params.get("status") || "";
  const action = params.get("action") || "";
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "20");
  if (status && !validateProvisioningStatus(status)) throw new ValidationApiError("وضعیت راه‌اندازی معتبر نیست.");
  if (action && !validateProvisioningAction(action)) throw new ValidationApiError("نوع عملیات راه‌اندازی معتبر نیست.");
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new ValidationApiError("صفحه‌بندی معتبر نیست.");
  return apiSuccess(await searchAdminProvisioningJobs(user, {
    search: params.get("search") || "", status: status as Parameters<typeof searchAdminProvisioningJobs>[1]["status"],
    action: action as Parameters<typeof searchAdminProvisioningJobs>[1]["action"], serviceId: params.get("serviceId") || "", page, pageSize,
  }));
});
