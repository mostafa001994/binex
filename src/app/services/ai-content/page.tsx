import type { Metadata } from "next";
import DynamicServiceMarketingPage from "@/components/services/shared/DynamicServiceMarketingPage";
import { getManagedSeoMetadata } from "@/server/seo/site-seo-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getManagedSeoMetadata("/services/ai-content");
}

export default function AiContentPage() {
  return <DynamicServiceMarketingPage slug="ai-content" />;
}
