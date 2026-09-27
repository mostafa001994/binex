import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { transitionAdminCustomSubscription } from "@/server/custom-services/custom-service-service";

export async function PATCH(request: NextRequest, context: { params: Promise<{ subscriptionId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    return apiSuccess({ subscription: await transitionAdminCustomSubscription(user, (await context.params).subscriptionId, await req.json().catch(() => ({}))) });
  })(request);
}
