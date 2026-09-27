import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function pagesFor(
  current: number,
  total: number,
) {
  const start = Math.max(
    1,
    Math.min(
      current - 2,
      Math.max(1, total - 4),
    ),
  );
  const end = Math.min(
    total,
    start + 4,
  );

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  );
}

export function AdminPagination({
  page,
  totalPages,
  total,
  label,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  label: string;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1 && total === 0) {
    return null;
  }

  const pages = pagesFor(
    page,
    totalPages,
  );

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-ui text-xs text-foreground-muted">
        {total.toLocaleString("fa-IR")}{" "}
        {label}
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={page <= 1}
          aria-label="صفحه قبلی"
          onClick={() =>
            onPageChange(page - 1)
          }
        >
          <ChevronRight size={15} />
        </Button>

        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              onPageChange(item)
            }
            className={
              item === page
                ? "font-ui flex size-9 items-center justify-center rounded-control bg-primary text-xs font-semibold text-white shadow-binix-sm"
                : "font-ui flex size-9 items-center justify-center rounded-control border border-border bg-surface text-xs text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
            }
          >
            {item.toLocaleString("fa-IR")}
          </button>
        ))}

        <Button
          type="button"
          size="icon"
          variant="secondary"
          disabled={page >= totalPages}
          aria-label="صفحه بعدی"
          onClick={() =>
            onPageChange(page + 1)
          }
        >
          <ChevronLeft size={15} />
        </Button>
      </div>
    </div>
  );
}
