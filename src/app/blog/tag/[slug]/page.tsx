import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/blog/blog-index";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/seo";
import { getPublicBlogTaxonomy } from "@/server/blog/blog-service";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const item = await getPublicBlogTaxonomy("tag", (await params).slug);
  if (!item)
    return { title: "برچسب پیدا نشد", robots: { index: false, follow: false } };
  const page = Math.max(1, Math.floor(Number((await searchParams).page) || 1));
  return createPageMetadata({
    title: `برچسب ${item.name}`,
    description: `مقاله‌های مرتبط با ${item.name} در مجله بینیکس.`,
    path: `/blog/tag/${item.slug}${page > 1 ? `?page=${page}` : ""}`,
  });
}
export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const slug = (await params).slug;
  const item = await getPublicBlogTaxonomy("tag", slug);
  if (!item) notFound();
  return (
    <MarketingPageShell>
      <BlogIndex
        tag={slug}
        basePath={`/blog/tag/${slug}`}
        page={Number((await searchParams).page) || 1}
        title={`برچسب ${item.name}`}
        description="مقاله‌های مرتبط با این موضوع در مجله بینیکس"
      />
    </MarketingPageShell>
  );
}
