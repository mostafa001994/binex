"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/app/app-page";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getNotificationsApi, markAllNotificationsApi, markNotificationApi, type AppNotification } from "@/lib/api-client/support";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotificationsApi();
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "دریافت اعلان‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function markOne(item: AppNotification) {
    if (item.readAt) return;
    const readAt = new Date().toISOString();
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt } : entry));
    setUnread((current) => Math.max(0, current - 1));
    try {
      await markNotificationApi(item.id);
    } catch (reason) {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: null } : entry));
      setUnread((current) => current + 1);
      toast.error(reason instanceof Error ? reason.message : "خواندن اعلان ثبت نشد.");
    }
  }

  async function markAll() {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsApi();
      const readAt = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
      setUnread(0);
      toast.success("همه اعلان‌ها خوانده شدند");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "ثبت وضعیت اعلان‌ها ناموفق بود.");
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <AppPage>
      <PageHeader title="اعلان‌ها" description="رویدادهای واقعی حساب، سرویس‌ها و پاسخ‌های پشتیبانی." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant={unread > 0 ? "info" : "default"}>{unread.toLocaleString("fa-IR")} خوانده‌نشده</Badge>
        {unread > 0 && <Button variant="secondary" loading={markingAll} leadingIcon={<CheckCheck size={16} />} onClick={markAll}>خواندن همه</Button>}
      </div>

      {loading ? <NotificationsSkeleton /> : error ? (
        <Card className="text-center">
          <Bell className="mx-auto text-error" />
          <h2 data-display-title="true" className="mt-4 text-lg font-bold">اعلان‌ها دریافت نشدند</h2>
          <p className="mt-2 font-ui text-sm text-foreground-muted">{error}</p>
          <Button className="mt-5" variant="secondary" leadingIcon={<RefreshCw size={15} />} onClick={load}>تلاش دوباره</Button>
        </Card>
      ) : items.length ? (
        <Card className="space-y-3" aria-live="polite">
          {items.map((item) => <NotificationRow key={item.id} item={item} onRead={markOne} />)}
        </Card>
      ) : (
        <Card className="py-16 text-center">
          <Bell className="mx-auto text-primary" />
          <h2 data-display-title="true" className="mt-3 text-lg font-bold">اعلان جدیدی ندارید</h2>
          <p className="mt-2 font-ui text-sm text-foreground-muted">رویدادهای مهم حساب و پاسخ‌های پشتیبانی در این بخش نمایش داده می‌شوند.</p>
        </Card>
      )}
    </AppPage>
  );
}

function NotificationRow({ item, onRead }: { item: AppNotification; onRead: (item: AppNotification) => Promise<void> }) {
  const className = `block w-full rounded-control border p-4 text-right transition hover:border-border-strong ${item.readAt ? "border-border bg-surface-raised/40" : "border-primary/35 bg-primary/5"}`;
  const content = (
    <>
      <div className="flex flex-wrap justify-between gap-3">
        <span className="font-ui font-bold text-foreground">{item.title}</span>
        <time className="font-ui text-xs text-foreground-muted" dateTime={item.createdAt}>{formatTehranPersianDateTime(item.createdAt)}</time>
      </div>
      <p className="mt-2 font-ui text-sm leading-7 text-foreground-muted">{item.message}</p>
    </>
  );

  return item.href ? (
    <Link href={item.href} onClick={() => void onRead(item)} className={className}>{content}</Link>
  ) : (
    <button type="button" onClick={() => void onRead(item)} className={className}>{content}</button>
  );
}

function NotificationsSkeleton() {
  return (
    <Card className="space-y-3">
      {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-control bg-surface-raised" />)}
    </Card>
  );
}
