import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser } from "@/server/auth/auth-service";
import { createBlogMedia, listBlogMedia, MAX_BLOG_MEDIA_BYTES } from "@/server/admin/admin-blog-service";
import { ValidationApiError } from "@/server/core/api-error";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";

const user = (request: NextRequest) => getAuthenticatedUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);
export const GET = withApiHandler(async (request: NextRequest) => apiSuccess(await listBlogMedia(await user(request), { page: request.nextUrl.searchParams.get("page"), search: request.nextUrl.searchParams.get("search") ?? undefined })));
export const POST = withApiHandler(async (request: NextRequest) => {
  const currentUser = await user(request);
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BLOG_MEDIA_BYTES + 100_000) throw new ValidationApiError("حجم درخواست تصویر بیش از حد مجاز است.");
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ValidationApiError("فایل تصویر انتخاب نشده است.");
  const item = await createBlogMedia(currentUser, { name: file.name, type: file.type, data: await file.arrayBuffer() }, form.get("altText"));
  return apiSuccess({ item }, { status: 201 });
});
