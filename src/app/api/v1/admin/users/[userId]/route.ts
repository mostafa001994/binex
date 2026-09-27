import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  getAdminUser,
  revokeAdminUserSessions,
  updateAdminUserStatus,
} from "@/server/admin/admin-service";
import { assignAdminAccessRole } from "@/server/admin/admin-role-service";
import { updateAdminUserIdentity } from "@/server/admin/admin-user-lifecycle-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  routeContext: {
    params: Promise<{ userId: string }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const { userId } =
        await routeContext.params;
      const token =
        req.cookies.get(
          AUTH_COOKIE_NAME,
        )?.value;
      const user =
        await getAuthenticatedUser(token);

      return apiSuccess(
        await getAdminUser(user, userId),
      );
    },
  )(request);
}

export async function PATCH(
  request: NextRequest,
  routeContext: {
    params: Promise<{ userId: string }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const { userId } =
        await routeContext.params;
      const token =
        req.cookies.get(
          AUTH_COOKIE_NAME,
        )?.value;
      const user =
        await getAuthenticatedUser(token);
      const body =
        await req.json().catch(() => ({}));

      if (body.operation === "set-status") {
        return apiSuccess(await updateAdminUserStatus(user, userId, body.status));
      }

      if (body.operation === "revoke-sessions") {
        return apiSuccess(await revokeAdminUserSessions(user, userId));
      }

      if (body.operation === "update-profile") {
        return apiSuccess({ user: await updateAdminUserIdentity(user, userId, body) });
      }

      const updated = await assignAdminAccessRole(user, userId, body.accessRoleId);
      return apiSuccess({ user: updated });
    },
  )(request);
}
