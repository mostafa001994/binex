import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { updateAdminConsultationLead } from "@/server/admin/admin-lead-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ leadId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const { leadId } = await context.params;
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    return apiSuccess({ lead: await updateAdminConsultationLead(user, leadId, await req.json().catch(() => ({}))) });
  })(request);
}
