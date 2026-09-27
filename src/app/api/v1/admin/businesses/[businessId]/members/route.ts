import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  addAdminBusinessMember,
} from "@/server/admin/admin-service";
import { ValidationApiError } from "@/server/core/api-error";

export async function POST(
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

      const userId =
        typeof body.userId ===
        "string"
          ? body.userId.trim()
          : "";

      const role:
        | "owner"
        | "admin"
        | "member" =
        body.role === "owner"
          ? "owner"
          : body.role === "admin"
            ? "admin"
            : "member";

      if (!userId) {
        throw new ValidationApiError(
          "userId الزامی است.",
        );
      }

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      const member =
        await addAdminBusinessMember(
          user,
          {
            businessId,
            userId,
            role,
          },
        );

      return apiSuccess(
        { member },
        { status: 201 },
      );
    },
  )(request);
}
