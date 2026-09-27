"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { iconRegistry, type IconKey } from "@/constants/icon-registry";
import { cn } from "@/lib/cn";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: IconKey;
  collapsed?: boolean;
}

export function SidebarItem({ href, label, icon, collapsed = false }: SidebarItemProps) {
  const pathname = usePathname();
  const Icon = iconRegistry[icon];
  const active = pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));

  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn(
      "font-ui group flex min-h-11 items-center gap-3 rounded-control px-3 text-sm transition duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
      active ? "border border-primary/15 bg-primary/10 text-primary" : "border border-transparent text-foreground-muted hover:bg-surface-hover hover:text-foreground",
      collapsed && "justify-center px-0",
    )} title={collapsed ? label : undefined}>
      <Icon size={19} className={cn("shrink-0 transition", active ? "text-primary" : "text-foreground-subtle group-hover:text-foreground")} aria-hidden="true" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
