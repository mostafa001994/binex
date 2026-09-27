import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { listAdminBlogRevisions } from "@/server/admin/admin-blog-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export async function GET(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    return apiSuccess({ revisions: await listAdminBlogRevisions(user, (await context.params).postId) });
  })(request);
}
