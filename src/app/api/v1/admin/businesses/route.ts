import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { ValidationApiError } from "@/server/core/api-error";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { listAdminBusinesses } from "@/server/admin/admin-service";
import { createAdminBusiness } from "@/server/admin/admin-business-lifecycle-service";
import type {
  BusinessService,
  BusinessStatus,
} from "@/server/business/business-types";

export const dynamic =
  "force-dynamic";

export const GET =
  withApiHandler(
    async (
      request: NextRequest,
    ) => {
      const token =
        request.cookies.get(
          AUTH_COOKIE_NAME,
        )?.value;

      const user =
        await getAuthenticatedUser(
          token,
        );

      const statusParam =
        request.nextUrl.searchParams.get(
          "status",
        ) || "";

      if (
        statusParam &&
        statusParam !== "active" &&
        statusParam !==
          "suspended" &&
        statusParam !== "archived"
      ) {
        throw new ValidationApiError(
          "فیلتر وضعیت کسب‌وکار معتبر نیست.",
        );
      }

      const serviceStatusParam =
        request.nextUrl.searchParams.get(
          "serviceStatus",
        ) || "";

      if (
        serviceStatusParam &&
        serviceStatusParam !==
          "setup" &&
        serviceStatusParam !==
          "active" &&
        serviceStatusParam !==
          "paused" &&
        serviceStatusParam !==
          "coming-soon"
      ) {
        throw new ValidationApiError(
          "فیلتر وضعیت سرویس معتبر نیست.",
        );
      }

      const page = Number(
        request.nextUrl.searchParams.get(
          "page",
        ) || "1",
      );

      const pageSize = Number(
        request.nextUrl.searchParams.get(
          "pageSize",
        ) || "20",
      );

      if (
        !Number.isInteger(page) ||
        page < 1
      ) {
        throw new ValidationApiError(
          "شماره صفحه معتبر نیست.",
        );
      }

      if (
        !Number.isInteger(
          pageSize,
        ) ||
        pageSize < 1 ||
        pageSize > 100
      ) {
        throw new ValidationApiError(
          "تعداد نتایج هر صفحه باید بین ۱ تا ۱۰۰ باشد.",
        );
      }

      const result =
        await listAdminBusinesses(
          user,
          {
            search:
              request.nextUrl.searchParams.get(
                "search",
              ) || "",
            status:
              statusParam as
                | BusinessStatus
                | "",
            serviceStatus:
              serviceStatusParam as
                | BusinessService["status"]
                | "",
            page,
            pageSize,
          },
        );

      return apiSuccess(result);
    },
  );

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const body = await request.json().catch(() => ({}));
  return apiSuccess({ business: await createAdminBusiness(user, body) });
});
