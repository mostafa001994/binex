import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminFilterBar({
  children,
  onReset,
  hasActiveFilters = false,
}: {
  children: ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-3 shadow-binix-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
          {children}
        </div>

        {onReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasActiveFilters}
            leadingIcon={<RotateCcw size={14} />}
            onClick={onReset}
            className="shrink-0"
          >
            پاک کردن فیلترها
          </Button>
        ) : null}
      </div>
    </div>
  );
}
