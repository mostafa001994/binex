"use client";

import { use, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminTicketApi,
  getSupportAssigneesApi,
  updateAdminTicketApi,
  type SupportTicket,
} from "@/lib/api-client/support";

export default function AdminTicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = use(params);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string | null; phone: string }>>([]);
  const [message, setMessage] = useState("");
  const [internal, setInternal] = useState(false);

  async function load() {
    try {
      const [data, people] = await Promise.all([getAdminTicketApi(ticketId), getSupportAssigneesApi()]);
      setTicket(data.ticket);
      setAssignees(people.items);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "دریافت تیکت ناموفق بود");
    }
  }

  useEffect(() => {
    void load();
    // The route id is the only input that should reload this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function update(data: object) {
    try {
      setTicket((await updateAdminTicketApi(ticketId, { operation: "update", ...data })).ticket);
      toast.success("تیکت به‌روزرسانی شد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "به‌روزرسانی ناموفق بود");
    }
  }

  async function reply() {
    try {
      setTicket((await updateAdminTicketApi(ticketId, { operation: "reply", message, isInternal: internal })).ticket);
      setMessage("");
      toast.success(internal ? "یادداشت داخلی ثبت شد" : "پاسخ ارسال شد");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ارسال ناموفق بود");
    }
  }

  if (!ticket) return <div className="p-10 text-center">در حال دریافت…</div>;

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 px-4 py-8 md:px-6">
      <AdminPageHeader title={ticket.subject} description={`${ticket.ticketNumber} · ${ticket.business?.name || ""}`} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card data-admin-form-root className="space-y-4">
          <div className="max-h-[520px] space-y-3 overflow-y-auto">
            {ticket.messages?.map((item) => (
              <div key={item.id} className={`rounded-control border p-4 ${item.isInternal ? "border-warning/40 bg-warning/5" : "border-border bg-surface-raised"}`}>
                <div className="text-xs text-foreground-muted">
                  {item.isInternal ? "یادداشت داخلی · " : ""}{item.author.name || item.author.phone} · {new Date(item.createdAt).toLocaleString("fa-IR")}
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-7">{item.body}</p>
              </div>
            ))}
          </div>
          <textarea
            required
            data-field-label="متن پاسخ"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="پاسخ یا یادداشت را بنویسید…"
            className="min-h-28 w-full rounded-control border border-border bg-background p-3"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
              یادداشت داخلی؛ برای کاربر نمایش داده نشود
            </label>
            <Button onClick={reply}><Send size={15} /> ارسال</Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <label className="block text-sm">
            وضعیت
            <select value={ticket.status} onChange={(event) => void update({ status: event.target.value })} className="mt-2 h-11 w-full rounded-control border border-border bg-background px-3">
              <option value="open">باز</option><option value="in-progress">در حال بررسی</option><option value="waiting-customer">منتظر مشتری</option><option value="resolved">حل‌شده</option><option value="closed">بسته</option>
            </select>
          </label>
          <label className="block text-sm">
            اولویت
            <select value={ticket.priority} onChange={(event) => void update({ priority: event.target.value })} className="mt-2 h-11 w-full rounded-control border border-border bg-background px-3">
              <option value="low">کم</option><option value="normal">عادی</option><option value="high">زیاد</option><option value="urgent">فوری</option>
            </select>
          </label>
          <label className="block text-sm">
            کارشناس
            <select value={ticket.assignedTo?.id || ""} onChange={(event) => void update({ assignedToUserId: event.target.value || null })} className="mt-2 h-11 w-full rounded-control border border-border bg-background px-3">
              <option value="">تخصیص داده نشده</option>
              {assignees.map((item) => <option key={item.id} value={item.id}>{item.name || item.phone}</option>)}
            </select>
          </label>
          <div className="rounded-control bg-surface-raised p-3 text-sm">
            درخواست‌دهنده: {ticket.createdBy?.name || ticket.createdBy?.phone}<br />کسب‌وکار: {ticket.business?.name}
          </div>
        </Card>
      </div>
    </div>
  );
}
