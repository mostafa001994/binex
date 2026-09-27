import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: number;
  caption?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  caption,
}: MetricCardProps) {
  const positive = typeof delta === "number" && delta >= 0;

  return (
    <Card className="space-y-4">
      <p className="font-ui text-sm text-foreground-muted">{label}</p>

      <div className="flex items-end justify-between gap-4">
        <strong className="font-ui text-3xl font-bold tracking-tight text-foreground">
          {value}
        </strong>

        {typeof delta === "number" && (
          <div
            className={cn(
              "font-ui flex items-center gap-1 text-sm font-medium",
              positive ? "text-success" : "text-error"
            )}
          >
            {positive ? (
              <TrendingUp size={16} aria-hidden="true" />
            ) : (
              <TrendingDown size={16} aria-hidden="true" />
            )}
            <span>{Math.abs(delta)}٪</span>
          </div>
        )}
      </div>

      {caption && (
        <p className="font-ui text-xs text-foreground-subtle">{caption}</p>
      )}
    </Card>
  );
}
