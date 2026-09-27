import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { getAdminSupportMetrics, listAdminSupportTickets } from "@/server/admin/admin-support-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
export const dynamic = "force-dynamic";
export const GET = withApiHandler(async (request: NextRequest) => { const q = request.nextUrl.searchParams; const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value); const [items, metrics] = await Promise.all([listAdminSupportTickets(user, { search: q.get("search") ?? "", status: q.get("status") ?? "", priority: q.get("priority") ?? "", assignee: q.get("assignee") ?? "", breach: q.get("breach") ?? "" }), getAdminSupportMetrics(user)]); return apiSuccess({ items, metrics }); });
