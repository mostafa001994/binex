import AiSalesSpotlight from "@/components/landing/ai-sales-spotlight";
import BusinessProblems from "@/components/landing/business-problems";
import ConsultationForm from "@/components/landing/consultation-form";
import HowBinixWorks from "@/components/landing/how-binix-works";
import Hero from "@/components/landing/hero";
import HomeFaq from "@/components/landing/home-faq";
import HomeFinalCTA from "@/components/landing/home-final-cta";
import HomeMotionLayer from "@/components/landing/home-motion-layer";
import HomeParallaxOrbs from "@/components/landing/home-parallax-orbs";
import HomeScrollProgress from "@/components/landing/home-scroll-progress";
import HomeTrust from "@/components/landing/home-trust";
import HomeTrustStrip from "@/components/landing/home-trust-strip";
import Pricing from "@/components/landing/pricing";
import Products from "@/components/landing/products";
import RoiCalculator from "@/components/landing/roi-calculator";
import UseCases from "@/components/landing/use-cases";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { FaqStructuredData } from "@/components/marketing/faq-structured-data";
import { getPublicFaqItems } from "@/server/faq/faq-service";
import { getManagedSeoMetadata } from "@/server/seo/site-seo-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getManagedSeoMetadata("/");
}

export default async function Home() {
  const faqItems = await getPublicFaqItems("/");
  return (
    <MarketingPageShell withNavbar={false} withFooter={false}>
      <FaqStructuredData items={faqItems} />
      <HomeScrollProgress />
      <HomeMotionLayer />
      <HomeParallaxOrbs />

      <div dir="rtl" className="relative z-10 pt-10">
        <Navbar />
        <Hero />
        <HomeTrustStrip />
        <BusinessProblems />
        <Products />
        <AiSalesSpotlight />
        <HowBinixWorks />
        <UseCases />
        <RoiCalculator />
        <Pricing />
        <HomeTrust />
        <HomeFaq items={faqItems} />
        <HomeFinalCTA />
        <ConsultationForm />
        <Footer />
      </div>
    </MarketingPageShell>
  );
}
import type { Metadata } from "next";
