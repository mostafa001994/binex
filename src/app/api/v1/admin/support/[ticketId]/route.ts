import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { getAdminSupportTicket, updateAdminSupportTicket } from "@/server/admin/admin-support-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
export async function GET(request: NextRequest, context: { params: Promise<{ ticketId: string }> }) { return withApiHandler(async (req) => apiSuccess({ ticket: await getAdminSupportTicket(await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value), (await context.params).ticketId) }))(request); }
export async function PATCH(request: NextRequest, context: { params: Promise<{ ticketId: string }> }) { return withApiHandler(async (req) => apiSuccess({ ticket: await updateAdminSupportTicket(await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value), (await context.params).ticketId, await req.json().catch(() => ({}))) }))(request); }
