import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import sharp from "sharp";
import type { Prisma } from "@/generated/prisma/client";
import type { AuthUser } from "@/server/auth/auth-types";
import { requireAdminPermission } from "@/server/admin/admin-service";
import {
  renderBlogDocument,
  sanitizeBlogHtml,
} from "@/server/blog/blog-content";
import {
  blogMediaObjectKey,
  deleteBlogMediaObject,
  objectStorageEnabled,
  putBlogMediaObject,
} from "@/server/blog/blog-object-storage";
import {
  ConflictApiError,
  NotFoundApiError,
  ValidationApiError,
} from "@/server/core/api-error";
import { getPrismaClient } from "@/server/db/prisma";
import { createDatabaseAuditLog } from "@/server/repositories/database/database-audit-repository";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POST_STATUSES = new Set(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]);
const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
export const MAX_BLOG_MEDIA_BYTES = 5 * 1024 * 1024;
const MAX_BLOG_MEDIA_PIXELS = 40_000_000;

function hasValidImageSignature(type: string, bytes: Uint8Array) {
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return (
      bytes.length >= 8 &&
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
        (value, index) => bytes[index] === value,
      )
    );
  if (type === "image/gif") return ["GIF87a", "GIF89a"].includes(ascii(0, 6));
  if (type === "image/webp")
    return ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  if (type === "image/avif")
    return ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4));
  return false;
}

async function optimizeBlogImage(type: string, bytes: Uint8Array) {
  try {
    const source = sharp(bytes, {
      failOn: "error",
      limitInputPixels: MAX_BLOG_MEDIA_PIXELS,
      animated: true,
    });
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height)
      throw new Error("missing dimensions");
    if ((metadata.pages ?? 1) > 1 || type === "image/gif")
      return {
        bytes,
        mimeType: type,
        extension: null,
        width: metadata.width,
        height: metadata.height,
      };

    const optimized = await sharp(bytes, {
      failOn: "error",
      limitInputPixels: MAX_BLOG_MEDIA_PIXELS,
    })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    const scale = Math.min(1, 2400 / metadata.width, 2400 / metadata.height);
    return optimized.length < bytes.length
      ? {
          bytes: new Uint8Array(optimized),
          mimeType: "image/webp",
          extension: ".webp",
          width: Math.round(metadata.width * scale),
          height: Math.round(metadata.height * scale),
        }
      : {
          bytes,
          mimeType: type,
          extension: null,
          width: metadata.width,
          height: metadata.height,
        };
  } catch {
    throw new ValidationApiError(
      "فایل تصویر خراب، بسیار بزرگ یا غیرقابل پردازش است.",
    );
  }
}

const postInclude = {
  author: { select: { id: true, name: true, phone: true } },
  reviewer: { select: { id: true, name: true, phone: true } },
  category: { select: { id: true, slug: true, name: true } },
  tags: { include: { tag: { select: { id: true, slug: true, name: true } } } },
  sources: { orderBy: { retrievedAt: "asc" as const } },
  _count: { select: { revisions: true } },
} as const;

function text(value: unknown, label: string, max: number, min = 1) {
  const result = String(value ?? "").trim();
  if (result.length < min || result.length > max)
    throw new ValidationApiError(
      `${label} باید بین ${min} تا ${max} کاراکتر باشد.`,
    );
  return result;
}
function optionalText(value: unknown, label: string, max: number) {
  const result = String(value ?? "").trim();
  if (!result) return null;
  if (result.length > max)
    throw new ValidationApiError(`${label} حداکثر ${max} کاراکتر است.`);
  return result;
}
function slug(value: unknown, max = 160) {
  const result = String(value ?? "")
    .trim()
    .toLowerCase();
  if (
    result.length < 2 ||
    result.length > max ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)
  )
    throw new ValidationApiError(
      `نامک باید ۲ تا ${max} کاراکتر انگلیسی، عدد یا خط تیره باشد.`,
      { slug: [`نامک باید ۲ تا ${max} کاراکتر و بدون خط تیره تکراری باشد.`] },
    );
  return result;
}

type BlogTaxonomyKind = "category" | "tag";

function hasPrismaCode(error: unknown, code: string) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === code,
  );
}

