import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { RichBlogContent } from "@/components/blog/rich-blog-content";
import {
  BlogAnalyticsView,
  BlogCta,
} from "@/components/blog/blog-cta-analytics";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { ArticleShareActions } from "@/components/blog/article-share-actions";
import { absoluteUrl, siteConfig } from "@/lib/site-config";
import {
  createPageMetadata,
  safeJsonLd,
  toIsoDate,
  toPersianDate,
} from "@/lib/seo";
import {
  getPublishedBlogPostBySlug,
  getRelatedBlogPosts,
  readingMinutes,
  resolvePublishedBlogPostBySlug,
} from "@/server/blog/blog-service";
import { sanitizeBlogHtml } from "@/server/blog/blog-content";
/* eslint-disable @next/next/no-img-element */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug((await params).slug);
  if (!post)
    return { title: "مقاله پیدا نشد", robots: { index: false, follow: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const canonical = post.canonicalUrl || `/blog/${post.slug}`;
  return createPageMetadata({
    title,
    description,
    path: canonical,
    type: "article",
    image: post.coverImageUrl
      ? { url: post.coverImageUrl, alt: post.coverImageAlt || post.title }
      : undefined,
    publishedTime: toIsoDate(post.publishedAt),
    modifiedTime: toIsoDate(post.updatedAt),
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await resolvePublishedBlogPostBySlug((await params).slug);
  if (!resolved) notFound();
  if (resolved.redirected) permanentRedirect(`/blog/${resolved.post.slug}`);
  const post = resolved.post;
  const related = await getRelatedBlogPosts(post);
  const minutes = readingMinutes(post.contentText || post.contentMarkdown);
  const canonical = post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        url: canonical,
        datePublished: toIsoDate(post.publishedAt),
        dateModified: toIsoDate(post.updatedAt),
        author: { "@type": "Person", name: post.author.name || "تیم بینیکس" },
        publisher: {
          "@type": "Organization",
          "@id": absoluteUrl("/#organization"),
          name: siteConfig.name,
          url: siteConfig.url,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/img/Binix-Logo.png"),
          },
        },
        image: post.coverImageUrl
          ? absoluteUrl(post.coverImageUrl)
          : undefined,
        inLanguage: "fa-IR",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "خانه",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "وبلاگ",
            item: absoluteUrl("/blog"),
          },
          ...(post.category
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.category.name,
                  item: absoluteUrl(`/blog/category/${post.category.slug}`),
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: post.category ? 4 : 3,
            name: post.title,
            item: canonical,
          },
        ],
      },
    ],
  };
  return (
    <MarketingPageShell>
      <article className="mx-auto max-w-4xl px-4 pt-32 pb-24 sm:px-6">
        <BlogAnalyticsView slug={post.slug} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(jsonLd),
          }}
        />
        <nav aria-label="مسیر مقاله" className="text-marketing-text-subtle mb-7 flex flex-wrap items-center gap-2 text-xs">
          <Link href="/">خانه</Link><span>/</span><Link href="/blog">وبلاگ</Link>
          {post.category ? <><span>/</span><Link href={`/blog/category/${post.category.slug}`}>{post.category.name}</Link></> : null}
        </nav>
        <header className="border-marketing-border border-b pb-10 text-center">
          <div className="font-ui text-primary text-xs font-bold">
            {post.category ? (
              <Link href={`/blog/category/${post.category.slug}`}>
                {post.category.name}
              </Link>
            ) : (
              "وبلاگ بینیکس"
            )}
          </div>
          <h1 className="font-display mt-4 text-3xl leading-[1.55] font-black sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-marketing-text-muted mx-auto mt-5 max-w-3xl leading-8">
            {post.excerpt}
          </p>
          <div className="text-marketing-text-subtle mt-6 flex flex-wrap justify-center gap-3 text-xs">
            <span>{post.author.name ?? "تیم بینیکس"}</span>
            <span>•</span>
            <time dateTime={toIsoDate(post.publishedAt)}>
              {toPersianDate(post.publishedAt)}
            </time>
            <span>•</span>
            <span>{minutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
          </div>
          <div className="mt-6 flex justify-center">
            <ArticleShareActions title={post.title} />
          </div>
        </header>
        {post.coverImageUrl ? (
          <div className="rounded-panel border-marketing-border mt-8 overflow-hidden border">
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}
        <div className="rounded-panel border-marketing-border bg-marketing-surface mt-10 border p-6 sm:p-10">
          {post.contentHtml ? (
            <RichBlogContent html={sanitizeBlogHtml(post.contentHtml)} />
          ) : (
            <MarkdownContent content={post.contentMarkdown} />
          )}
        </div>
        {post.updatedAt.getTime() - (post.publishedAt?.getTime() ?? 0) > 86_400_000 ? (
          <p className="text-marketing-text-subtle mt-4 text-xs">
            آخرین به‌روزرسانی: {toPersianDate(post.updatedAt)}
          </p>
        ) : null}
        {post.sources.length ? (
          <aside className="rounded-card border-marketing-border mt-8 border p-5">
            <h2 className="font-display font-bold">منابع</h2>
            <ul className="text-marketing-text-muted mt-3 space-y-2 text-sm">
              {post.sources.map((source) => (
                <li key={source.id}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="hover:text-primary"
                  >
                    {source.title ||
                      source.publisher ||
                      new URL(source.url).hostname}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        {post.tags.length ? (
          <nav aria-label="برچسب‌ها" className="mt-8 flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="border-marketing-border rounded-full border px-3 py-1.5 text-xs"
              >
                #{tag.name}
              </Link>
            ))}
          </nav>
        ) : null}
        {post.ctaTitle && post.ctaLabel && post.ctaHref ? (
          <BlogCta
            slug={post.slug}
            title={post.ctaTitle}
            description={post.ctaDescription}
            label={post.ctaLabel}
            href={post.ctaHref}
          />
        ) : null}
        {related.length ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-black">
              مقاله‌های مرتبط
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="rounded-card border-marketing-border hover:border-primary overflow-hidden border transition"
                >
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt={item.coverImageAlt || item.title} loading="lazy" className="aspect-video w-full object-cover" />
                  ) : null}
                  <div className="p-5">
                    <div className="text-primary text-xs">
                      {item.category?.name ?? "بینیکس"}
                    </div>
                    <h3 className="mt-2 leading-7 font-bold">{item.title}</h3>
                    <p className="text-marketing-text-muted mt-2 line-clamp-2 text-xs leading-6">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </MarketingPageShell>
  );
}
