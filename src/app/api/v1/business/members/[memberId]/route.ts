import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { removeCurrentBusinessMember, updateCurrentBusinessMember } from "@/server/business/business-service";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ memberId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const user = await getAuthenticatedUser(token);
    const { memberId } = await context.params;
    const body = await req.json().catch(() => ({}));
    return apiSuccess(await updateCurrentBusinessMember(user, memberId, body));
  })(request);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ memberId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const user = await getAuthenticatedUser(token);
    const { memberId } = await context.params;
    return apiSuccess(await removeCurrentBusinessMember(user, memberId));
  })(request);
}
