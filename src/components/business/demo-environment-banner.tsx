"use client";

import { DemoBadge } from "@/components/binix/demo-badge";
import { useBusiness } from "@/components/business/business-context";

export function DemoEnvironmentBanner() {
  const { dataMode } = useBusiness();

  if (dataMode !== "mock") {
    return null;
  }

  return (
    <div className="border-b border-warning/15 bg-warning/[0.04] px-4 py-2 md:px-6">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 font-ui text-xs text-foreground-muted">
        <DemoBadge />
        <span>
          داده‌های فعلی از Mock Repository می‌آیند و هنوز به دیتابیس واقعی متصل نیستند.
        </span>
      </div>
    </div>
  );
}
