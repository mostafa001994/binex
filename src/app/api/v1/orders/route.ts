import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { listCustomerOrders } from "@/server/commerce/customer-commerce-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );
  const page = Number(request.nextUrl.searchParams.get("page") || "1");
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") || "20");

  return apiSuccess(await listCustomerOrders(user, { page, pageSize }));
});
