import type { ReactNode } from "react";

export function AppSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 data-display-title="true" className="text-xl font-bold text-foreground md:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1 font-ui text-sm leading-7 text-foreground-muted">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