async function assertTaxonomyUnique(
  tx: Prisma.TransactionClient,
  kind: BlogTaxonomyKind,
  data: { name: string; slug: string },
  excludeId?: string,
) {
  const idFilter = excludeId ? { not: excludeId } : undefined;
  const [nameMatch, slugMatch] = kind === "category"
    ? await Promise.all([
        tx.blogCategory.findFirst({
          where: { id: idFilter, name: { equals: data.name, mode: "insensitive" } },
          select: { id: true },
        }),
        tx.blogCategory.findFirst({
          where: { id: idFilter, slug: data.slug },
          select: { id: true },
        }),
      ])
    : await Promise.all([
        tx.blogTag.findFirst({
          where: { id: idFilter, name: { equals: data.name, mode: "insensitive" } },
          select: { id: true },
        }),
        tx.blogTag.findFirst({
          where: { id: idFilter, slug: data.slug },
          select: { id: true },
        }),
      ]);
  const fields: Record<string, string[]> = {};
  if (nameMatch) fields.name = ["این نام قبلاً استفاده شده است."];
  if (slugMatch) fields.slug = ["این نامک قبلاً استفاده شده است."];
  if (Object.keys(fields).length)
    throw new ConflictApiError("نام یا نامک تکراری است.", fields);
}
function optionalUrl(value: unknown, label: string) {
  const result = optionalText(value, label, 2048);
  if (!result) return null;
  try {
    const url = new URL(result, "https://binix.ir");
    if (
      result.startsWith("/")
        ? !result.startsWith("/api/blog/media/")
        : !["http:", "https:"].includes(url.protocol)
    )
      throw new Error();
  } catch {
    throw new ValidationApiError(
      `${label} باید URL امن http/https یا تصویر Media Library باشد.`,
    );
  }
  return result;
}
function optionalLink(value: unknown, label: string) {
  const result = optionalText(value, label, 2048);
  if (!result) return null;
  if (result.startsWith("/") && !result.startsWith("//")) return result;
  try {
    if (["http:", "https:"].includes(new URL(result).protocol)) return result;
  } catch {
    /* handled below */
  }
  throw new ValidationApiError(
    `${label} باید مسیر داخلی یا URL امن http/https باشد.`,
  );
}
function parseSources(value: unknown) {
  if (!Array.isArray(value)) return [];
  const unique = new Map<
    string,
    {
      url: string;
      title: string | null;
      publisher: string | null;
      licenseNote: string | null;
    }
  >();
  for (const item of value.slice(0, 20)) {
    if (!item || typeof item !== "object") continue;
    const source = item as Record<string, unknown>;
    const url = optionalUrl(source.url, "آدرس منبع");
    if (!url || url.startsWith("/")) continue;
    unique.set(url, {
      url,
      title: optionalText(source.title, "عنوان منبع", 300),
      publisher: optionalText(source.publisher, "ناشر منبع", 200),
      licenseNote: optionalText(source.licenseNote, "یادداشت مجوز", 500),
    });
  }
  return [...unique.values()];
}
function optionalUuid(value: unknown, label: string) {
  const result = String(value ?? "").trim();
  if (!result) return null;
  if (!UUID.test(result)) throw new ValidationApiError(`${label} معتبر نیست.`);
  return result;
}
function parseTagIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  const ids = [
    ...new Set(
      value
        .map(String)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ].slice(0, 20);
  if (ids.some((id) => !UUID.test(id)))
    throw new ValidationApiError("برچسب انتخاب‌شده معتبر نیست.");
  return ids;
}
function input(
  body: Record<string, unknown>,
  options: { allowIncompleteDraft?: boolean } = {},
) {
  let rendered: ReturnType<typeof renderBlogDocument>;
  try {
    rendered = renderBlogDocument(body.contentJson);
  } catch (error) {
    throw new ValidationApiError(
      error instanceof Error
        ? error.message
        : "ساختار محتوای مقاله معتبر نیست.",
    );
  }
  const contentText = options.allowIncompleteDraft
    ? String(rendered.text ?? "").trim()
    : text(rendered.text, "محتوا", 100000, 50);
  if (contentText.length > 100000)
    throw new ValidationApiError("محتوا حداکثر 100000 کاراکتر است.");
  const contentHtml = text(
    sanitizeBlogHtml(rendered.html),
    "HTML محتوا",
    300000,
  );
  const contentJson = rendered.document as Prisma.InputJsonValue;
  const ctaTitle = optionalText(body.ctaTitle, "عنوان CTA", 160);
  const ctaDescription = optionalText(body.ctaDescription, "توضیح CTA", 500);
  const ctaLabel = optionalText(body.ctaLabel, "متن دکمه CTA", 80);
  const ctaHref = optionalLink(body.ctaHref, "لینک CTA");
  if (
    [ctaTitle, ctaLabel, ctaHref].some(Boolean) &&
    !(ctaTitle && ctaLabel && ctaHref)
  )
    throw new ValidationApiError(
      "برای CTA، عنوان، متن دکمه و لینک باید کامل باشند.",
    );
  return {
    slug: slug(body.slug),
    title: text(body.title, "عنوان", 200, 3),
    excerpt: options.allowIncompleteDraft
      ? optionalText(body.excerpt, "خلاصه", 500) ?? ""
      : text(body.excerpt, "خلاصه", 500, 20),
    contentMarkdown: contentText,
    contentJson,
    contentHtml,
    contentText,
    coverImageUrl: optionalUrl(body.coverImageUrl, "تصویر شاخص"),
    coverImageAlt: optionalText(body.coverImageAlt, "متن جایگزین تصویر", 255),
    seoTitle: optionalText(body.seoTitle, "عنوان SEO", 70),
    seoDescription: optionalText(body.seoDescription, "توضیح SEO", 170),
    canonicalUrl: optionalUrl(body.canonicalUrl, "Canonical URL"),
    ctaTitle,
    ctaDescription,
    ctaLabel,
    ctaHref,
    categoryId: optionalUuid(body.categoryId, "دسته‌بندی"),
    tagIds: parseTagIds(body.tagIds),
    sources: parseSources(body.sources),
  };
}

function assertReviewReady(data: ReturnType<typeof input>) {
  const missing: string[] = [];
  if (data.excerpt.trim().length < 20) missing.push("خلاصه حداقل ۲۰ کاراکتر");
  if (data.contentText.trim().length < 50)
    missing.push("محتوای حداقل ۵۰ کاراکتر");
  if (missing.length)
    throw new ValidationApiError(
      `برای ارسال به بازبینی این موارد را کامل کنید: ${missing.join("، ")}.`,
    );
}

function assertPublishReady(data: ReturnType<typeof input>) {
  const missing: string[] = [];
  if (!data.coverImageUrl) missing.push("تصویر شاخص");
  if (!data.coverImageAlt) missing.push("متن جایگزین تصویر");
  if (!data.categoryId) missing.push("دسته‌بندی");
  if ((data.contentText?.trim().length ?? 0) < 200)
    missing.push("حداقل ۲۰۰ نویسه محتوای مفید");
  if (missing.length) {
    throw new ValidationApiError(
      `برای انتشار این موارد را کامل کنید: ${missing.join("، ")}.`,
    );
  }
}

function expectedVersion(value: unknown) {
  const version = Number(value);
  if (!Number.isInteger(version) || version < 1)
    throw new ValidationApiError(
      "نسخه مقاله معتبر نیست؛ صفحه را تازه‌سازی کنید.",
    );
  return version;
}

function safePage(value: unknown) {
  if (value == null || value === "") return 1;
  const page = Number(value ?? 1);
  if (!Number.isFinite(page) || page < 1)
    throw new ValidationApiError("شماره صفحه معتبر نیست.");
  return Math.floor(page);
}

