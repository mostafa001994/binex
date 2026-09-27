import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DynamicServiceMarketingPage from "@/components/services/shared/DynamicServiceMarketingPage";
import { createPageMetadata } from "@/lib/seo";
import { normalizeServiceMarketingContent } from "@/types/service-marketing";
import { getPublicServiceBySlug } from "@/server/services/services-service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const service = await getPublicServiceBySlug(slug);
    const content = normalizeServiceMarketingContent(service.marketingContent, service);
    return createPageMetadata({
      title: content.hero.title || service.name,
      description: content.hero.description || service.description,
      path: `/services/${service.slug}`,
      image: content.hero.imageUrl
        ? { url: content.hero.imageUrl, alt: content.hero.imageAlt || content.hero.title }
        : undefined,
    });
  } catch {
    return { title: "سرویس پیدا نشد", robots: { index: false, follow: false } };
  }
}

export default async function DynamicServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const service = await getPublicServiceBySlug(slug);
    return <DynamicServiceMarketingPage slug={slug} initialService={service} />;
  } catch {
    notFound();
  }
}
