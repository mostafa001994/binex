import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1
          data-display-title="true"
          className="text-2xl font-bold tracking-tight text-foreground"
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl font-ui text-sm leading-6 text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
