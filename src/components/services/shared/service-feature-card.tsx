import { iconRegistry, type IconKey } from "@/constants/icon-registry";
import { MarketingCard } from "@/components/marketing/marketing-card";

export type ServiceFeature = {
  icon: IconKey;
  title: string;
  description: string;
};

export function ServiceFeatureCard({ icon, title, description }: ServiceFeature) {
  const Icon = iconRegistry[icon];

  return (
    <MarketingCard variant="interactive" padding="lg">
      <div className="flex size-11 items-center justify-center rounded-control border border-service-accent/20 bg-service-accent/10 text-service-accent">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h3 className="font-display mt-5 text-lg font-bold text-marketing-text">{title}</h3>
      <p className="font-ui mt-2 text-[13px] leading-7 text-marketing-text-muted">{description}</p>
    </MarketingCard>
  );
}
