import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { getAdminBlogAnalytics } from "@/server/admin/admin-blog-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export const GET = withApiHandler(async (request: NextRequest) =>
  apiSuccess(
    await getAdminBlogAnalytics(
      await getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value),
      request.nextUrl.searchParams.get("postId") ?? "",
      request.nextUrl.searchParams.get("days"),
    ),
  ),
);
