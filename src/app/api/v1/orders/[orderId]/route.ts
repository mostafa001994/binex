import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { getCustomerOrder } from "@/server/commerce/customer-commerce-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(
      req.cookies.get(AUTH_COOKIE_NAME)?.value,
    );
    const { orderId } = await context.params;

    return apiSuccess({ order: await getCustomerOrder(user, orderId) });
  })(request);
}
