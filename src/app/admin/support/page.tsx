"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Clock3, LifeBuoy, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";
import { getAdminSupportApi, getSupportAssigneesApi, type SupportMetrics, type SupportTicket } from "@/lib/api-client/support";

const labels: Record<string,string> = { open:"باز", "in-progress":"در حال بررسی", "waiting-customer":"منتظر مشتری", resolved:"حل‌شده", closed:"بسته", low:"کم", normal:"عادی", high:"زیاد", urgent:"فوری" };
const emptyMetrics: SupportMetrics = { open: 0, unassigned: 0, firstResponseOverdue: 0, resolutionOverdue: 0, averageFirstResponseMinutes: null, policy: { firstResponseMinutes: 240, resolutionMinutes: 2880 } };

export default function AdminSupportPage() {
  const [items,setItems] = useState<SupportTicket[]>([]);
  const [metrics,setMetrics] = useState(emptyMetrics);
  const [assignees,setAssignees] = useState<Array<{id:string;name:string|null;phone:string}>>([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [status,setStatus] = useState("");
  const [priority,setPriority] = useState("");
  const [assignee,setAssignee] = useState("");
  const [breach,setBreach] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if(search) query.set("search",search);
      if(status) query.set("status",status);
      if(priority) query.set("priority",priority);
      if(assignee) query.set("assignee",assignee);
      if(breach) query.set("breach",breach);
      const data = await getAdminSupportApi(`?${query}`);
      setItems(data.items);
      setMetrics(data.metrics);
    } catch(error) {
      toast.error(error instanceof Error ? error.message : "دریافت تیکت‌ها ناموفق بود");
    } finally { setLoading(false); }
  }, [assignee, breach, priority, search, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { getSupportAssigneesApi().then(data => setAssignees(data.items)).catch(() => setAssignees([])); }, []);

  const cards = [
    {label:"تیکت‌های باز",value:metrics.open,icon:LifeBuoy},
    {label:"بدون کارشناس",value:metrics.unassigned,icon:UserRoundX},
    {label:"پاسخ اول عقب‌افتاده",value:metrics.firstResponseOverdue,icon:Clock3},
    {label:"حل عقب‌افتاده",value:metrics.resolutionOverdue,icon:Clock3},
    {label:"میانگین پاسخ اول",value:metrics.averageFirstResponseMinutes===null?"—":`${metrics.averageFirstResponseMinutes.toLocaleString("fa-IR")} دقیقه`,icon:Clock3},
  ];

  return <div className="mx-auto w-full max-w-[1480px] space-y-6 px-4 py-8 md:px-6">
    <AdminPageHeader title="پشتیبانی" description={`SLA پایه: پاسخ اول ${metrics.policy.firstResponseMinutes.toLocaleString("fa-IR")} دقیقه، حل ${metrics.policy.resolutionMinutes.toLocaleString("fa-IR")} دقیقه.`}/>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(card=><Card key={card.label} className="p-4"><card.icon size={17} className="text-primary"/><div className="mt-3 text-2xl font-bold">{typeof card.value==="number"?card.value.toLocaleString("fa-IR"):card.value}</div><p className="mt-1 text-xs text-foreground-muted">{card.label}</p></Card>)}</div>
    <Card className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="شماره، موضوع، کسب‌وکار یا موبایل" className="h-11 rounded-control border border-border bg-background px-3"/>
      <select value={status} onChange={event=>setStatus(event.target.value)} className="h-11 rounded-control border border-border bg-background px-3"><option value="">همه وضعیت‌ها</option><option value="open">باز</option><option value="in-progress">در حال بررسی</option><option value="waiting-customer">منتظر مشتری</option><option value="resolved">حل‌شده</option><option value="closed">بسته</option></select>
      <select value={priority} onChange={event=>setPriority(event.target.value)} className="h-11 rounded-control border border-border bg-background px-3"><option value="">همه اولویت‌ها</option><option value="urgent">فوری</option><option value="high">زیاد</option><option value="normal">عادی</option><option value="low">کم</option></select>
      <select value={assignee} onChange={event=>setAssignee(event.target.value)} className="h-11 rounded-control border border-border bg-background px-3"><option value="">همه کارشناسان</option><option value="unassigned">تخصیص‌داده‌نشده</option>{assignees.map(item=><option key={item.id} value={item.id}>{item.name||item.phone}</option>)}</select>
      <select value={breach} onChange={event=>setBreach(event.target.value)} className="h-11 rounded-control border border-border bg-background px-3"><option value="">همه SLAها</option><option value="any">همه عقب‌افتاده‌ها</option><option value="first-response">پاسخ اول عقب‌افتاده</option><option value="resolution">حل عقب‌افتاده</option></select>
    </Card>
    <Card className="overflow-x-auto p-0">{loading?<p className="py-16 text-center">در حال دریافت…</p>:items.length?<table className="w-full text-right text-sm"><thead className="bg-surface-raised text-foreground-muted"><tr><th className="p-4">تیکت</th><th className="p-4">کاربر / کسب‌وکار</th><th className="p-4">وضعیت</th><th className="p-4">کارشناس</th><th className="p-4">SLA</th><th className="p-4">آخرین پیام</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-t border-border"><td className="p-4"><Link href={`/admin/support/${item.id}`} className="font-bold text-primary">{item.subject}</Link><small className="block text-foreground-muted">{item.ticketNumber} · {labels[item.priority]||item.priority}</small></td><td className="p-4">{item.createdBy?.name||item.createdBy?.phone}<small className="block text-foreground-muted">{item.business?.name}</small></td><td className="p-4">{labels[item.status]||item.status}</td><td className="p-4">{item.assignedTo?.name||item.assignedTo?.phone||"—"}</td><td className="p-4">{item.sla.firstResponseBreached||item.sla.resolutionBreached?<span className="text-error">عقب‌افتاده</span>:<span className="text-success">در محدوده</span>}</td><td className="p-4">{new Date(item.lastMessageAt).toLocaleString("fa-IR")}</td></tr>)}</tbody></table>:<div className="py-20 text-center"><LifeBuoy className="mx-auto text-primary"/><p className="mt-3 font-bold">تیکتی پیدا نشد</p></div>}</Card>
  </div>;
}
