"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex size-9 items-center justify-center rounded-control border border-border bg-surface text-foreground-muted transition hover:bg-surface-hover disabled:opacity-40"
        aria-label="صفحه قبلی"
      >
        <ChevronRight size={17} />
      </button>

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          className={cn(
            "font-ui size-9 rounded-control text-sm transition",
            item === page
              ? "bg-primary text-white"
              : "border border-border bg-surface text-foreground-muted hover:bg-surface-hover"
          )}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="flex size-9 items-center justify-center rounded-control border border-border bg-surface text-foreground-muted transition hover:bg-surface-hover disabled:opacity-40"
        aria-label="صفحه بعدی"
      >
        <ChevronLeft size={17} />
      </button>
    </nav>
  );
}
