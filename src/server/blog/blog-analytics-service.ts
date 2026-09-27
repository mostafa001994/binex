import crypto from "node:crypto";
import { getPrismaClient } from "@/server/db/prisma";
import { ValidationApiError } from "@/server/core/api-error";

export type BlogAnalyticsEventName = "view" | "cta_click";

function hashSecret() {
  const secret = process.env.BINIX_ANALYTICS_HASH_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production")
    throw new Error("BINIX_ANALYTICS_HASH_SECRET تنظیم نشده یا کوتاه است.");
  return "binix-local-analytics-secret-not-for-production";
}

function utcDate() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function recordBlogAnalyticsEvent(input: {
  slug: string;
  event: BlogAnalyticsEventName;
  visitorId: string;
}) {
  const slug = input.slug.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,158}[a-z0-9]$/.test(slug))
    throw new ValidationApiError("نامک مقاله معتبر نیست.");
  const prisma = getPrismaClient();
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { id: true, ctaHref: true },
  });
  if (!post || (input.event === "cta_click" && !post.ctaHref))
    return { recorded: false };
  const date = utcDate();
  const event =
    input.event === "view" ? ("VIEW" as const) : ("CTA_CLICK" as const);
  const visitorHash = crypto
    .createHmac("sha256", hashSecret())
    .update(input.visitorId)
    .digest("hex");
  const created = await prisma.blogPostAnalyticsVisitor.createMany({
    data: [{ postId: post.id, date, event, visitorHash }],
    skipDuplicates: true,
  });
  const increments =
    event === "VIEW"
      ? { views: 1, uniqueViews: created.count ? 1 : 0 }
      : { ctaClicks: 1, uniqueCtaClicks: created.count ? 1 : 0 };
  await prisma.blogPostDailyMetric.upsert({
    where: { postId_date: { postId: post.id, date } },
    create: { postId: post.id, date, ...increments },
    update: Object.fromEntries(
      Object.entries(increments).map(([key, value]) => [
        key,
        { increment: value },
      ]),
    ),
  });
  return { recorded: true, unique: Boolean(created.count) };
}
