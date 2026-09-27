"use client";

import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  getNotificationsApi,
  markNotificationApi,
  type AppNotification,
} from "@/lib/api-client/support";

export function NotificationButton({
  viewAllHref = "/app/notifications",
}: {
  viewAllHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  async function load() {
    try {
      const data = await getNotificationsApi();
      setItems(data.items.slice(0, 5));
      setUnread(data.unreadCount);
    } catch {
      setItems([]);
      setUnread(0);
    }
  }

  useEffect(() => {
    void load();
    function outside(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
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

  async function visit(item: AppNotification) {
    if (!item.readAt) await markNotificationApi(item.id);
    setOpen(false);
    void load();
  }

  return (
    <div ref={root} className="relative">
      <button ref={trigger} type="button" onClick={() => { setOpen((value) => !value); void load(); }} className="relative flex size-10 items-center justify-center rounded-control text-foreground-muted transition hover:bg-surface-hover hover:text-foreground" aria-label={`اعلان‌ها${unread ? `، ${unread} خوانده‌نشده` : ""}`} aria-expanded={open}>
        {unread > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-error px-1 text-center text-[9px] text-white">{unread > 9 ? "۹+" : unread.toLocaleString("fa-IR")}</span>}
        <Bell size={19} />
      </button>
      {open && <div className="absolute left-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-border bg-surface p-3 shadow-binix-lg">
        <div className="flex items-center justify-between gap-3 px-2 py-1"><h3 className="text-base font-bold">اعلان‌ها</h3><Link href={viewAllHref} onClick={() => setOpen(false)} className="flex items-center gap-1 text-xs text-primary">مشاهده همه <ArrowLeft size={13} /></Link></div>
        <div className="mt-2 space-y-2">{items.length ? items.map((item) => <Link key={item.id} href={item.href || viewAllHref} onClick={() => void visit(item)} className={`block rounded-control border p-3 ${item.readAt ? "border-border" : "border-primary/30 bg-primary/5"}`}><strong className="text-sm">{item.title}</strong><p className="mt-1 line-clamp-2 text-xs text-foreground-muted">{item.message}</p></Link>) : <p className="rounded-control border border-dashed border-border p-6 text-center text-sm text-foreground-muted">اعلان جدیدی ندارید.</p>}</div>
      </div>}
    </div>
  );
}