function assertUuid(value: string, label = "مقاله") {
  if (!UUID.test(value)) throw new NotFoundApiError(`${label} پیدا نشد.`);
}
function mapPost<
  T extends {
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    tags?: Array<{ tag: unknown }>;
  },
>(post: T) {
  return {
    ...post,
    tags: post.tags?.map((item) => item.tag) ?? [],
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduled:
      post.status === "PUBLISHED" &&
      !!post.publishedAt &&
      post.publishedAt > new Date(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
async function validateTaxonomy(categoryId: string | null, ids: string[]) {
  const prisma = getPrismaClient();
  const [category, count] = await Promise.all([
    categoryId
      ? prisma.blogCategory.findUnique({
          where: { id: categoryId },
          select: { id: true },
        })
      : Promise.resolve(null),
    ids.length
      ? prisma.blogTag.count({ where: { id: { in: ids } } })
      : Promise.resolve(0),
  ]);
  if (categoryId && !category)
    throw new ValidationApiError("دسته‌بندی انتخاب‌شده وجود ندارد.");
  if (count !== ids.length)
    throw new ValidationApiError("یک یا چند برچسب انتخاب‌شده وجود ندارد.");
}

async function reserveSlug(
  tx: Prisma.TransactionClient,
  requestedSlug: string,
  postId?: string,
) {
  const [current, historical] = await Promise.all([
    tx.blogPost.findUnique({
      where: { slug: requestedSlug },
      select: { id: true },
    }),
    tx.blogPostSlug.findUnique({
      where: { slug: requestedSlug },
      select: { id: true, postId: true },
    }),
  ]);
  if (
    (current && current.id !== postId) ||
    (historical && historical.postId !== postId)
  )
    throw new ConflictApiError(
      "این نامک یا یکی از آدرس‌های قدیمی قبلاً استفاده شده است.",
    );
  if (historical && historical.postId === postId)
    await tx.blogPostSlug.delete({ where: { id: historical.id } });
}

export async function listAdminBlogPosts(
  user: AuthUser,
  raw: { search?: string; status?: string; page?: number } = {},
) {
  requireAdminPermission(user, "admin.content.read");
  const prisma = getPrismaClient();
  const page = safePage(raw.page);
  const pageSize = 20;
  const search = raw.search?.trim();
  const requestedStatus = raw.status?.trim();
  if (requestedStatus && !POST_STATUSES.has(requestedStatus))
    throw new ValidationApiError("وضعیت مقاله معتبر نیست.");
  const status = (requestedStatus || undefined) as
    "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED" | undefined;
  const where: Prisma.BlogPostWhereInput = {
    status,
    OR: search
      ? [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { contentText: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: postInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blogPost.count({ where }),
  ]);
  return {
    posts: posts.map(mapPost),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
export async function getAdminBlogPost(user: AuthUser, postId: string) {
  requireAdminPermission(user, "admin.content.read");
  assertUuid(postId);
  const post = await getPrismaClient().blogPost.findUnique({
    where: { id: postId },
    include: postInclude,
  });
  if (!post) throw new NotFoundApiError("مقاله پیدا نشد.");
  return mapPost(post);
}
export async function createAdminBlogPost(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  requireAdminPermission(user, "admin.content.write");
  const operation = String(body.operation ?? "save");
  if (!["save", "submit", "publish", "schedule"].includes(operation))
    throw new ValidationApiError("عملیات مقاله معتبر نیست.");
  if (["publish", "schedule"].includes(operation))
    requireAdminPermission(user, "admin.content.publish");
  const data = input(body, { allowIncompleteDraft: operation === "save" });
  if (operation === "submit") assertReviewReady(data);
  let status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" =
    operation === "submit" ? "IN_REVIEW" : "DRAFT";
  let publishedAt: Date | null = null;
  if (operation === "publish") {
    assertPublishReady(data);
    status = "PUBLISHED";
    publishedAt = new Date();
  }
  if (operation === "schedule") {
    assertPublishReady(data);
    const candidate = new Date(String(body.publishAt ?? ""));
    if (!Number.isFinite(candidate.getTime()) || candidate <= new Date())
      throw new ValidationApiError("زمان انتشار باید در آینده باشد.");
    status = "PUBLISHED";
    publishedAt = candidate;
  }
  await validateTaxonomy(data.categoryId, data.tagIds);
  try {
    const { tagIds, ...fields } = data;
    const post = await getPrismaClient().$transaction(
      async (tx) => {
        await reserveSlug(tx, fields.slug);
        const created = await tx.blogPost.create({
          data: {
            ...fields,
            sources: { create: fields.sources },
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
            authorUserId: user.id,
            status,
            publishedAt,
            reviewerUserId: ["publish", "schedule"].includes(operation)
              ? user.id
              : null,
            origin: "MANUAL",
          },
          include: postInclude,
        });
        await createDatabaseAuditLog(tx, {
          actorUserId: user.id,
          action:
            operation === "submit"
              ? "blog_post_submitted"
              : operation === "publish"
                ? "blog_post_published"
                : operation === "schedule"
                  ? "blog_post_scheduled"
                  : "blog_post_created",
          targetType: "blog-post",
          targetId: created.id,
          metadata: { slug: created.slug, created: true },
        });
        return created;
      },
      { isolationLevel: "Serializable" },
    );
    revalidateTag("blog");
    return mapPost(post);
  } catch (error) {
    if (String(error).includes("Unique constraint"))
      throw new ConflictApiError("این نامک قبلاً استفاده شده است.");
    throw error;
  }
}
function revisionMetadata(
  post: {
    slug: string;
    coverImageUrl: string | null;
    coverImageAlt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    ctaTitle: string | null;
    ctaDescription: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    categoryId: string | null;
    status: string;
    publishedAt: Date | null;
  },
  currentTagIds: string[],
  sources: Array<{
    url: string;
    title: string | null;
    publisher: string | null;
    licenseNote: string | null;
  }>,
): Prisma.InputJsonObject {
  return {
    slug: post.slug,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    ctaTitle: post.ctaTitle,
    ctaDescription: post.ctaDescription,
    ctaLabel: post.ctaLabel,
    ctaHref: post.ctaHref,
    categoryId: post.categoryId,
    tagIds: currentTagIds,
    sources: sources.map(({ url, title, publisher, licenseNote }) => ({
      url,
      title,
      publisher,
      licenseNote,
    })),
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
  };
}
export async function updateAdminBlogPost(
  user: AuthUser,
  postId: string,
  body: Record<string, unknown>,
) {
  requireAdminPermission(user, "admin.content.write");
  assertUuid(postId);
  const prisma = getPrismaClient();
  const before = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: { tags: true, sources: true },
  });
  if (!before) throw new NotFoundApiError("مقاله پیدا نشد.");
  const version = expectedVersion(body.version);
  const operation = String(body.operation ?? "save");
  if (
    !["save", "submit", "publish", "schedule", "unpublish", "archive", "reject"].includes(
      operation,
    )
  )
    throw new ValidationApiError("عملیات مقاله معتبر نیست.");
  if (
    ["publish", "schedule", "unpublish", "archive", "reject"].includes(operation) ||
    before.status === "PUBLISHED"
  )
    requireAdminPermission(user, "admin.content.publish");
  const data = input(body, {
    allowIncompleteDraft:
      operation === "save" && before.status !== "PUBLISHED",
  });
  if (operation === "submit") assertReviewReady(data);
  await validateTaxonomy(data.categoryId, data.tagIds);
  let publishedAt = before.publishedAt;
  let status = before.status;
  if (operation === "submit") status = "IN_REVIEW";
  if (operation === "publish") {
    status = "PUBLISHED";
    publishedAt = new Date();
  }
  if (operation === "schedule") {
    const candidate = new Date(String(body.publishAt ?? ""));
    if (!Number.isFinite(candidate.getTime()) || candidate <= new Date())
      throw new ValidationApiError("زمان انتشار باید در آینده باشد.");
    status = "PUBLISHED";
    publishedAt = candidate;
  }
  if (operation === "unpublish") {
    status = "DRAFT";
    publishedAt = null;
  }
  if (operation === "archive") status = "ARCHIVED";
  const reviewNote = optionalText(body.reviewNote, "یادداشت بازبینی", 1000);
  if (operation === "reject") {
    if (before.status !== "IN_REVIEW")
      throw new ConflictApiError("فقط مقاله در انتظار بازبینی قابل بازگرداندن است.");
    if (!reviewNote || reviewNote.length < 5)
      throw new ValidationApiError("دلیل بازگرداندن مقاله را حداقل در ۵ کاراکتر بنویسید.");
    status = "DRAFT";
    publishedAt = null;
  }
  if (status === "PUBLISHED") assertPublishReady(data);
  try {
    const post = await prisma.$transaction(
      async (tx) => {
        const claim = await tx.blogPost.updateMany({
          where: { id: postId, version },
          data: { version: { increment: 1 } },
        });
        if (!claim.count)
          throw new ConflictApiError(
            "این مقاله هم‌زمان در جای دیگری تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
          );
        await reserveSlug(tx, data.slug, postId);
        if (data.slug !== before.slug)
          await tx.blogPostSlug.upsert({
            where: { slug: before.slug },
            update: {},
            create: { postId, slug: before.slug },
          });
        await tx.blogPostRevision.create({
          data: {
            postId,
            editorUserId: user.id,
            title: before.title,
            excerpt: before.excerpt,
            contentMarkdown: before.contentMarkdown,
            contentJson: before.contentJson ?? undefined,
            contentHtml: before.contentHtml,
            contentText: before.contentText,
            metadata: revisionMetadata(
              before,
              before.tags.map((item) => item.tagId),
              before.sources,
            ),
          },
        });
        await tx.blogContentSource.deleteMany({ where: { postId } });
        await tx.blogPostTag.deleteMany({ where: { postId } });
        const { tagIds, ...fields } = data;
        const updated = await tx.blogPost.update({
          where: { id: postId },
          data: {
            ...fields,
            sources: { create: fields.sources },
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
            status,
            publishedAt,
            reviewNote:
              operation === "reject"
                ? reviewNote
                : ["submit", "publish", "schedule"].includes(operation)
                  ? null
                  : before.reviewNote,
            reviewerUserId: ["publish", "schedule", "reject"].includes(operation)
              ? user.id
              : operation === "submit"
                ? null
                : before.reviewerUserId,
          },
          include: postInclude,
        });
        const action =
          operation === "submit"
            ? "blog_post_submitted"
            : operation === "publish"
              ? "blog_post_published"
              : operation === "schedule"
                ? "blog_post_scheduled"
                : operation === "unpublish"
                  ? "blog_post_unpublished"
                : operation === "archive"
                  ? "blog_post_archived"
                  : operation === "reject"
                    ? "blog_post_updated"
                  : "blog_post_updated";
        await createDatabaseAuditLog(tx, {
          actorUserId: user.id,
          action,
          targetType: "blog-post",
          targetId: updated.id,
          metadata: {
            slug: updated.slug,
            previousStatus: before.status,
            status: updated.status,
            publishedAt: updated.publishedAt?.toISOString() ?? null,
            version: updated.version,
            reviewNote: operation === "reject" ? reviewNote : null,
          },
        });
        return updated;
      },
      { isolationLevel: "Serializable" },
    );
    revalidateTag("blog");
    return mapPost(post);
  } catch (error) {
    if (String(error).includes("Unique constraint"))
      throw new ConflictApiError("این نامک قبلاً استفاده شده است.");
    throw error;
  }
}
export async function deleteAdminBlogPost(
  user: AuthUser,
  postId: string,
  rawVersion: unknown,
) {
  requireAdminPermission(user, "admin.content.publish");
  assertUuid(postId);
  const version = expectedVersion(rawVersion);
  const prisma = getPrismaClient();
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, slug: true, status: true, version: true },
  });
  if (!post) throw new NotFoundApiError("مقاله پیدا نشد.");
  if (post.status !== "ARCHIVED")
    throw new ConflictApiError("برای حذف دائمی، مقاله ابتدا باید بایگانی شود.");
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.blogPost.deleteMany({
      where: { id: postId, version, status: "ARCHIVED" },
    });
    if (!deleted.count)
      throw new ConflictApiError(
        "مقاله تغییر کرده است؛ صفحه را تازه‌سازی کنید.",
      );
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "blog_post_deleted",
      targetType: "blog-post",
      targetId: postId,
      metadata: { slug: post.slug, version },
    });
  });
  revalidateTag("blog");
}
export async function listAdminBlogRevisions(user: AuthUser, postId: string) {
  requireAdminPermission(user, "admin.content.read");
  assertUuid(postId);
  const prisma = getPrismaClient();
  const exists = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!exists) throw new NotFoundApiError("مقاله پیدا نشد.");
  const revisions = await prisma.blogPostRevision.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: { editor: { select: { name: true, phone: true } } },
    take: 50,
  });
  return revisions.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));
}
export async function restoreAdminBlogRevision(
  user: AuthUser,
  postId: string,
  revisionId: string,
  rawVersion: unknown,
) {
  requireAdminPermission(user, "admin.content.publish");
  assertUuid(postId);
  assertUuid(revisionId, "نسخه مقاله");
  const version = expectedVersion(rawVersion);
  const prisma = getPrismaClient();
  const [current, revision] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: postId },
      include: { tags: true, sources: true },
    }),
    prisma.blogPostRevision.findFirst({ where: { id: revisionId, postId } }),
  ]);
  if (!current || !revision) throw new NotFoundApiError("نسخه مقاله پیدا نشد.");
  const meta =
    revision.metadata &&
    typeof revision.metadata === "object" &&
    !Array.isArray(revision.metadata)
      ? (revision.metadata as Record<string, unknown>)
      : {};
  const restoredTagIds = parseTagIds(meta.tagIds);
  const restoredCategoryId = optionalUuid(meta.categoryId, "دسته‌بندی");
  await validateTaxonomy(restoredCategoryId, restoredTagIds);
  const restored = await prisma.$transaction(
    async (tx) => {
      const claim = await tx.blogPost.updateMany({
        where: { id: postId, version },
        data: { version: { increment: 1 } },
      });
      if (!claim.count)
        throw new ConflictApiError(
          "مقاله تغییر کرده است؛ پیش از بازیابی نسخه، صفحه را تازه‌سازی کنید.",
        );
      const restoredSlug =
        typeof meta.slug === "string" ? slug(meta.slug) : current.slug;
      await reserveSlug(tx, restoredSlug, postId);
      if (restoredSlug !== current.slug)
        await tx.blogPostSlug.upsert({
          where: { slug: current.slug },
          update: {},
          create: { postId, slug: current.slug },
        });
      await tx.blogPostRevision.create({
        data: {
          postId,
          editorUserId: user.id,
          title: current.title,
          excerpt: current.excerpt,
          contentMarkdown: current.contentMarkdown,
          contentJson: current.contentJson ?? undefined,
          contentHtml: current.contentHtml,
          contentText: current.contentText,
          metadata: revisionMetadata(
            current,
            current.tags.map((item) => item.tagId),
            current.sources,
          ),
        },
      });
      await tx.blogPostTag.deleteMany({ where: { postId } });
      await tx.blogContentSource.deleteMany({ where: { postId } });
      const restoredSources = parseSources(meta.sources);
      const updated = await tx.blogPost.update({
        where: { id: postId },
        data: {
          slug: restoredSlug,
          title: revision.title,
          excerpt: revision.excerpt,
          contentMarkdown: revision.contentMarkdown,
          contentJson: revision.contentJson ?? undefined,
          contentHtml: revision.contentHtml,
          contentText: revision.contentText,
          coverImageUrl: optionalUrl(meta.coverImageUrl, "تصویر شاخص"),
          coverImageAlt: optionalText(meta.coverImageAlt, "Alt تصویر", 255),
          seoTitle: optionalText(meta.seoTitle, "عنوان SEO", 70),
          seoDescription: optionalText(meta.seoDescription, "توضیح SEO", 170),
          canonicalUrl: optionalUrl(meta.canonicalUrl, "Canonical URL"),
          ctaTitle: optionalText(meta.ctaTitle, "عنوان CTA", 160),
          ctaDescription: optionalText(meta.ctaDescription, "توضیح CTA", 500),
          ctaLabel: optionalText(meta.ctaLabel, "متن دکمه CTA", 80),
          ctaHref: optionalLink(meta.ctaHref, "لینک CTA"),
          categoryId: restoredCategoryId,
          tags: { create: restoredTagIds.map((tagId) => ({ tagId })) },
          sources: { create: restoredSources },
          status: "DRAFT",
          publishedAt: null,
        },
        include: postInclude,
      });
      await createDatabaseAuditLog(tx, {
        actorUserId: user.id,
        action: "blog_post_revision_restored",
        targetType: "blog-post",
        targetId: postId,
        metadata: { revisionId, version: updated.version },
      });
      return updated;
    },
    { isolationLevel: "Serializable" },
  );
  revalidateTag("blog");
  return mapPost(restored);
}
export async function listBlogTaxonomy(user: AuthUser) {
  requireAdminPermission(user, "admin.content.read");
  const prisma = getPrismaClient();
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    }),
  ]);
  return { categories, tags };
}
export async function getAdminBlogAnalytics(
  user: AuthUser,
  postId: string,
  rawDays: unknown,
) {
  requireAdminPermission(user, "admin.content.read");
  assertUuid(postId);
  const days = Math.min(365, Math.max(1, Math.floor(Number(rawDays) || 30)));
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days + 1);
  since.setUTCHours(0, 0, 0, 0);
  const prisma = getPrismaClient();
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) throw new NotFoundApiError("مقاله پیدا نشد.");
  const [totals, daily] = await Promise.all([
    prisma.blogPostDailyMetric.aggregate({
      where: { postId, date: { gte: since } },
      _sum: {
        views: true,
        uniqueViews: true,
        ctaClicks: true,
        uniqueCtaClicks: true,
      },
    }),
    prisma.blogPostDailyMetric.findMany({
      where: { postId, date: { gte: since } },
      orderBy: { date: "asc" },
      select: {
        date: true,
        views: true,
        uniqueViews: true,
        ctaClicks: true,
        uniqueCtaClicks: true,
      },
    }),
  ]);
  const summary = {
    views: totals._sum.views ?? 0,
    uniqueViews: totals._sum.uniqueViews ?? 0,
    ctaClicks: totals._sum.ctaClicks ?? 0,
    uniqueCtaClicks: totals._sum.uniqueCtaClicks ?? 0,
  };
  return {
    days,
    summary: {
      ...summary,
      ctaRate: summary.uniqueViews
        ? Number(
            ((summary.uniqueCtaClicks / summary.uniqueViews) * 100).toFixed(2),
          )
        : 0,
    },
    daily: daily.map((item) => ({
      ...item,
      date: item.date.toISOString().slice(0, 10),
    })),
  };
}
export async function createBlogTaxonomy(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  requireAdminPermission(user, "admin.content.write");
  const kind =
    body.kind === "category" ? "category" : body.kind === "tag" ? "tag" : null;
  if (!kind) throw new ValidationApiError("نوع طبقه‌بندی معتبر نیست.");
  const data = {
    name: text(body.name, "نام", 120, 2),
    slug: slug(body.slug, 120),
  };
  const prisma = getPrismaClient();
  try {
    const item = await prisma.$transaction(async (tx) => {
      await assertTaxonomyUnique(tx, kind, data);
      const created = kind === "category"
        ? await tx.blogCategory.create({
            data: {
              ...data,
              description: optionalText(body.description, "توضیح", 500),
            },
          })
        : await tx.blogTag.create({ data });
      await createDatabaseAuditLog(tx, {
        actorUserId: user.id,
        action: "blog_taxonomy_created",
        targetType: "blog-taxonomy",
        targetId: created.id,
        metadata: { kind, name: created.name, slug: created.slug },
      });
      return created;
    });
    revalidateTag("blog");
    return { kind, item };
  } catch (error) {
    if (hasPrismaCode(error, "P2002"))
      throw new ConflictApiError("این نام یا نامک قبلاً استفاده شده است.", {
        name: ["این نام یا نامک قبلاً استفاده شده است."],
        slug: ["این نام یا نامک قبلاً استفاده شده است."],
      });
    throw error;
  }
}
export async function deleteBlogTaxonomy(
  user: AuthUser,
  kind: string,
  id: string,
  replacementId = "",
) {
  requireAdminPermission(user, "admin.content.publish");
  if (!UUID.test(id)) throw new NotFoundApiError("مورد پیدا نشد.");
  if (replacementId && (!UUID.test(replacementId) || replacementId === id))
    throw new ValidationApiError("جایگزین انتخاب‌شده معتبر نیست.");
  const prisma = getPrismaClient();
  if (kind === "category") {
    const source = await prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!source) throw new NotFoundApiError("دسته پیدا نشد.");
    if (source._count.posts && !replacementId)
      throw new ConflictApiError("برای دسته استفاده‌شده، ابتدا دسته جایگزین را انتخاب کنید.");
    if (replacementId && !(await prisma.blogCategory.findUnique({ where: { id: replacementId }, select: { id: true } })))
      throw new ValidationApiError("دسته جایگزین پیدا نشد.");
    await prisma.$transaction(async (tx) => {
      if (replacementId)
        await tx.blogPost.updateMany({ where: { categoryId: id }, data: { categoryId: replacementId } });
      await tx.blogCategory.delete({ where: { id } });
      await createDatabaseAuditLog(tx, {
        actorUserId: user.id,
        action: replacementId ? "blog_taxonomy_merged" : "blog_taxonomy_deleted",
        targetType: "blog-taxonomy",
        targetId: id,
        metadata: { kind, name: source.name, slug: source.slug, replacementId: replacementId || null },
      });
    });
  } else if (kind === "tag") {
    const source = await prisma.blogTag.findUnique({
      where: { id },
      include: { posts: { select: { postId: true } }, _count: { select: { posts: true } } },
    });
    if (!source) throw new NotFoundApiError("برچسب پیدا نشد.");
    if (source._count.posts && !replacementId)
      throw new ConflictApiError("برای برچسب استفاده‌شده، ابتدا برچسب جایگزین را انتخاب کنید.");
    if (replacementId && !(await prisma.blogTag.findUnique({ where: { id: replacementId }, select: { id: true } })))
      throw new ValidationApiError("برچسب جایگزین پیدا نشد.");
    await prisma.$transaction(async (tx) => {
      if (replacementId && source.posts.length)
        await tx.blogPostTag.createMany({
          data: source.posts.map(({ postId }) => ({ postId, tagId: replacementId })),
          skipDuplicates: true,
        });
      await tx.blogTag.delete({ where: { id } });
      await createDatabaseAuditLog(tx, {
        actorUserId: user.id,
        action: replacementId ? "blog_taxonomy_merged" : "blog_taxonomy_deleted",
        targetType: "blog-taxonomy",
        targetId: id,
        metadata: { kind, name: source.name, slug: source.slug, replacementId: replacementId || null },
      });
    });
  } else throw new ValidationApiError("نوع طبقه‌بندی معتبر نیست.");
  revalidateTag("blog");
}

