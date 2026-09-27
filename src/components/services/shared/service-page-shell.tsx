import type { ReactNode } from "react";
import type { ServiceId } from "@/constants/services-config";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";
import { ServiceTheme } from "@/components/theme/service-theme";

export function ServicePageShell({
  service,
  children,
}: {
  service: ServiceId;
  children: ReactNode;
}) {
  return (
    <ServiceTheme service={service}>
      <MarketingPageShell>{children}</MarketingPageShell>
    </ServiceTheme>
  );
}
