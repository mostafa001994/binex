import type { ReactNode } from "react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { cn } from "@/lib/cn";

export function MarketingPageShell({
  children,
  className,
  withNavbar = true,
  withFooter = true,
}: {
  children: ReactNode;
  className?: string;
  withNavbar?: boolean;
  withFooter?: boolean;
}) {
  return (
    <main
      dir="rtl"
      className={cn(
        "marketing-dark min-h-screen overflow-hidden text-marketing-text",
        className,
      )}
    >
      {withNavbar && <Navbar />}
      {children}
      {withFooter && <Footer />}
    </main>
  );
}
