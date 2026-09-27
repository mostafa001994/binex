import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  createAdminServiceCatalogItem,
  listAdminServiceCatalog,
} from "@/server/admin/admin-service-catalog";

export const dynamic =
  "force-dynamic";

export const GET =
  withApiHandler(
    async (
      request: NextRequest,
    ) => {
      const user =
        await getAuthenticatedUser(
          request.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      return apiSuccess({
        services:
          await listAdminServiceCatalog(
            user,
          ),
      });
    },
  );

export const POST =
  withApiHandler(
    async (
      request: NextRequest,
    ) => {
      const user =
        await getAuthenticatedUser(
          request.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      const body =
        await request
          .json()
          .catch(() => ({}));

      const service =
        await createAdminServiceCatalogItem(
          user,
          body,
        );

      return apiSuccess(
        { service },
        { status: 201 },
      );
    },
  );
