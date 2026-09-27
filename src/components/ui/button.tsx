import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "font-ui inline-flex items-center justify-center gap-2 rounded-control",
    "transition-[background-color,box-shadow,opacity,transform] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-white shadow-binix-sm hover:bg-primary-hover",
        secondary:
          "border border-border bg-surface-muted text-foreground hover:bg-surface-hover",
        ghost: "bg-transparent text-foreground hover:bg-surface-hover",
        danger: "bg-error text-white hover:opacity-90",
        ai: "bg-[linear-gradient(135deg,var(--primary)_0%,var(--accent)_100%)] text-white shadow-glow-sm hover:shadow-glow-md",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        xl: "h-12 px-5 text-base",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  loading?: boolean;
  leadingIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  loading = false,
  leadingIcon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leadingIcon
      )}
      {size !== "icon" && <span>{children}</span>}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  leadingIcon,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
  leadingIcon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {leadingIcon}
      {size !== "icon" && <span>{children}</span>}
    </Link>
  );
}
