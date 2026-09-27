import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={error || undefined}
      className={cn(
        "font-ui h-11 w-full rounded-control border bg-surface px-3.5 text-sm text-foreground",
        "placeholder:text-foreground-subtle",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/15",
        "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-disabled",
        error
          ? "border-error focus:border-error focus:ring-error/15"
          : "border-border hover:border-border-strong focus:border-primary",
        className
      )}
    />
  );
}
