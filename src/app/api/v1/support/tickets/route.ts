import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { createMyTicket, listMyTickets } from "@/server/support/support-service";
export const dynamic = "force-dynamic";
async function user(request: NextRequest) { return getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value); }
export const GET = withApiHandler(async (request) => apiSuccess({ items: await listMyTickets(await user(request)) }));
export const POST = withApiHandler(async (request) => apiSuccess({ ticket: await createMyTicket(await user(request), await request.json().catch(() => ({}))) }, { status: 201 }));
