import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  getAdminBusiness,
  updateAdminBusinessStatus,
} from "@/server/admin/admin-service";
import type { BusinessStatus } from "@/server/business/business-types";
import {
  archiveAdminBusiness,
  restoreAdminBusiness,
  updateAdminBusinessProfile,
} from "@/server/admin/admin-business-lifecycle-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  routeContext: {
    params: Promise<{ businessId: string }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const { businessId } =
        await routeContext.params;
      const token =
        req.cookies.get(
          AUTH_COOKIE_NAME,
        )?.value;
      const user =
        await getAuthenticatedUser(token);

      return apiSuccess(
        await getAdminBusiness(
          user,
          businessId,
        ),
      );
    },
  )(request);
}

export async function PATCH(
  request: NextRequest,
  routeContext: {
    params: Promise<{ businessId: string }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const { businessId } =
        await routeContext.params;
      const token =
        req.cookies.get(
          AUTH_COOKIE_NAME,
        )?.value;
      const user =
        await getAuthenticatedUser(token);
      const body =
        await req.json().catch(() => ({}));

      if (body.operation === "update-profile") {
        return apiSuccess({ business: await updateAdminBusinessProfile(user, businessId, body) });
      }

      if (body.operation === "archive") {
        return apiSuccess({ business: await archiveAdminBusiness(user, businessId) });
      }

      if (body.operation === "restore") {
        return apiSuccess({ business: await restoreAdminBusiness(user, businessId) });
      }

      const business =
        await updateAdminBusinessStatus(
          user,
          businessId,
          body.status as BusinessStatus,
        );

      return apiSuccess({ business });
    },
  )(request);
}
