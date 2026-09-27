import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { getCustomerSubscription } from "@/server/subscriptions/customer-subscription-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subscriptionId: string }> },
) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(
      req.cookies.get(AUTH_COOKIE_NAME)?.value,
    );
    const { subscriptionId } = await context.params;

    return apiSuccess({
      subscription: await getCustomerSubscription(user, subscriptionId),
    });
  })(request);
}
