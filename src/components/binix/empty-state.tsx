import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center px-5 text-center sm:px-8">
      <div className="flex size-12 items-center justify-center rounded-control border border-border bg-surface-muted text-primary">
        {icon}
      </div>

      <h3 data-display-title="true" className="mt-4 text-xl font-bold text-foreground">
        {title}
      </h3>

      <p className="mt-2 max-w-lg font-ui text-sm leading-7 text-foreground-muted">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && actionHref ? (
            <ButtonLink href={actionHref}>{actionLabel}</ButtonLink>
          ) : actionLabel ? (
            <Button onClick={onAction}>{actionLabel}</Button>
          ) : null}

          {secondaryActionLabel && secondaryActionHref && (
            <ButtonLink href={secondaryActionHref} variant="secondary">
              {secondaryActionLabel}
            </ButtonLink>
          )}
        </div>
      )}
    </Card>
  );
}
