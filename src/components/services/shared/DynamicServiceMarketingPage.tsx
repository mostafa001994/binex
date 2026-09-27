"use client";
/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { FaqStructuredData } from "@/components/marketing/faq-structured-data";
import ServicePlans from "@/components/services/shared/ServicePlans";
import { iconRegistry } from "@/constants/icon-registry";
import {
  getPublicServiceApi,
  type PublicServiceItem,
} from "@/lib/api-client/service-catalog";
import { getPurchasablePlansApi } from "@/lib/api-client/plans";
import { normalizeServiceMarketingContent } from "@/types/service-marketing";
import type { FaqContentItem } from "@/lib/managed-faq-pages";

function accentRgb(accent: string) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(accent);
  return match
    ? `${Number.parseInt(match[1], 16)} ${Number.parseInt(match[2], 16)} ${Number.parseInt(match[3], 16)}`
    : "7 139 255";
}

export default function DynamicServiceMarketingPage({
  slug,
  initialService = null,
  faqItems,
}: {
  slug: string;
  initialService?: PublicServiceItem | null;
  faqItems?: FaqContentItem[];
}) {
  const [service, setService] = useState<PublicServiceItem | null>(initialService);
  const [hasPlans, setHasPlans] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialService) {
      getPurchasablePlansApi()
        .then((catalog) =>
          setHasPlans(catalog.plans.some((plan) => plan.serviceId === initialService.id)),
        )
        .catch(() => setHasPlans(false));
      return;
    }
    let active = true;

    getPublicServiceApi(slug)
      .then(async ({ service: item }) => {
        if (!active) return;
        setService(item);

        try {
          const catalog = await getPurchasablePlansApi();
          if (active) {
            setHasPlans(catalog.plans.some((plan) => plan.serviceId === item.id));
          }
        } catch {
          if (active) setHasPlans(false);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "سرویس پیدا نشد.");
        }
      });

    return () => {
      active = false;
    };
  }, [initialService, slug]);

  if (error) {
    return (
      <MarketingPageShell>
        <main dir="rtl" className="min-h-screen bg-marketing-background px-4 pt-32 text-marketing-text">
          <div className="mx-auto max-w-3xl rounded-panel border border-marketing-border bg-marketing-surface p-8 text-center">
            <h1 className="font-display text-2xl font-bold">سرویس در دسترس نیست</h1>
            <p className="font-ui mt-3 text-sm text-marketing-text-muted">{error}</p>
          </div>
        </main>
      </MarketingPageShell>
    );
  }

  if (!service) {
    return (
      <MarketingPageShell>
        <main className="min-h-screen bg-marketing-background px-4 pt-32">
          <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-panel bg-marketing-surface" />
        </main>
      </MarketingPageShell>
    );
  }

  const normalizedContent = normalizeServiceMarketingContent(service.marketingContent, service);
  const content = faqItems ? { ...normalizedContent, faq: faqItems } : normalizedContent;
  const Icon = iconRegistry[service.iconKey] || iconRegistry["layout-grid"];
  const style = {
    "--service-accent": service.accent,
    "--service-accent-rgb": accentRgb(service.accent),
  } as CSSProperties;

  return (
    <div style={style}>
      <FaqStructuredData items={content.faq} />
      <MarketingPageShell>
        <main dir="rtl" className="min-h-screen overflow-hidden bg-marketing-background text-marketing-text">
          <section className="relative px-4 pb-24 pt-32 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(var(--service-accent-rgb),.15),transparent_34%)]" />
            <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="font-ui inline-flex items-center gap-2 rounded-full border border-service-accent/25 bg-service-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-service-accent">
                  <Sparkles size={14} /> {content.hero.eyebrow}
                </div>
                <h1 className="font-display mt-6 text-4xl font-black leading-[1.6] sm:text-5xl lg:text-6xl">
                  {content.hero.title}
                </h1>
                <p className="font-ui mt-6 max-w-3xl text-sm leading-8 text-marketing-text-muted sm:text-base">
                  {content.hero.description}
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  {service.availability === "available" && hasPlans ? (
                    <Link href="#plans" className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-6 text-sm font-bold text-white transition hover:-translate-y-0.5">
                      {content.hero.primaryCtaLabel} <ArrowLeft size={15} />
                    </Link>
                  ) : service.availability === "available" ? (
                    <Link href={content.cta.href} className="font-ui inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-6 text-sm font-bold text-white transition hover:-translate-y-0.5">
                      {content.hero.secondaryCtaLabel} <ArrowLeft size={15} />
                    </Link>
                  ) : (
                    <span className="font-ui inline-flex h-12 items-center rounded-control border border-marketing-border px-5 text-sm text-marketing-text-muted">
                      این سرویس به‌زودی عرضه می‌شود
                    </span>
                  )}
                  <Link href={content.cta.href} className="font-ui inline-flex h-12 items-center rounded-control border border-marketing-border px-6 text-sm font-semibold text-marketing-text-muted transition hover:border-service-accent/40 hover:text-marketing-text">
                    {content.hero.secondaryCtaLabel}
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-8 rounded-full bg-service-accent/10 blur-3xl" />
                {content.hero.imageUrl ? (
                  <figure className="relative overflow-hidden rounded-panel border border-marketing-border bg-marketing-surface/85 shadow-2xl">
                    <img
                      src={content.hero.imageUrl}
                      alt={content.hero.imageAlt || content.hero.title}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </figure>
                ) : (
                <div className="relative rounded-panel border border-marketing-border bg-marketing-surface/85 p-6 shadow-2xl backdrop-blur">
                  <div className="flex items-center gap-4 border-b border-marketing-border pb-5">
                    <div className="flex size-14 items-center justify-center rounded-card bg-service-accent/10 text-service-accent">
                      <Icon size={25} />
                    </div>
                    <div>
                      <div className="font-display text-lg font-bold">{service.name}</div>
                      <div className="font-ui mt-1 text-[11px] text-marketing-text-muted">{service.category}</div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {service.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="font-ui flex items-center gap-3 rounded-control border border-marketing-border bg-white/[0.025] px-4 py-3 text-xs text-marketing-text-muted">
                        <Check size={15} className="shrink-0 text-service-accent" /> {feature}
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          </section>

          <section className="border-y border-marketing-border bg-marketing-surface/35 px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1120px]">
              <SectionHeading eyebrow="مزیت‌های سرویس" title={`چرا ${service.shortName}؟`} description="قابلیت‌های اصلی این سرویس در یک مسیر ساده و قابل مدیریت کنار هم قرار گرفته‌اند." />
              <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {content.benefits.map((item, index) => (
                  <article key={`${item.title}-${index}`} className="rounded-card border border-marketing-border bg-marketing-background/60 p-6">
                    <div className="flex size-11 items-center justify-center rounded-control bg-service-accent/10 text-service-accent"><CheckCircle2 size={20} /></div>
                    <h3 className="font-display mt-5 text-lg font-bold">{item.title}</h3>
                    <p className="font-ui mt-3 text-xs leading-7 text-marketing-text-muted">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1120px]">
              <SectionHeading eyebrow="مسیر شروع" title="از انتخاب تا استفاده" description="مراحل راه‌اندازی برای همه سرویس‌ها روشن و از داخل پنل قابل پیگیری است." />
              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {content.steps.map((item, index) => (
                  <article key={`${item.title}-${index}`} className="relative rounded-card border border-marketing-border bg-marketing-surface/60 p-6">
                    <div className="font-display text-3xl font-black text-service-accent/40">{String(index + 1).padStart(2, "0")}</div>
                    <h3 className="font-display mt-4 text-lg font-bold">{item.title}</h3>
                    <p className="font-ui mt-3 text-xs leading-7 text-marketing-text-muted">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-marketing-border bg-[linear-gradient(135deg,rgba(var(--service-accent-rgb),.08),transparent_58%)] px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <div className="flex size-12 items-center justify-center rounded-control bg-service-accent/10 text-service-accent"><ShieldCheck size={23} /></div>
                <h2 className="font-display mt-5 text-3xl font-black leading-relaxed">{content.trust.title}</h2>
                <p className="font-ui mt-4 text-sm leading-8 text-marketing-text-muted">{content.trust.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.trust.items.map((item) => (
                  <div key={item} className="font-ui flex items-center gap-3 rounded-control border border-marketing-border bg-marketing-surface/70 p-4 text-xs font-semibold">
                    <Layers3 size={16} className="shrink-0 text-service-accent" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <ServicePlans serviceId={service.id} serviceName={service.name} showWhenEmpty />

          {content.faq.length ? (
            <section className="px-4 py-24 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <SectionHeading eyebrow="پرسش‌های متداول" title="پاسخ به سؤال‌های رایج" />
                <div className="mt-10 space-y-3">
                  {content.faq.map((item) => (
                    <details key={item.question} className="group rounded-card border border-marketing-border bg-marketing-surface/60 p-5">
                      <summary className="font-display cursor-pointer list-none text-sm font-bold">
                        <span className="flex items-center justify-between gap-4">{item.question}<span className="text-lg font-normal text-service-accent transition group-open:rotate-45">+</span></span>
                      </summary>
                      <p className="font-ui mt-4 border-t border-marketing-border pt-4 text-xs leading-7 text-marketing-text-muted">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="px-4 pb-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[960px] rounded-panel border border-service-accent/20 bg-service-accent/[0.07] p-8 text-center sm:p-12">
              <Sparkles className="mx-auto text-service-accent" size={28} />
              <h2 className="font-display mt-5 text-3xl font-black leading-relaxed">{content.cta.title}</h2>
              <p className="font-ui mx-auto mt-4 max-w-2xl text-sm leading-8 text-marketing-text-muted">{content.cta.description}</p>
              <Link href={content.cta.href} className="font-ui mt-7 inline-flex h-12 items-center gap-2 rounded-control bg-service-accent px-6 text-sm font-bold text-white">
                {content.cta.label} <ArrowLeft size={15} />
              </Link>
            </div>
          </section>
        </main>
      </MarketingPageShell>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="font-ui text-xs font-semibold text-service-accent">{eyebrow}</div>
      <h2 className="font-display mt-4 text-3xl font-black leading-relaxed sm:text-4xl">{title}</h2>
      {description ? <p className="font-ui mt-4 text-sm leading-8 text-marketing-text-muted">{description}</p> : null}
    </div>
  );
}
