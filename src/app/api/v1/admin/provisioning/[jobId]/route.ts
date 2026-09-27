import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { retryAdminProvisioningJob } from "@/server/admin/admin-provisioning-service";
import { ValidationApiError } from "@/server/core/api-error";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export async function PATCH(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const body = await req.json().catch(() => ({}));
    if (body.operation !== "retry") throw new ValidationApiError("عملیات راه‌اندازی معتبر نیست.");
    const { jobId } = await context.params;
    return apiSuccess({ job: await retryAdminProvisioningJob(user, jobId) });
  })(request);
}
