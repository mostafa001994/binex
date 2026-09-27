import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-config";
import { listPublishedBlogPosts } from "@/server/blog/blog-service";
import { listPublicServices } from "@/server/services/services-service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts] = await Promise.all([
    listPublicServices(),
    listPublishedBlogPosts(),
  ]);
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
