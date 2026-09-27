import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { createAdminBlogPost, listAdminBlogPosts } from "@/server/admin/admin-blog-service";

export const dynamic = "force-dynamic";

async function user(request: NextRequest) {
  return getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export const GET = withApiHandler(async (request: NextRequest) => {
  const query = request.nextUrl.searchParams;
  return apiSuccess(await listAdminBlogPosts(await user(request), {
    search: query.get("search") ?? "",
    status: query.get("status") ?? "",
    page: Number(query.get("page") || "1"),
  }));
});
export const POST = withApiHandler(async (request: NextRequest) => apiSuccess({ post: await createAdminBlogPost(await user(request), await request.json().catch(() => ({}))) }, { status: 201 }));
