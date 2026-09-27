import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { restoreAdminBlogRevision } from "@/server/admin/admin-blog-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

export async function POST(request: NextRequest, context: { params: Promise<{ postId: string; revisionId: string }> }) {
  return withApiHandler(async (req: NextRequest) => {
    const user = await getAuthenticatedUser(req.cookies.get(AUTH_COOKIE_NAME)?.value);
    const params = await context.params;
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    return apiSuccess({ post: await restoreAdminBlogRevision(user, params.postId, params.revisionId, body.version) });
  })(request);
}
