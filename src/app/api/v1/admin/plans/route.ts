import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { createAdminPlan, listAdminPlans } from "@/server/admin/admin-plan-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  return apiSuccess({ plans: await listAdminPlans(user, request.nextUrl.searchParams.get("serviceId") || undefined) });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const body = await request.json().catch(() => ({}));
  return apiSuccess({ plan: await createAdminPlan(user, body) }, { status: 201 });
});
