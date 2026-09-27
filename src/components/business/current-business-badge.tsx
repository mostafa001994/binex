"use client";

import { Building2 } from "lucide-react";
import { useBusiness } from "@/components/business/business-context";

export function CurrentBusinessBadge() {
  const { business, membership } = useBusiness();

  return (
    <div className="flex items-center gap-2 rounded-control border border-border bg-surface-raised/70 px-3 py-2">
      <div className="flex size-7 items-center justify-center rounded-control bg-primary/10 text-primary">
        <Building2 size={14} />
      </div>

      <div className="min-w-0">
        <div className="font-ui text-[9px] leading-4 text-foreground-subtle">
          {membership.role === "owner" ? "مالک کسب‌وکار" : "عضو کسب‌وکار"}
        </div>
        <div className="font-ui max-w-40 truncate text-[11px] font-semibold text-foreground">
          {business.name}
        </div>
      </div>
    </div>
  );
}
