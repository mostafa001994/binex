import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import {
  deleteBlogMedia,
  getBlogMediaDetails,
  updateBlogMedia,
} from "@/server/admin/admin-blog-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export async function DELETE(request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    await deleteBlogMedia(user, (await context.params).mediaId);
    return apiSuccess({ deleted: true });
  })(request);
}

export async function GET(request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    return apiSuccess({ item: await getBlogMediaDetails(user, (await context.params).mediaId) });
  })(request);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    return apiSuccess({
      item: await updateBlogMedia(
        user,
        (await context.params).mediaId,
        await req.json().catch(() => ({})),
      ),
    });
  })(request);
}
