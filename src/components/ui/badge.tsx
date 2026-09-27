import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "ai";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-muted text-foreground-muted",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  error: "border-error/20 bg-error/10 text-error",
  info: "border-info/20 bg-info/10 text-info",
  ai: "border-accent/20 bg-accent/10 text-accent",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "font-ui inline-flex min-h-6 items-center rounded-full border px-2.5 text-xs font-medium",
        variants[variant],
        className
      )}
    />
  );
}
