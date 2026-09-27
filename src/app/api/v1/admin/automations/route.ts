import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { listAdminAutomationConnectors } from "@/server/admin/admin-automation-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  return apiSuccess({ items: await listAdminAutomationConnectors(user) });
});
