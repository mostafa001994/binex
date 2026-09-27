import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { getDashboardPayload } from "@/server/dashboard/dashboard-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const dashboard = await getDashboardPayload(user);

  return apiSuccess(dashboard);
});
