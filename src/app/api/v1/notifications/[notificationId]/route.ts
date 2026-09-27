import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { markNotification } from "@/server/support/support-service";
export async function PATCH(request: NextRequest, context: { params: Promise<{ notificationId: string }> }) { return withApiHandler(async (req) => apiSuccess(await markNotification(await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value), (await context.params).notificationId)))(request); }
