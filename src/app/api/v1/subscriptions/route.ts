import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { listCustomerSubscriptions } from "@/server/subscriptions/customer-subscription-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );

  return apiSuccess(await listCustomerSubscriptions(user));
});
