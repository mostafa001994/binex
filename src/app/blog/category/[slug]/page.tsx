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
  const item = await getPublicBlogTaxonomy("category", (await params).slug);
  if (!item)
    return { title: "دسته پیدا نشد", robots: { index: false, follow: false } };
  const page = Math.max(1, Math.floor(Number((await searchParams).page) || 1));
  const description =
    "description" in item &&
    typeof item.description === "string" &&
    item.description
      ? item.description
      : `مقاله‌های دسته ${item.name} در وبلاگ بینیکس.`;
  return createPageMetadata({
    title: item.name,
    description,
    path: `/blog/category/${item.slug}${page > 1 ? `?page=${page}` : ""}`,
  });
}
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const slug = (await params).slug;
  const item = await getPublicBlogTaxonomy("category", slug);
  if (!item) notFound();
  const description =
    "description" in item && typeof item.description === "string"
      ? item.description
      : "مقاله‌های این دسته در مجله بینیکس";
  return (
    <MarketingPageShell>
      <BlogIndex
        category={slug}
        basePath={`/blog/category/${slug}`}
        page={Number((await searchParams).page) || 1}
        title={item.name}
        description={description}
      />
    </MarketingPageShell>
  );
}
