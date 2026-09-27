import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { changeAdminSubscriptionPlan, renewAdminSubscription, transitionAdminSubscription } from "@/server/admin/admin-subscription-service";

export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, context: { params: Promise<{ subscriptionId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const body = await req.json().catch(() => ({}));
    const { subscriptionId } = await context.params;
    if (body.operation === "renew") return apiSuccess({ subscription: await renewAdminSubscription(user, subscriptionId) });
    if (body.operation === "change-plan") return apiSuccess({ subscription: await changeAdminSubscriptionPlan(user, subscriptionId, body.planId) });
    return apiSuccess({ subscription: await transitionAdminSubscription(user, subscriptionId, body.operation) });
  })(request);
}
