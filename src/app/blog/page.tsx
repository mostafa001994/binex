import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/blog-index";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { createPageMetadata } from "@/lib/seo";
import { getManagedSeoMetadata } from "@/server/seo/site-seo-service";

export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const filtered = Boolean(params.q || params.category || params.tag);
  const canonical = `/blog${page > 1 && !filtered ? `?page=${page}` : ""}`;
  const metadata =
    page === 1 && !filtered
      ? await getManagedSeoMetadata("/blog")
      : createPageMetadata({
          title: params.q ? `نتایج جست‌وجو برای ${params.q}` : "وبلاگ",
          description:
            "آموزش و تحلیل کاربردی درباره هوش مصنوعی، فروش، نوبت‌دهی و هوش تجاری برای کسب‌وکارها.",
          path: canonical,
          robots: filtered ? { index: false, follow: true } : undefined,
        });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { "application/rss+xml": "/blog/rss.xml" },
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <MarketingPageShell>
      <BlogIndex
        query={params.q}
        category={params.category}
        tag={params.tag}
        page={Number(params.page) || 1}
      />
    </MarketingPageShell>
  );
}
