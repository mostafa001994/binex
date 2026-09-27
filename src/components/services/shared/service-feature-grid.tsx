import type { ServiceFeature } from "@/components/services/shared/service-feature-card";
import { ServiceFeatureCard } from "@/components/services/shared/service-feature-card";

export function ServiceFeatureGrid({
  features,
  columns = 3,
}: {
  features: ServiceFeature[];
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "lg:grid-cols-4"
      : columns === 2
        ? "lg:grid-cols-2"
        : "lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${gridClass}`}>
      {features.map((feature) => (
        <ServiceFeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  );
}
