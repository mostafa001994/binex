import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ai";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface BinixButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-binix-sm",
  secondary:
    "bg-surface-muted text-foreground border border-border hover:bg-surface-hover",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-hover",
  danger:
    "bg-error text-white hover:opacity-90",
  ai:
    "text-white bg-gradient-to-l from-primary via-[#078BFF] to-accent shadow-glow-sm hover:shadow-glow-md",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  xl: "h-12 px-5 text-base",
};

export function BinixButton({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  children,
  ...props
}: BinixButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "font-ui inline-flex items-center justify-center gap-2 rounded-control",
        "transition duration-200 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/30",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {loading ? (
        <span aria-hidden="true">...</span>
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}
