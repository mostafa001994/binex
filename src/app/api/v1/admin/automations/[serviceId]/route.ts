import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { clearAdminAutomationConnector, updateAdminAutomationConnector } from "@/server/admin/admin-automation-service";
import { ValidationApiError } from "@/server/core/api-error";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export async function PATCH(request: NextRequest, context: { params: Promise<{ serviceId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const { serviceId } = await context.params;
    const body = await req.json().catch(() => ({}));
    if (body.operation === "clear") return apiSuccess({ connector: await clearAdminAutomationConnector(user, serviceId) });
    if (body.operation !== "update") throw new ValidationApiError("عملیات اتصال معتبر نیست.");
    return apiSuccess({ connector: await updateAdminAutomationConnector(user, serviceId, body) });
  })(request);
}
