import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { ValidationApiError } from "@/server/core/api-error";
import {
  recordBlogAnalyticsEvent,
  type BlogAnalyticsEventName,
} from "@/server/blog/blog-analytics-service";

const VISITOR_COOKIE = "binix_blog_visitor";

function shouldUseSecureCookie(request: NextRequest) {
  const configuredUrl =
    process.env.BINIX_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.nextUrl.origin;
  try {
    return new URL(configuredUrl).protocol === "https:";
  } catch {
    return request.nextUrl.protocol === "https:";
  }
}

export const POST = withApiHandler(async (request: NextRequest) => {
  if (request.headers.get("sec-fetch-site") === "cross-site")
    return apiSuccess({ recorded: false });
  if (
    request.headers.get("sec-gpc") === "1" ||
    request.headers.get("dnt") === "1"
  )
    return apiSuccess({ recorded: false });
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const event =
    body.event === "view" || body.event === "cta_click"
      ? (body.event as BlogAnalyticsEventName)
      : null;
  if (!event) throw new ValidationApiError("نوع رویداد معتبر نیست.");
  const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId =
    existingVisitor && /^[0-9a-f-]{36}$/i.test(existingVisitor)
      ? existingVisitor
      : crypto.randomUUID();
  const result = await recordBlogAnalyticsEvent({
    slug: String(body.slug ?? ""),
    event,
    visitorId,
  });
  const response = apiSuccess(result);
  if (!existingVisitor)
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: shouldUseSecureCookie(request),
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  return response;
});
