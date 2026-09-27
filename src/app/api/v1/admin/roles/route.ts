import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { createAdminAccessRole, listAdminAccessRoles } from "@/server/admin/admin-role-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";
async function actor(request: NextRequest) { return getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value); }
export const GET = withApiHandler(async (request: NextRequest) => apiSuccess(await listAdminAccessRoles(await actor(request))));
export const POST = withApiHandler(async (request: NextRequest) => apiSuccess({ role: await createAdminAccessRole(await actor(request), await request.json().catch(() => ({}))) }));
