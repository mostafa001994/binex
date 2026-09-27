import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { transitionAdminCustomOffer, updateAdminCustomOffer } from "@/server/custom-services/custom-service-service";

export async function PATCH(request: NextRequest, context: { params: Promise<{ offerId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const body = await req.json().catch(() => ({}));
    if (body.operation === "update") return apiSuccess({ offer: await updateAdminCustomOffer(user, (await context.params).offerId, body) });
    return apiSuccess({ offer: await transitionAdminCustomOffer(user, (await context.params).offerId, body.operation) });
  })(request);
}
