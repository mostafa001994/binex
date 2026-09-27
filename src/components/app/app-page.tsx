import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const widths = {
  compact: "max-w-[1100px]",
  default: "max-w-[1400px]",
  wide: "max-w-[1600px]",
};

export function AppPage({
  children,
  width = "default",
  className,
}: {
  children: ReactNode;
  width?: keyof typeof widths;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full space-y-7 md:space-y-8", widths[width], className)}>
      {children}
    </div>
  );
}
