import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  deleteAdminServiceCatalogItem,
  updateAdminServiceCatalogItem,
} from "@/server/admin/admin-service-catalog";

export const dynamic =
  "force-dynamic";

export async function PATCH(
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

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      const body =
        await req
          .json()
          .catch(() => ({}));

      const service =
        await updateAdminServiceCatalogItem(
          user,
          serviceId,
          body,
        );

      return apiSuccess({
        service,
      });
    },
  )(request);
}

export async function DELETE(
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

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      await deleteAdminServiceCatalogItem(
        user,
        serviceId,
      );

      return apiSuccess({
        deleted: true,
      });
    },
  )(request);
}
