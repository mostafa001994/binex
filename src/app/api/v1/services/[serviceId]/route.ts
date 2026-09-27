import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { getServiceForUser } from "@/server/services/services-service";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      serviceId: string;
    }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const { serviceId } =
        await context.params;

      const token =
        req.cookies.get(
          AUTH_COOKIE_NAME,
        )?.value;

      const user =
        await getAuthenticatedUser(
          token,
        );

      const snapshot =
        await getServiceForUser(
          user,
          serviceId,
        );

      return apiSuccess(snapshot);
    },
  )(request);
}
