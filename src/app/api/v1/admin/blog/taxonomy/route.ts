import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { createBlogTaxonomy, deleteBlogTaxonomy, listBlogTaxonomy, updateBlogTaxonomy } from "@/server/admin/admin-blog-service";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

const user = (request: NextRequest) => getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
export const GET = withApiHandler(async (request: NextRequest) => apiSuccess(await listBlogTaxonomy(await user(request))));
export const POST = withApiHandler(async (request: NextRequest) => apiSuccess(await createBlogTaxonomy(await user(request), await request.json().catch(() => ({}))), { status: 201 }));
export const PATCH = withApiHandler(async (request: NextRequest) => apiSuccess(await updateBlogTaxonomy(await user(request), await request.json().catch(() => ({})))));
export const DELETE = withApiHandler(async (request: NextRequest) => {
  await deleteBlogTaxonomy(await user(request), request.nextUrl.searchParams.get("kind") ?? "", request.nextUrl.searchParams.get("id") ?? "", request.nextUrl.searchParams.get("replacementId") ?? "");
  return apiSuccess({ deleted: true });
});
