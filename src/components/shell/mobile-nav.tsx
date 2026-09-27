"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigation } from "@/constants/app-navigation";
import { iconRegistry } from "@/constants/icon-registry";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className="fixed inset-x-3 bottom-3 z-40 rounded-panel border border-border bg-surface/96 p-1.5 shadow-binix-lg backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-6 gap-0.5">
        {mobileNavigation.map(({ href, label, icon }) => {
          const Icon = iconRegistry[icon];
          const active =
            pathname === href ||
            (href !== "/app" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "font-ui relative flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-control px-1 text-[10px] transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" />
              )}
              <Icon size={18} aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
