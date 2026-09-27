import Link from "next/link";
import { redirect } from "next/navigation";
import { toIsoDate, toPersianDate } from "@/lib/seo";
import { searchPublishedBlogPosts } from "@/server/blog/blog-service";
/* eslint-disable @next/next/no-img-element */

export async function BlogIndex({
  query = "",
  category = "",
  tag = "",
  page = 1,
  basePath = "/blog",
  title = "راهنمای رشد هوشمند کسب‌وکار",
  description = "مقاله‌های کاربردی، تجربه‌های واقعی و تحلیل ابزارهایی که به تصمیم‌گیری بهتر کمک می‌کنند.",
}: {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  basePath?: string;
  title?: string;
  description?: string;
}) {
  const data = await searchPublishedBlogPosts({ query, category, tag, page });
  const pageHref = (next: number) => {
    const params = new URLSearchParams();
    if (basePath === "/blog") {
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
    }
    if (next > 1) params.set("page", String(next));
    return `${basePath}${params.size ? `?${params}` : ""}`;
  };
  if (page > data.pagination.totalPages) {
    redirect(pageHref(data.pagination.totalPages));
  }
  return (
    <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6">
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-ui text-primary text-xs font-bold">مجله بینیکس</p>
        <h1 className="font-display mt-3 text-4xl font-black sm:text-5xl">
          {title}
        </h1>
        <p className="text-marketing-text-muted mt-5 leading-8">
          {description}
        </p>
      </header>
      <form action="/blog" className="mx-auto mt-10 flex max-w-2xl gap-2">
        <input
          name="q"
          defaultValue={query}
          aria-label="جست‌وجوی مقاله"
          placeholder="جست‌وجو در مقاله‌ها…"
          className="rounded-control border-marketing-border bg-marketing-surface focus:border-primary h-12 flex-1 border px-4 outline-none"
        />
        <button className="rounded-control bg-primary px-5 text-sm font-bold text-white">
          جست‌وجو
        </button>
      </form>
      <nav
        aria-label="دسته‌ها"
        className="mt-7 flex flex-wrap justify-center gap-2"
      >
        <Link
          href="/blog"
          aria-current={!category && !tag && !query ? "page" : undefined}
          className={`rounded-full border px-3 py-1.5 text-xs ${!category && !tag && !query ? "border-primary bg-primary/10 text-primary" : "border-marketing-border"}`}
        >
          همه
        </Link>
        {data.categories.map((item) => (
          <Link
            key={item.id}
            href={`/blog/category/${item.slug}`}
            aria-current={category === item.slug ? "page" : undefined}
            className={`hover:border-primary rounded-full border px-3 py-1.5 text-xs ${category === item.slug ? "border-primary bg-primary/10 text-primary" : "border-marketing-border"}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      {data.posts.length ? (
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <article
              key={post.id}
              className="rounded-panel border-marketing-border bg-marketing-surface flex flex-col overflow-hidden border"
            >
              {post.coverImageUrl ? (
                <Link href={`/blog/${post.slug}`} className="bg-marketing-background block aspect-[16/9] overflow-hidden" aria-label={`مطالعه ${post.title}`}>
                  <img
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </Link>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <div className="text-primary text-[11px]">
                  {post.category ? (
                    <Link href={`/blog/category/${post.category.slug}`}>
                      {post.category.name}
                    </Link>
                  ) : (
                    "بینیکس"
                  )}
                </div>
                <h2 className="font-display mt-3 text-xl leading-8 font-black">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-marketing-text-muted mt-4 line-clamp-3 text-sm leading-7">
                  {post.excerpt}
                </p>
                <div className="text-marketing-text-subtle mt-auto flex items-center justify-between pt-7 text-[11px]">
                  <span>{post.author.name ?? "تیم بینیکس"}</span>
                  <time dateTime={toIsoDate(post.publishedAt)}>
                    {toPersianDate(post.publishedAt)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-panel border-marketing-border bg-marketing-surface text-marketing-text-muted mx-auto mt-14 max-w-2xl border p-10 text-center">
          <p>مقاله‌ای با این شرایط پیدا نشد.</p>
          <Link href="/blog" className="text-primary mt-4 inline-flex text-sm font-bold">مشاهده همه مقاله‌ها</Link>
        </div>
      )}
      {data.pagination.totalPages > 1 ? (
        <nav aria-label="صفحه‌بندی" className="mt-10 flex justify-center gap-3">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-control border-marketing-border border px-4 py-2 text-sm"
            >
              قبلی
            </Link>
          ) : null}
          <span className="px-3 py-2 text-sm">
            صفحه {page.toLocaleString("fa-IR")} از{" "}
            {data.pagination.totalPages.toLocaleString("fa-IR")}
          </span>
          {page < data.pagination.totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-control border-marketing-border border px-4 py-2 text-sm"
            >
              بعدی
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
