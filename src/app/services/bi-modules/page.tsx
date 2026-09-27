import type { Metadata } from "next";
import DynamicServiceMarketingPage from "@/components/services/shared/DynamicServiceMarketingPage";
import { getManagedSeoMetadata } from "@/server/seo/site-seo-service";
import { getPublicFaqItems } from "@/server/faq/faq-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getManagedSeoMetadata("/services/bi-modules");
}

export default async function BIModulesPage() {
  const faqItems = await getPublicFaqItems("/services/bi-modules");
  return <DynamicServiceMarketingPage slug="bi-modules" faqItems={faqItems} />;
}
