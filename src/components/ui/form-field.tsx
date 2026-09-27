import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FormField({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const messageId = `${id}-message`;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="font-ui block text-sm font-medium text-foreground">
        {label} {optional && <span className="text-foreground-subtle">(اختیاری)</span>}
      </label>
      {children}
      {(error || hint) && (
        <p id={messageId} className={cn("font-ui text-xs leading-6", error ? "text-error" : "text-foreground-subtle")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
