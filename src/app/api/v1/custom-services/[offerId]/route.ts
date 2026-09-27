import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { getCustomerCustomOffer } from "@/server/custom-services/custom-service-service";

export async function GET(request: NextRequest, context: { params: Promise<{ offerId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    return apiSuccess({ offer: await getCustomerCustomOffer(user, (await context.params).offerId) });
  })(request);
}
