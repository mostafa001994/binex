import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && <div className="mb-3 overflow-x-auto"><Breadcrumbs items={breadcrumbs} /></div>}
        <h1 data-display-title="true" className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl font-ui text-sm leading-7 text-foreground-muted sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto md:shrink-0">{actions}</div>}
    </div>
  );
}