export async function updateBlogTaxonomy(
  user: AuthUser,
  body: Record<string, unknown>,
) {
  requireAdminPermission(user, "admin.content.write");
  const kind = body.kind === "category" ? "category" : body.kind === "tag" ? "tag" : null;
  const id = String(body.id ?? "");
  if (!kind || !UUID.test(id)) throw new ValidationApiError("طبقه‌بندی معتبر نیست.");
  const data = {
    name: text(body.name, "نام", 120, 2),
    slug: slug(body.slug, 120),
  };
  const prisma = getPrismaClient();
  try {
    const item = await prisma.$transaction(async (tx) => {
      const before = kind === "category"
        ? await tx.blogCategory.findUnique({ where: { id } })
        : await tx.blogTag.findUnique({ where: { id } });
      if (!before)
        throw new NotFoundApiError(kind === "category" ? "دسته پیدا نشد." : "برچسب پیدا نشد.");
      await assertTaxonomyUnique(tx, kind, data, id);
      const updated = kind === "category"
        ? await tx.blogCategory.update({
            where: { id },
            data: { ...data, description: optionalText(body.description, "توضیح", 500) },
            include: { _count: { select: { posts: true } } },
          })
        : await tx.blogTag.update({
            where: { id }, data, include: { _count: { select: { posts: true } } },
          });
      await createDatabaseAuditLog(tx, {
        actorUserId: user.id,
        action: "blog_taxonomy_updated",
        targetType: "blog-taxonomy",
        targetId: id,
        metadata: {
          kind,
          beforeName: before.name,
          afterName: updated.name,
          beforeSlug: before.slug,
          afterSlug: updated.slug,
        },
      });
      return updated;
    });
    revalidateTag("blog");
    return { kind, item };
  } catch (error) {
    if (hasPrismaCode(error, "P2002"))
      throw new ConflictApiError("این نام یا نامک قبلاً استفاده شده است.", {
        name: ["این نام یا نامک قبلاً استفاده شده است."],
        slug: ["این نام یا نامک قبلاً استفاده شده است."],
      });
    throw error;
  }
}
export async function listBlogMedia(
  user: AuthUser,
  raw: { page?: unknown; search?: string } = {},
) {
  requireAdminPermission(user, "admin.content.read");
  const prisma = getPrismaClient();
  const page = safePage(raw.page);
  const pageSize = 24;
  const search = raw.search?.trim();
  const where: Prisma.BlogMediaAssetWhereInput = search
    ? {
        OR: [
          { fileName: { contains: search, mode: "insensitive" } },
          { altText: { contains: search, mode: "insensitive" } },
          { caption: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.blogMediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        byteSize: true,
        altText: true,
        isDecorative: true,
        caption: true,
        width: true,
        height: true,
        focalX: true,
        focalY: true,
        checksumSha256: true,
        createdAt: true,
        uploadedBy: { select: { name: true, phone: true } },
      },
    }),
    prisma.blogMediaAsset.count({ where }),
  ]);
  return {
    items: items.map((item) => ({
      ...item,
      url: `/api/blog/media/${item.id}`,
      createdAt: item.createdAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
export async function createBlogMedia(
  user: AuthUser,
  file: { name: string; type: string; data: ArrayBuffer },
  altText: unknown,
) {
  const sourceBytes = new Uint8Array(file.data);
  requireAdminPermission(user, "admin.content.write");
  if (!ALLOWED_MEDIA_TYPES.has(file.type))
    throw new ValidationApiError(
      "فرمت تصویر باید JPEG، PNG، WebP، GIF یا AVIF باشد.",
    );
  if (!sourceBytes.length || sourceBytes.length > MAX_BLOG_MEDIA_BYTES)
    throw new ValidationApiError("حجم تصویر باید حداکثر ۵ مگابایت باشد.");
  if (!hasValidImageSignature(file.type, sourceBytes))
    throw new ValidationApiError(
      "محتوای فایل با فرمت اعلام‌شده تصویر مطابقت ندارد.",
    );
  const optimized = await optimizeBlogImage(file.type, sourceBytes);
  const storedBytes = Uint8Array.from(optimized.bytes);
  const rawName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-255) || "image";
  const safeName = optimized.extension
    ? `${rawName.replace(/\.[^.]+$/, "").slice(0, 245)}${optimized.extension}`
    : rawName;
  const checksumSha256 = crypto
    .createHash("sha256")
    .update(storedBytes)
    .digest("hex");
  const prisma = getPrismaClient();
  const existing = await prisma.blogMediaAsset.findFirst({
    where: { checksumSha256 },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      byteSize: true,
      altText: true,
      isDecorative: true,
      caption: true,
      width: true,
      height: true,
      focalX: true,
      focalY: true,
      checksumSha256: true,
      createdAt: true,
    },
  });
  if (existing)
    return {
      ...existing,
      deduplicated: true,
      url: `/api/blog/media/${existing.id}`,
      createdAt: existing.createdAt.toISOString(),
    };
  const useObjectStorage = objectStorageEnabled();
  const storageKey = useObjectStorage
    ? blogMediaObjectKey(checksumSha256, safeName)
    : null;
  let storageEtag: string | null = null;
  if (storageKey)
    storageEtag = await putBlogMediaObject({
      key: storageKey,
      bytes: storedBytes,
      mimeType: optimized.mimeType,
      checksum: checksumSha256,
    });
  try {
    const asset = await prisma.$transaction(async (tx) => {
      const created = await tx.blogMediaAsset.create({
        data: {
          fileName: safeName,
          mimeType: optimized.mimeType,
          byteSize: storedBytes.length,
          altText: optionalText(altText, "Alt تصویر", 255),
          checksumSha256,
          width: optimized.width,
          height: optimized.height,
          storageDriver: useObjectStorage ? "s3" : "database",
          storageKey,
          storageEtag,
          data: useObjectStorage ? null : storedBytes,
          uploadedById: user.id,
        },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          byteSize: true,
          altText: true,
          isDecorative: true,
          caption: true,
          width: true,
          height: true,
          focalX: true,
          focalY: true,
          checksumSha256: true,
          createdAt: true,
        },
      });
      await createDatabaseAuditLog(tx, {
        actorUserId: user.id,
        action: "blog_media_uploaded",
        targetType: "blog-media",
        targetId: created.id,
        metadata: { fileName: created.fileName, byteSize: created.byteSize },
      });
      return created;
    });
    return {
      ...asset,
      deduplicated: false,
      url: `/api/blog/media/${asset.id}`,
      createdAt: asset.createdAt.toISOString(),
    };
  } catch (error) {
    if (storageKey)
      await deleteBlogMediaObject(storageKey).catch(() => undefined);
    throw error;
  }
}
export async function deleteBlogMedia(user: AuthUser, id: string) {
  requireAdminPermission(user, "admin.content.publish");
  if (!UUID.test(id)) throw new NotFoundApiError("تصویر پیدا نشد.");
  const url = `/api/blog/media/${id}`;
  const prisma = getPrismaClient();
  const [usedInPost, usedInRevision, usedInSeo, usedInService] = await Promise.all([
    prisma.blogPost.count({
      where: {
        OR: [{ coverImageUrl: url }, { contentHtml: { contains: url } }],
      },
    }),
    prisma.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT COUNT(*)::bigint AS count FROM "blog_post_revisions" WHERE COALESCE("content_html", '') LIKE ${`%${url}%`} OR "metadata"::text LIKE ${`%${url}%`}`,
    prisma.siteSeoSetting.count({ where: { ogImageUrl: url } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count FROM "service_definitions"
      WHERE "marketing_content"::text LIKE ${`%${url}%`}`,
  ]);
  if (
    usedInPost ||
    Number(usedInRevision[0]?.count ?? 0) ||
    usedInSeo ||
    Number(usedInService[0]?.count ?? 0)
  )
    throw new ConflictApiError(
      "این تصویر در مقاله، تاریخچه نسخه، تنظیمات SEO یا صفحه سرویس استفاده شده و قابل حذف نیست.",
    );
  const asset = await prisma.blogMediaAsset.findUnique({
    where: { id },
    select: { storageDriver: true, storageKey: true },
  });
  if (!asset) throw new NotFoundApiError("تصویر پیدا نشد.");
  await prisma.$transaction(async (tx) => {
    const result = await tx.blogMediaAsset.deleteMany({ where: { id } });
    if (!result.count) throw new NotFoundApiError("تصویر پیدا نشد.");
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "blog_media_deleted",
      targetType: "blog-media",
      targetId: id,
      metadata: {},
    });
  });
  if (asset.storageDriver === "s3" && asset.storageKey)
    await deleteBlogMediaObject(asset.storageKey).catch((error) =>
      console.error("[Blog media cleanup failed]", { id, error }),
    );
}

