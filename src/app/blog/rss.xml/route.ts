import { listPublishedBlogPosts } from "@/server/blog/blog-service";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

const xml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
export async function GET() {
  const posts = await listPublishedBlogPosts(50);
  const items = posts.map((post) => `<item><title>${xml(post.title)}</title><link>${xml(absoluteUrl(`/blog/${post.slug}`))}</link><guid isPermaLink="true">${xml(absoluteUrl(`/blog/${post.slug}`))}</guid><description>${xml(post.excerpt)}</description><pubDate>${post.publishedAt?.toUTCString() ?? ""}</pubDate></item>`).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(siteConfig.name)} Blog</title><link>${xml(absoluteUrl("/blog"))}</link><description>مجله بینیکس</description><language>fa-IR</language>${items}</channel></rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
