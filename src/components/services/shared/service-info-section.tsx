import { MarketingCard } from "@/components/marketing/marketing-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { iconRegistry, type IconKey } from "@/constants/icon-registry";

export type ServiceInfoItem = {
  icon: IconKey;
  title: string;
  description: string;
};

export function ServiceInfoSection({
  badge,
  title,
  description,
  items,
}: {
  badge: string;
  title: string;
  description?: string;
  items: ServiceInfoItem[];
}) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <SectionHeading badge={badge} title={title} description={description} serviceTone className="mb-10" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = iconRegistry[item.icon];
            return (
              <MarketingCard key={item.title} variant="interactive" padding="lg" className="h-full">
                <div className="flex size-10 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-marketing-text">{item.title}</h3>
                <p className="font-ui mt-2 text-[13px] leading-7 text-marketing-text-muted">{item.description}</p>
              </MarketingCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
