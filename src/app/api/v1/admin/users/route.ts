import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { ValidationApiError } from "@/server/core/api-error";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { listAdminUsers } from "@/server/admin/admin-service";
import { createAdminUser } from "@/server/admin/admin-user-lifecycle-service";

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

      const search =
        request.nextUrl.searchParams.get(
          "search",
        ) || "";

      const roleId =
        request.nextUrl.searchParams.get(
          "roleId",
        ) || "";

      const statusParam = request.nextUrl.searchParams.get("status") || "";

      if (roleId && !/^[0-9a-f-]{36}$/i.test(roleId)) {
        throw new ValidationApiError(
          "فیلتر نقش معتبر نیست.",
        );
      }

      if (statusParam && statusParam !== "active" && statusParam !== "blocked") {
        throw new ValidationApiError("فیلتر وضعیت کاربر معتبر نیست.");
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
        await listAdminUsers(
          user,
          {
            search,
            roleId,
            status: statusParam as "active" | "blocked" | "",
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
  return apiSuccess({ user: await createAdminUser(user, body) });
});
