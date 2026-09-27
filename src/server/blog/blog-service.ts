import { unstable_cache } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";

const publicPostInclude = {
  author: { select: { id: true, name: true } },
  category: { select: { id: true, slug: true, name: true } },
  tags: { include: { tag: { select: { id: true, slug: true, name: true } } } },
  sources: { select: { id: true, url: true, title: true, publisher: true } },
} as const;
const publishedWhere = () => ({ status: "PUBLISHED" as const, publishedAt: { lte: new Date() } });
const positiveInt = (value: unknown, fallback: number, max = Number.MAX_SAFE_INTEGER) => { const number = Number(value); return Number.isFinite(number) && number >= 1 ? Math.min(max, Math.floor(number)) : fallback; };

const cachedPublishedPosts = unstable_cache(async (take: number) => getPrismaClient().blogPost.findMany({ where: publishedWhere(), orderBy: { publishedAt: "desc" }, take, include: publicPostInclude }), ["published-blog-posts"], { revalidate: 300, tags: ["blog"] });
export async function listPublishedBlogPosts(take = 5000) { return cachedPublishedPosts(positiveInt(take, 5000, 5000)); }

const cachedSearch = unstable_cache(async (input: { query: string; category: string; tag: string; page: number; pageSize: number }) => {
  const prisma = getPrismaClient();
  const where: Prisma.BlogPostWhereInput = {
    ...publishedWhere(),
    category: input.category ? { slug: input.category } : undefined,
    tags: input.tag ? { some: { tag: { slug: input.tag } } } : undefined,
    OR: input.query ? [{ title: { contains: input.query, mode: "insensitive" } }, { excerpt: { contains: input.query, mode: "insensitive" } }, { contentText: { contains: input.query, mode: "insensitive" } }] : undefined,
  };
  const [posts, total, categories, tags] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { publishedAt: "desc" }, include: publicPostInclude, skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({ where: { posts: { some: publishedWhere() } }, orderBy: { name: "asc" } }),
    prisma.blogTag.findMany({ where: { posts: { some: { post: publishedWhere() } } }, orderBy: { name: "asc" } }),
  ]);
  return { posts, categories, tags, pagination: { page: input.page, pageSize: input.pageSize, total, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) } };
}, ["published-blog-search"], { revalidate: 300, tags: ["blog"] });

export async function searchPublishedBlogPosts(input: { query?: string; category?: string; tag?: string; page?: number; pageSize?: number }) {
  return cachedSearch({ query: input.query?.trim().slice(0, 200) ?? "", category: input.category?.trim().slice(0, 160) ?? "", tag: input.tag?.trim().slice(0, 160) ?? "", page: positiveInt(input.page, 1, 100_000), pageSize: positiveInt(input.pageSize, 9, 24) });
}

const cachedResolvePost = unstable_cache(async (slug: string) => {
  const prisma = getPrismaClient();
  const current = await prisma.blogPost.findFirst({ where: { slug, ...publishedWhere() }, include: publicPostInclude });
  if (current) return { post: current, redirected: false };
  const historical = await prisma.blogPostSlug.findUnique({ where: { slug }, include: { post: { include: publicPostInclude } } });
  if (!historical || historical.post.status !== "PUBLISHED" || !historical.post.publishedAt || historical.post.publishedAt > new Date()) return null;
  return { post: historical.post, redirected: true };
}, ["published-blog-post-by-slug"], { revalidate: 300, tags: ["blog"] });

export async function resolvePublishedBlogPostBySlug(slug: string) { return cachedResolvePost(slug.trim().slice(0, 160)); }
export async function getPublishedBlogPostBySlug(slug: string) { return (await resolvePublishedBlogPostBySlug(slug))?.post ?? null; }

export async function getRelatedBlogPosts(post: { id: string; categoryId: string | null; tags: Array<{ tagId: string }> }, take = 3) {
  const tagIds = post.tags.map((item) => item.tagId); const affinities: Prisma.BlogPostWhereInput[] = [];
  if (post.categoryId) affinities.push({ categoryId: post.categoryId });
  if (tagIds.length) affinities.push({ tags: { some: { tagId: { in: tagIds } } } });
  return getPrismaClient().blogPost.findMany({ where: { ...publishedWhere(), id: { not: post.id }, OR: affinities.length ? affinities : undefined }, orderBy: { publishedAt: "desc" }, take: positiveInt(take, 3, 12), include: publicPostInclude });
}

const cachedTaxonomy = unstable_cache(async (kind: "category" | "tag", slug: string) => {
  if (kind === "category") return getPrismaClient().blogCategory.findFirst({ where: { slug, posts: { some: publishedWhere() } } });
  return getPrismaClient().blogTag.findFirst({ where: { slug, posts: { some: { post: publishedWhere() } } } });
}, ["public-blog-taxonomy-item"], { revalidate: 300, tags: ["blog"] });
export async function getPublicBlogTaxonomy(kind: "category" | "tag", slug: string) { return cachedTaxonomy(kind, slug.trim().slice(0, 120)); }

export const listPublishedBlogTaxonomy = unstable_cache(async () => {
  const prisma = getPrismaClient();
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({ where: { posts: { some: publishedWhere() } }, select: { slug: true, updatedAt: true } }),
    prisma.blogTag.findMany({ where: { posts: { some: { post: publishedWhere() } } }, select: { slug: true, createdAt: true } }),
  ]);
  return { categories, tags };
}, ["published-blog-taxonomy"], { revalidate: 300, tags: ["blog"] });

export function readingMinutes(content: string | null | undefined) { const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length; return Math.max(1, Math.ceil(words / 220)); }
