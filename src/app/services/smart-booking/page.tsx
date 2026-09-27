import type { Metadata } from "next";
import DynamicServiceMarketingPage from "@/components/services/shared/DynamicServiceMarketingPage";
import { getManagedSeoMetadata } from "@/server/seo/site-seo-service";
import { getPublicFaqItems } from "@/server/faq/faq-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getManagedSeoMetadata("/services/smart-booking");
}

export default async function SmartBookingPage() {
  const faqItems = await getPublicFaqItems("/services/smart-booking");
  return <DynamicServiceMarketingPage slug="smart-booking" faqItems={faqItems} />;
}
