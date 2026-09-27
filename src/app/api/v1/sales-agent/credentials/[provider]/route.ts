import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { deleteSalesAgentCredential } from "@/server/sales-agent/sales-agent-service";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  routeContext: { params: Promise<{ provider: string }> },
) {
  return withApiHandler(async (req: NextRequest) => {
    const { provider } = await routeContext.params;
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const user = await getAuthenticatedUser(token);

    return apiSuccess(
      await deleteSalesAgentCredential(user, provider),
    );
  })(request);
}
