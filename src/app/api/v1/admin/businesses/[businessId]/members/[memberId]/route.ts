import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  removeAdminBusinessMember,
} from "@/server/admin/admin-service";

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      businessId: string;
      memberId: string;
    }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const {
        businessId,
        memberId,
      } =
        await context.params;

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      await removeAdminBusinessMember(
        user,
        {
          businessId,
          memberId,
        },
      );

      return apiSuccess({
        deleted: true,
      });
    },
  )(request);
}
