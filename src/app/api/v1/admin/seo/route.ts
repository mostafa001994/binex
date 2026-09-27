import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  listAdminSeoSettings,
  resetAdminSeoSetting,
  updateAdminSeoSetting,
} from "@/server/seo/site-seo-service";

export const dynamic = "force-dynamic";

const user = (request: NextRequest) =>
  getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);

export const GET = withApiHandler(async (request: NextRequest) =>
  apiSuccess(await listAdminSeoSettings(await user(request))),
);

export const PUT = withApiHandler(async (request: NextRequest) =>
  apiSuccess(
    await updateAdminSeoSetting(
      await user(request),
      await request.json().catch(() => ({})),
    ),
  ),
);

export const DELETE = withApiHandler(async (request: NextRequest) =>
  apiSuccess(
    await resetAdminSeoSetting(
      await user(request),
      request.nextUrl.searchParams.get("path") ?? "",
    ),
  ),
);
