import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { getCurrentBusinessContext } from "@/server/business/business-service";
import { ValidationApiError, NotFoundApiError } from "@/server/core/api-error";
import { getBusinessRepository } from "@/server/repositories/repository-provider";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const context = await getCurrentBusinessContext(user);

  return apiSuccess(context);
});

export const PATCH = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const context = await getCurrentBusinessContext(user);

  if (context.membership.role !== "owner") {
    throw new ValidationApiError(
      "فقط مالک کسب‌وکار می‌تواند اطلاعات کسب‌وکار را تغییر دهد.",
    );
  }

  const body = await request.json().catch(() => ({}));

  if (typeof body.name !== "string" || !body.name.trim()) {
    throw new ValidationApiError("نام کسب‌وکار الزامی است.", {
      name: ["نام کسب‌وکار را وارد کنید."],
    });
  }

  const name = body.name.trim();

  if (name.length > 100) {
    throw new ValidationApiError("نام کسب‌وکار بیش از حد طولانی است.", {
      name: ["حداکثر ۱۰۰ کاراکتر مجاز است."],
    });
  }

  const business = await getBusinessRepository().update(
    context.business.id,
    { name },
  );

  if (!business) {
    throw new NotFoundApiError("کسب‌وکار پیدا نشد.");
  }

  return apiSuccess({
    ...context,
    business,
  });
});
