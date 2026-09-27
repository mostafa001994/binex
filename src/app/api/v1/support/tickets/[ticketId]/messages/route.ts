import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { replyToMyTicket } from "@/server/support/support-service";
export async function POST(request: NextRequest, context: { params: Promise<{ ticketId: string }> }) { return withApiHandler(async (req) => apiSuccess({ ticket: await replyToMyTicket(await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value), (await context.params).ticketId, await req.json().catch(() => ({}))) }))(request); }
