"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LifeBuoy, MessageSquarePlus, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTicketApi, getMyTicketApi, getMyTicketsApi, replyTicketApi, type SupportTicket } from "@/lib/api-client/support";
import { formatTehranPersianDateTime } from "@/lib/persian-date";

const labels: Record<string, string> = {
  open: "باز",
  "in-progress": "در حال بررسی",
  "waiting-customer": "منتظر پاسخ شما",
  resolved: "حل‌شده",
  closed: "بسته",
};

const categoryOptions = [
  { value: "technical", label: "فنی" },
  { value: "billing", label: "مالی" },
  { value: "subscription", label: "اشتراک" },
  { value: "service", label: "سرویس" },
  { value: "other", label: "سایر" },
];

export function SupportCenter() {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState("");
  const handledDeepLink = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTicketsApi();
      setItems(data.items);
      if (!handledDeepLink.current) {
        handledDeepLink.current = true;
        const requested = new URLSearchParams(window.location.search).get("ticket");
        if (requested) setSelected((await getMyTicketApi(requested)).ticket);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "دریافت تیکت‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function refreshList() {
    const data = await getMyTicketsApi();
    setItems(data.items);
  }

  async function openTicket(ticket: SupportTicket) {
    setBusy(ticket.id);
    try {
      setCreating(false);
      setSelected((await getMyTicketApi(ticket.id)).ticket);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "تیکت قابل دریافت نیست.");
    } finally {
      setBusy("");
    }
  }

  async function create() {
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();
    if (cleanSubject.length < 3) return toast.error("موضوع درخواست را کامل‌تر وارد کنید");
    if (cleanMessage.length < 10) return toast.error("شرح درخواست باید حداقل ۱۰ کاراکتر باشد");

    setBusy("create");
    try {
      const result = await createTicketApi({ subject: cleanSubject, category, message: cleanMessage });
      setSelected(result.ticket);
      setSubject("");
      setMessage("");
      setCreating(false);
      await refreshList();
      toast.success("تیکت ثبت شد");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "ثبت تیکت ناموفق بود.");
    } finally {
      setBusy("");
    }
  }

  async function send() {
    const cleanReply = reply.trim();
    if (!selected || !cleanReply) return toast.error("متن پاسخ را وارد کنید");
    setBusy("reply");
    try {
      setSelected((await replyTicketApi(selected.id, cleanReply)).ticket);
      setReply("");
      await refreshList();
      toast.success("پاسخ ارسال شد");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "ارسال پاسخ ناموفق بود.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.62fr)]">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 data-display-title="true" className="text-lg font-bold">تیکت‌های من</h2>
            <p className="mt-1 font-ui text-xs text-foreground-muted">پیگیری درخواست‌ها با تاریخچه واقعی</p>
          </div>
          <Button leadingIcon={<MessageSquarePlus size={16} />} onClick={() => { setCreating(true); setSelected(null); }}>تیکت جدید</Button>
        </div>

        {loading ? <TicketListSkeleton /> : error ? (
          <div className="py-12 text-center">
            <LifeBuoy className="mx-auto text-error" />
            <p className="mt-3 font-ui text-sm text-foreground-muted">{error}</p>
            <Button className="mt-4" variant="secondary" leadingIcon={<RefreshCw size={15} />} onClick={load}>تلاش دوباره</Button>
          </div>
        ) : items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected?.id === item.id}
                disabled={busy === item.id}
                onClick={() => void openTicket(item)}
                className="flex w-full items-center justify-between gap-3 rounded-control border border-border bg-surface-raised p-4 text-right transition hover:border-primary/50 disabled:opacity-60"
              >
                <span className="min-w-0"><strong className="block truncate font-ui">{item.subject}</strong><small className="mt-1 block font-ui text-foreground-muted">{item.ticketNumber}</small></span>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 font-ui text-xs text-primary">{labels[item.status] ?? item.status}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center"><LifeBuoy className="mx-auto text-primary" /><p className="mt-3 font-ui font-bold">هنوز تیکتی ندارید</p><p className="mt-2 font-ui text-xs text-foreground-muted">اگر درباره سرویس، پرداخت یا حساب سؤال دارید، یک درخواست ثبت کنید.</p></div>
        )}
      </Card>

      <Card className="space-y-4">
        {creating ? (
          <>
            <h2 data-display-title="true" className="text-lg font-bold">ثبت درخواست جدید</h2>
            <FormField id="ticket-subject" label="موضوع"><Input id="ticket-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} /></FormField>
            <FormField id="ticket-category" label="دسته‌بندی"><Select id="ticket-category" value={category} onValueChange={setCategory} options={categoryOptions} /></FormField>
            <FormField id="ticket-message" label="شرح درخواست" hint="حداقل ۱۰ کاراکتر"><Textarea id="ticket-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} maxLength={4000} /></FormField>
            <div className="flex flex-wrap gap-2"><Button loading={busy === "create"} onClick={create}>ثبت تیکت</Button><Button variant="secondary" disabled={busy === "create"} onClick={() => setCreating(false)}>انصراف</Button></div>
          </>
        ) : selected ? (
          <>
            <div><h2 data-display-title="true" className="text-lg font-bold">{selected.subject}</h2><p className="mt-1 font-ui text-xs text-foreground-muted">{selected.ticketNumber} · {labels[selected.status] ?? selected.status}</p></div>
            <div className="max-h-[420px] space-y-3 overflow-y-auto" aria-label="پیام‌های تیکت">
              {selected.messages?.map((item) => (
                <div key={item.id} className="rounded-control border border-border bg-surface-raised p-3">
                  <div className="font-ui text-xs text-foreground-muted">{item.author.name || item.author.phone} · {formatTehranPersianDateTime(item.createdAt)}</div>
                  <p className="mt-2 whitespace-pre-wrap font-ui text-sm leading-7">{item.body}</p>
                </div>
              ))}
            </div>
            {selected.status !== "closed" && (
              <div className="space-y-2"><Textarea aria-label="پاسخ به تیکت" value={reply} onChange={(event) => setReply(event.target.value)} rows={3} maxLength={4000} placeholder="پاسخ خود را بنویسید…" /><Button loading={busy === "reply"} leadingIcon={<Send size={15} />} onClick={send}>ارسال پاسخ</Button></div>
            )}
          </>
        ) : (
          <div className="py-16 text-center font-ui text-sm text-foreground-muted">یک تیکت را انتخاب کنید یا درخواست جدید بسازید.</div>
        )}
      </Card>
    </div>
  );
}

function TicketListSkeleton() {
  return <div className="space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-control bg-surface-raised" />)}</div>;
}
