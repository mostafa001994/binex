import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسیر صفحه">
      <ol className="font-ui flex flex-wrap items-center gap-1.5 text-xs text-foreground-subtle">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-foreground-muted" : ""}>
                  {item.label}
                </span>
              )}

              {!last && <ChevronLeft size={13} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
