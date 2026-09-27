import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { updateAdminAccessRole } from "@/server/admin/admin-role-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";
export async function PATCH(request: NextRequest, context: { params: Promise<{ roleId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const { roleId } = await context.params;
    return apiSuccess({ role: await updateAdminAccessRole(user, roleId, await req.json().catch(() => ({}))) });
  })(request);
}
