import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { ValidationApiError, NotFoundApiError } from "@/server/core/api-error";
import { getUserRepository } from "@/server/repositories/repository-provider";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);

  return apiSuccess({
    authenticated: true,
    user,
  });
});

export const PATCH = withApiHandler(async (request: NextRequest) => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = await getAuthenticatedUser(token);
  const body = await request.json().catch(() => ({}));

  const hasName = Object.prototype.hasOwnProperty.call(body, "name");
  const preferenceValue = body.preferences?.importantNotificationsOnly;
  const hasPreference = preferenceValue !== undefined;

  if (hasName && typeof body.name !== "string") {
    throw new ValidationApiError("نام معتبر نیست.", {
      name: ["نام باید متن باشد."],
    });
  }

  if (hasPreference && typeof preferenceValue !== "boolean") {
    throw new ValidationApiError("تنظیم اعلان معتبر نیست.", {
      importantNotificationsOnly: ["مقدار تنظیم اعلان باید درست یا نادرست باشد."],
    });
  }

  if (!hasName && !hasPreference) {
    throw new ValidationApiError("تغییری برای ذخیره ارسال نشده است.");
  }

  const name = hasName ? body.name.trim() : undefined;

  if (name !== undefined && name.length > 80) {
    throw new ValidationApiError("نام بیش از حد طولانی است.", {
      name: ["حداکثر ۸۰ کاراکتر مجاز است."],
    });
  }

  const updated = await getUserRepository().updateProfile(user.id, {
    name: name === undefined ? undefined : name || null,
    importantNotificationsOnly: hasPreference ? preferenceValue : undefined,
  });

  if (!updated) {
    throw new NotFoundApiError("حساب کاربری پیدا نشد.");
  }

  return apiSuccess({
    authenticated: true,
    user: updated,
  });
});
