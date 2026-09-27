"use client";

import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  ariaLabel,
  disabled,
  className,
}: SwitchProps) {
  return (
    <div
      className={cn(
        "font-ui inline-flex items-center gap-3 text-sm text-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full border transition duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
          checked ? "border-primary bg-primary" : "border-border bg-surface-raised",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow-binix-sm transition duration-200",
            checked ? "right-[22px]" : "right-1",
          )}
        />
      </button>
      {label && <span>{label}</span>}
    </div>
  );
}
