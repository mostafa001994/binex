import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  transferAdminBusinessOwnership,
} from "@/server/admin/admin-service";
import { ValidationApiError } from "@/server/core/api-error";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      businessId: string;
    }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const { businessId } =
        await context.params;

      const body =
        await req
          .json()
          .catch(() => ({}));

      const newOwnerMemberId =
        typeof body.newOwnerMemberId ===
        "string"
          ? body.newOwnerMemberId.trim()
          : "";

      if (!newOwnerMemberId) {
        throw new ValidationApiError(
          "عضو مقصد برای انتقال مالکیت الزامی است.",
        );
      }

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      const result =
        await transferAdminBusinessOwnership(
          user,
          {
            businessId,
            newOwnerMemberId,
          },
        );

      return apiSuccess(result);
    },
  )(request);
}