function mediaCoordinate(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || number > 100)
    throw new ValidationApiError(`${label} باید عددی صحیح بین ۰ تا ۱۰۰ باشد.`);
  return number;
}

export async function getBlogMediaDetails(user: AuthUser, id: string) {
  requireAdminPermission(user, "admin.content.read");
  if (!UUID.test(id)) throw new NotFoundApiError("تصویر پیدا نشد.");
  const prisma = getPrismaClient();
  const item = await prisma.blogMediaAsset.findUnique({
    where: { id },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      byteSize: true,
      altText: true,
      isDecorative: true,
      caption: true,
      width: true,
      height: true,
      focalX: true,
      focalY: true,
      createdAt: true,
    },
  });
  if (!item) throw new NotFoundApiError("تصویر پیدا نشد.");
  const url = `/api/blog/media/${id}`;
  const [posts, revisions, seoPages, servicePages] = await Promise.all([
    prisma.blogPost.count({
      where: { OR: [{ coverImageUrl: url }, { contentHtml: { contains: url } }] },
    }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count FROM "blog_post_revisions"
      WHERE COALESCE("content_html", '') LIKE ${`%${url}%`}
         OR "metadata"::text LIKE ${`%${url}%`}`,
    prisma.siteSeoSetting.count({ where: { ogImageUrl: url } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count FROM "service_definitions"
      WHERE "marketing_content"::text LIKE ${`%${url}%`}`,
  ]);
  return {
    ...item,
    url,
    createdAt: item.createdAt.toISOString(),
    usage: {
      posts,
      revisions: Number(revisions[0]?.count ?? 0),
      seoPages,
      servicePages: Number(servicePages[0]?.count ?? 0),
    },
  };
}

