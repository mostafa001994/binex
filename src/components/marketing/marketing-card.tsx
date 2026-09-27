import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const marketingCardVariants = cva("rounded-card border transition duration-200", {
  variants: {
    variant: {
      default: "border-marketing-border bg-marketing-surface/88",
      muted: "border-marketing-border bg-white/[0.025]",
      interactive:
        "border-marketing-border bg-marketing-surface/88 hover:-translate-y-px hover:border-marketing-border-strong",
      service:
        "border-service-accent/20 bg-marketing-surface/90 shadow-[var(--service-accent-glow)]",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

type Props = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof marketingCardVariants>;

export function MarketingCard({
  className,
  variant,
  padding,
  ...props
}: Props) {
  return (
    <div
      {...props}
      className={cn(marketingCardVariants({ variant, padding }), className)}
    />
  );
}
