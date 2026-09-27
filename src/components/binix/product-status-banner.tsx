import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

export function ProductStatusBanner({
  title,
  description,
  tone = "info",
  className,
}: {
  title: string;
  description: string;
  tone?: "info" | "warning" | "success";
  className?: string;
}) {
  const toneClass = {
    info: "border-info/20 bg-info/[0.07] text-info",
    warning: "border-warning/20 bg-warning/[0.07] text-warning",
    success: "border-success/20 bg-success/[0.07] text-success",
  }[tone];

  return (
    <div className={cn("rounded-card border p-4", toneClass, className)} role="status">
      <div className="flex items-start gap-3">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <div className="font-display text-sm font-bold text-foreground">{title}</div>
          <p className="mt-1 font-ui text-xs leading-6 text-foreground-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