export async function updateBlogMedia(
  user: AuthUser,
  id: string,
  body: Record<string, unknown>,
) {
  requireAdminPermission(user, "admin.content.write");
  if (!UUID.test(id)) throw new NotFoundApiError("تصویر پیدا نشد.");
  const prisma = getPrismaClient();
  const before = await prisma.blogMediaAsset.findUnique({ where: { id } });
  if (!before) throw new NotFoundApiError("تصویر پیدا نشد.");
  const isDecorative = body.isDecorative === true;
  const altText = optionalText(body.altText, "Alt تصویر", 255);
  if (!isDecorative && !altText)
    throw new ValidationApiError(
      "برای تصویر محتوایی Alt بنویسید یا آن را تزئینی علامت بزنید.",
    );
  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.blogMediaAsset.update({
      where: { id },
      data: {
        altText: isDecorative ? null : altText,
        isDecorative,
        caption: optionalText(body.caption, "توضیح تصویر", 500),
        focalX: mediaCoordinate(body.focalX, "تمرکز افقی"),
        focalY: mediaCoordinate(body.focalY, "تمرکز عمودی"),
      },
    });
    await createDatabaseAuditLog(tx, {
      actorUserId: user.id,
      action: "blog_media_updated",
      targetType: "blog-media",
      targetId: id,
      metadata: { isDecorative, focalX: saved.focalX, focalY: saved.focalY },
    });
    return saved;
  });
  return getBlogMediaDetails(user, updated.id);
}
