import type { Metadata } from "next";
import DynamicServiceMarketingPage from "@/components/services/shared/DynamicServiceMarketingPage";
import { getManagedSeoMetadata } from "@/server/seo/site-seo-service";
import { getPublicFaqItems } from "@/server/faq/faq-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getManagedSeoMetadata("/services/excel-analyzer");
}

export default async function ExcelAnalyzerPage() {
  const faqItems = await getPublicFaqItems("/services/excel-analyzer");
  return <DynamicServiceMarketingPage slug="excel-analyzer" faqItems={faqItems} />;
}
