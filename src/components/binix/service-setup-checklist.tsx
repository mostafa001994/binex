import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export type SetupStep = {
  id: string;
  title: string;
  description?: string;
  done?: boolean;
  href?: string;
};

export function ServiceSetupChecklist({
  title = "راه‌اندازی سرویس",
  description,
  steps,
}: {
  title?: string;
  description?: string;
  steps: SetupStep[];
}) {
  const doneCount = steps.filter((step) => step.done).length;
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 data-display-title="true" className="text-lg font-bold">{title}</h2>
          {description && <p className="mt-1 font-ui text-sm leading-7 text-foreground-muted">{description}</p>}
        </div>
        <div className="font-ui text-xs font-semibold text-primary">{doneCount.toLocaleString("fa-IR")} از {steps.length.toLocaleString("fa-IR")} مرحله</div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-raised" aria-label={`پیشرفت راه‌اندازی ${progress} درصد`}>
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5 divide-y divide-border-subtle">
        {steps.map((step) => {
          const content = (
            <div className={cn("flex items-start gap-3 py-3.5", step.href && "group") }>
              {step.done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" /> : <Circle size={18} className="mt-0.5 shrink-0 text-foreground-subtle" aria-hidden="true" />}
              <div className="min-w-0 flex-1">
                <div className={cn("font-ui text-sm font-medium", step.done ? "text-foreground-muted line-through" : "text-foreground")}>{step.title}</div>
                {step.description && <p className="mt-1 font-ui text-xs leading-6 text-foreground-subtle">{step.description}</p>}
              </div>
              {step.href && <ArrowLeft size={15} className="mt-1 shrink-0 text-foreground-subtle transition group-hover:-translate-x-1 group-hover:text-primary" aria-hidden="true" />}
            </div>
          );
          return step.href ? <Link key={step.id} href={step.href}>{content}</Link> : <div key={step.id}>{content}</div>;
        })}
      </div>
    </Card>
  );
}
