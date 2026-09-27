import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-card border border-border bg-surface-raised text-foreground-subtle">
        <SearchX size={18} />
      </div>

      <div className="mt-3 font-ui text-sm font-semibold text-foreground">
        {title}
      </div>

      {description ? (
        <p className="mt-1 max-w-sm font-ui text-xs leading-5 text-foreground-muted">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-4">
          {action}
        </div>
      ) : null}
    </div>
  );
}
