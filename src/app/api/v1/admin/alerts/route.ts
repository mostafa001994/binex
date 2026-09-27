import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { getOperationalAlerts } from "@/server/admin/admin-support-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => apiSuccess({ items: await getOperationalAlerts(await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value)) }));
