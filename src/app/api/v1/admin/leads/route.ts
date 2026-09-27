import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { listAdminConsultationLeads } from "@/server/admin/admin-lead-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const query = request.nextUrl.searchParams;
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  return apiSuccess(await listAdminConsultationLeads(user, {
    search: query.get("search") ?? "",
    status: query.get("status") ?? "",
    source: query.get("source") ?? "",
    page: Number(query.get("page") ?? 1),
  }));
});
