"use client";

import {
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { logoutApi } from "@/lib/api-client/auth";
import { useAuthSession } from "@/components/auth/auth-session";
import { hasAdminPermission } from "@/lib/admin-permissions";

export function UserMenu() {
  const router = useRouter();
  const user = useAuthSession();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function outside(event: MouseEvent) {
      if (
        root.current &&
        !root.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }

    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", key);

    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", key);
    };
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await logoutApi();
      toast.success("از حساب خارج شدید");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error("خروج از حساب انجام نشد", {
        description:
          error instanceof Error ? error.message : undefined,
      });
      setLoggingOut(false);
    }
  }

  const displayName = user.name || "کاربر Binix";

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-control px-2 transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="منوی حساب کاربری"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-ui text-xs font-bold text-primary">
          {displayName.trim().slice(0, 1).toUpperCase()}
        </div>

        <div className="hidden min-w-0 text-right md:block">
          <div className="font-ui max-w-36 truncate text-xs font-medium text-foreground">
            {displayName}
          </div>
          <div dir="ltr" className="font-ui truncate text-[10px] text-foreground-subtle">
            {user.phone}
          </div>
        </div>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-12 z-50 w-56 rounded-card border border-border bg-surface p-1.5 shadow-binix-lg"
        >
          <Link
            role="menuitem"
            href="/app"
            onClick={() => setOpen(false)}
            className="font-ui flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            <LayoutDashboard size={16} />
            پنل کاربری
          </Link>

          <Link
            role="menuitem"
            href="/app/settings#account"
            onClick={() => setOpen(false)}
            className="font-ui flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            <User size={16} />
            پروفایل
          </Link>

          <Link
            role="menuitem"
            href="/app/settings"
            onClick={() => setOpen(false)}
            className="font-ui flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-sm text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
          >
            <Settings size={16} />
            تنظیمات حساب
          </Link>

          {hasAdminPermission(user.permissions, "admin.dashboard.read") && (
            <Link
              role="menuitem"
              href="/admin"
              onClick={() => setOpen(false)}
              className="font-ui flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-sm text-primary transition hover:bg-primary/10"
            >
              <ShieldCheck size={16} />
              پنل مدیریت
            </Link>
          )}

          <div className="my-1 border-t border-border-subtle" />

          <button
            role="menuitem"
            type="button"
            disabled={loggingOut}
            onClick={logout}
            className="font-ui flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-right text-sm text-error transition hover:bg-error/10 disabled:opacity-50"
          >
            <LogOut size={16} />
            {loggingOut ? "در حال خروج..." : "خروج"}
          </button>
        </div>
      )}
    </div>
  );
}
