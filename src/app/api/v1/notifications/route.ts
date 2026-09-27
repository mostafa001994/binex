import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { listMyNotifications, markAllNotifications } from "@/server/support/support-service";
export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => apiSuccess(await listMyNotifications(await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value))));
export const PATCH = withApiHandler(async (request: NextRequest) => apiSuccess(await markAllNotifications(await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value))));
