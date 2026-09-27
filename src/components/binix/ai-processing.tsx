import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AIProcessingStep {
  label: string;
  status: "done" | "active" | "pending";
}

interface AIProcessingProps {
  title?: string;
  progress?: number;
  steps: AIProcessingStep[];
}

export function AIProcessing({
  title = "Binix در حال پردازش است",
  progress = 0,
  steps,
}: AIProcessingProps) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-control border border-accent/20 bg-accent/10 text-accent shadow-glow-sm">
            <Sparkles size={19} />
          </div>

          <div>
            <h3
              data-display-title="true"
              className="text-lg font-bold text-foreground"
            >
              {title}
            </h3>
            <p className="mt-1 font-ui text-sm text-foreground-muted">
              چند لحظه صبر کنید؛ نتیجه به‌صورت مرحله‌ای آماده می‌شود.
            </p>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))] transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <div className="mt-6 space-y-3">
          {steps.map((step) => (
            <div
              key={step.label}
              className="flex items-center gap-3 font-ui text-sm"
            >
              <div className="flex size-7 items-center justify-center rounded-full border border-border bg-surface-muted">
                {step.status === "done" && (
                  <Check size={15} className="text-success" />
                )}
                {step.status === "active" && (
                  <LoaderCircle size={15} className="animate-spin text-accent" />
                )}
                {step.status === "pending" && (
                  <span className="size-1.5 rounded-full bg-foreground-subtle" />
                )}
              </div>

              <span
                className={
                  step.status === "active"
                    ? "text-foreground"
                    : "text-foreground-muted"
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
