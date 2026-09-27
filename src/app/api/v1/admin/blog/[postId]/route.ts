import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { deleteAdminBlogPost, getAdminBlogPost, updateAdminBlogPost } from "@/server/admin/admin-blog-service";

async function user(request: NextRequest) {
  return getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  return withApiHandler(async (req: NextRequest) => apiSuccess({ post: await getAdminBlogPost(await user(req), (await context.params).postId) }))(request);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  return withApiHandler(async (req: NextRequest) => apiSuccess({ post: await updateAdminBlogPost(await user(req), (await context.params).postId, await req.json().catch(() => ({}))) }))(request);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    await deleteAdminBlogPost(await user(req), (await context.params).postId, req.nextUrl.searchParams.get("version"));
    return apiSuccess({ deleted: true });
  })(request);
}
