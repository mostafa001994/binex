import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RichBlogContent } from "@/components/blog/rich-blog-content";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { toIsoDate, toPersianDate } from "@/lib/seo";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import { getAdminBlogPost } from "@/server/admin/admin-blog-service";
import { NotFoundApiError } from "@/server/core/api-error";
import { sanitizeBlogHtml } from "@/server/blog/blog-content";
import {
  getRelatedBlogPosts,
  readingMinutes,
} from "@/server/blog/blog-service";
/* eslint-disable @next/next/no-img-element */

export const metadata = {
  title: "پیش‌نمایش مقاله",
  robots: { index: false, follow: false },
};

export default async function BlogPreviewPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const store = await cookies();
  const user = await getAuthenticatedUser(store.get(AUTH_COOKIE_NAME)?.value);
  const postId = (await params).postId;
  let post: Awaited<ReturnType<typeof getAdminBlogPost>>;
  try {
    post = await getAdminBlogPost(user, postId);
  } catch (error) {
    if (error instanceof NotFoundApiError) notFound();
    throw error;
  }
  const tags = post.tags.map((item) =>
    "tag" in item ? item.tag : item,
  ) as Array<{ id: string; name: string; slug: string }>;
  const related = await getRelatedBlogPosts({
    id: post.id,
    categoryId: post.category?.id ?? null,
    tags: tags.map((tag) => ({ tagId: tag.id })),
  });
  const minutes = readingMinutes(post.contentText || post.contentMarkdown);
  const displayDate = post.publishedAt || post.updatedAt;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-marketing-background px-4 py-16 text-marketing-text"
    >
      <article className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-control border border-amber-400/40 bg-amber-50 p-3 text-center text-sm text-amber-900">
          پیش‌نمایش خصوصی — این صفحه فقط آخرین نسخه ذخیره‌شده را نشان می‌دهد
          و در موتورهای جست‌وجو ثبت نمی‌شود.
        </div>
        <nav
          aria-label="مسیر مقاله"
          className="mb-7 flex flex-wrap items-center gap-2 text-xs text-marketing-text-subtle"
        >
          <span>خانه</span>
          <span>/</span>
          <span>وبلاگ</span>
          {post.category ? (
            <>
              <span>/</span>
              <span>{post.category.name}</span>
            </>
          ) : null}
        </nav>
        <header className="border-b border-marketing-border pb-10 text-center">
          <div className="font-ui text-xs font-bold text-primary">
            {post.category?.name ?? "وبلاگ بینیکس"}
          </div>
          <h1 className="mt-4 font-display text-3xl leading-[1.55] font-black sm:text-5xl">
            {post.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl leading-8 text-marketing-text-muted">
            {post.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-marketing-text-subtle">
            <span>{post.author.name ?? "تیم بینیکس"}</span>
            <span>•</span>
            <time dateTime={toIsoDate(displayDate)}>
              {toPersianDate(displayDate)}
            </time>
            <span>•</span>
            <span>{minutes.toLocaleString("fa-IR")} دقیقه مطالعه</span>
          </div>
        </header>
        {post.coverImageUrl ? (
          <div className="mt-8 overflow-hidden rounded-panel border border-marketing-border">
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}
        <div className="mt-10 rounded-panel border border-marketing-border bg-marketing-surface p-6 sm:p-10">
          {post.contentHtml ? (
            <RichBlogContent html={sanitizeBlogHtml(post.contentHtml)} />
          ) : (
            <MarkdownContent content={post.contentMarkdown} />
          )}
        </div>
        {post.sources.length ? (
          <aside className="mt-8 rounded-card border border-marketing-border p-5">
            <h2 className="font-display font-bold">منابع</h2>
            <ul className="mt-3 space-y-2 text-sm text-marketing-text-muted">
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
        {tags.length ? (
          <div aria-label="برچسب‌ها" className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-marketing-border px-3 py-1.5 text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
        {post.ctaTitle && post.ctaLabel && post.ctaHref ? (
          <aside className="mt-10 rounded-panel border border-primary/25 bg-primary/5 p-6 text-center sm:p-8">
            <h2 className="font-display text-2xl font-black">
              {post.ctaTitle}
            </h2>
            {post.ctaDescription ? (
              <p className="mx-auto mt-3 max-w-2xl leading-8 text-marketing-text-muted">
                {post.ctaDescription}
              </p>
            ) : null}
            <a
              href={post.ctaHref}
              className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary px-5 text-sm font-bold text-white"
            >
              {post.ctaLabel}
            </a>
          </aside>
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
                  className="overflow-hidden rounded-card border border-marketing-border transition hover:border-primary"
                >
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.coverImageAlt || item.title}
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <div className="text-xs text-primary">
                      {item.category?.name ?? "بینیکس"}
                    </div>
                    <h3 className="mt-2 leading-7 font-bold">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-marketing-text-muted">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
