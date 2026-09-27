"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "font-ui inline-flex items-center gap-2.5 text-sm text-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "flex size-5 items-center justify-center rounded-[6px] border transition duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
          checked
            ? "border-primary bg-primary text-white"
            : "border-border bg-surface hover:border-border-strong"
        )}
      >
        {checked && <Check size={14} strokeWidth={2.4} />}
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
