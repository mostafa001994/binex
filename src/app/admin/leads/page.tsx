"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Phone, Search, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminSession } from "@/components/admin/admin-gate";
import { Card } from "@/components/ui/card";
import { Modal, ModalSection } from "@/components/ui/modal";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {
  getAdminConsultationLeadsApi,
  updateAdminConsultationLeadApi,
  type ConsultationLead,
  type ConsultationLeadMetrics,
  type ConsultationLeadPagination,
} from "@/lib/api-client/leads";

const statusLabels: Record<ConsultationLead["status"], string> = {
  new: "جدید",
  contacted: "تماس گرفته‌شده",
  qualified: "واجد شرایط",
  closed: "بسته‌شده",
};

const statusClasses: Record<ConsultationLead["status"], string> = {
  new: "border-primary/25 bg-primary/10 text-primary",
  contacted: "border-warning/25 bg-warning/10 text-warning",
  qualified: "border-success/25 bg-success/10 text-success",
  closed: "border-border bg-surface-raised text-foreground-muted",
};

const sourceLabels: Record<string, string> = {
  "homepage-assistant": "دستیار صفحه اصلی",
  "homepage-consultation": "فرم مشاوره صفحه اصلی",
  "ai-sales-agent-demo": "دموی فروشنده هوشمند",
  "smart-booking-consultation": "درخواست نوبت‌دهی هوشمند",
  "bi-sales-consultation": "درخواست BI فروش",
  "excel-analysis-pilot": "تحلیل آزمایشی اکسل",
  homepage: "صفحه اصلی",
};

const emptyMetrics: ConsultationLeadMetrics = { total: 0, new: 0, contacted: 0, qualified: 0, closed: 0 };
const emptyPagination: ConsultationLeadPagination = { page: 1, pageSize: 30, total: 0, totalPages: 1 };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function display(value: string | null) {
  return value?.trim() || "—";
}

export default function AdminConsultationLeadsPage() {
  const { user } = useAdminSession();
  const canManage = hasAdminPermission(user.permissions, "admin.leads.manage");
  const [items, setItems] = useState<ConsultationLead[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ConsultationLead | null>(null);
  const [editStatus, setEditStatus] = useState<ConsultationLead["status"]>("new");
  const [internalNote, setInternalNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [focusId, setFocusId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminConsultationLeadsApi({ search, status, source, page });
      setItems(data.items);
      setSources(data.sources);
      setMetrics(data.metrics);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "دریافت درخواست‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [page, search, source, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setFocusId(new URLSearchParams(window.location.search).get("focus") ?? ""); }, []);
  useEffect(() => {
    if (!focusId || selected) return;
    const focused = items.find((item) => item.id === focusId);
    if (focused) setSelected(focused);
  }, [focusId, items, selected]);
  useEffect(() => {
    if (!selected) return;
    setEditStatus(selected.status);
    setInternalNote(selected.internalNote ?? "");
  }, [selected]);

  async function save() {
    if (!selected || !canManage) return;
    setSaving(true);
    try {
      const data = await updateAdminConsultationLeadApi(selected.id, { status: editStatus, internalNote });
      setSelected(data.lead);
      setItems((current) => current.map((item) => item.id === data.lead.id ? data.lead : item));
      toast.success("وضعیت پیگیری ذخیره شد.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ذخیره تغییرات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setSource("");
    setPage(1);
  }

  const cards = [
    { label: "همه درخواست‌ها", value: metrics.total, icon: UserRoundSearch },
    { label: "جدید و بررسی‌نشده", value: metrics.new, icon: Clock3 },
    { label: "تماس گرفته‌شده", value: metrics.contacted, icon: Phone },
    { label: "واجد شرایط همکاری", value: metrics.qualified, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 px-0 py-3 sm:py-4">
      <AdminPageHeader
        title="درخواست‌های مشاوره"
        description="سرنخ‌های ثبت‌شده از صفحه اصلی را ببینید، پیگیری کنید و نتیجه تماس را ثبت کنید."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-4">
            <card.icon size={18} className="text-primary" aria-hidden="true" />
            <div className="mt-3 text-2xl font-bold">{card.value.toLocaleString("fa-IR")}</div>
            <p className="mt-1 font-ui text-xs text-foreground-muted">{card.label}</p>
          </Card>
        ))}
      </div>

      <Card className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(190px,.6fr)_minmax(210px,.7fr)_auto]">
        <label className="relative block">
          <span className="sr-only">جستجو در درخواست‌ها</span>
          <Search className="pointer-events-none absolute right-3 top-3.5 text-foreground-subtle" size={16} aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="نام، موبایل، کسب‌وکار یا نیاز"
            className="h-11 w-full rounded-control border border-border bg-background pr-10 pl-3 font-ui text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
        </label>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 rounded-control border border-border bg-background px-3 font-ui text-sm">
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} className="h-11 rounded-control border border-border bg-background px-3 font-ui text-sm">
          <option value="">همه منابع ثبت</option>
          {sources.map((value) => <option key={value} value={value}>{sourceLabels[value] ?? value}</option>)}
        </select>
        <button type="button" onClick={resetFilters} className="h-11 rounded-control border border-border px-4 font-ui text-sm text-foreground-muted transition hover:bg-surface-hover hover:text-foreground">پاک کردن فیلترها</button>
      </Card>

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="py-20 text-center font-ui text-sm text-foreground-muted">در حال دریافت درخواست‌ها…</div>
        ) : items.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-right font-ui text-sm">
                <thead className="bg-surface-raised text-xs text-foreground-muted"><tr><th className="p-4">مخاطب</th><th className="p-4">نیاز</th><th className="p-4">منبع</th><th className="p-4">وضعیت</th><th className="p-4">زمان ثبت</th><th className="p-4"><span className="sr-only">عملیات</span></th></tr></thead>
                <tbody>{items.map((item) => (
                  <tr key={item.id} className="border-t border-border-subtle transition hover:bg-surface-hover/50">
                    <td className="p-4"><div className="font-semibold text-foreground">{display(item.name)}</div><div dir="ltr" className="mt-1 w-fit text-xs text-foreground-muted">{item.phone}</div><div className="mt-1 text-xs text-foreground-subtle">{display(item.businessName)}</div></td>
                    <td className="p-4"><div>{item.need}</div><div className="mt-1 max-w-[260px] truncate text-xs text-foreground-muted">{display(item.businessType)}</div></td>
                    <td className="p-4 text-foreground-muted">{sourceLabels[item.source] ?? item.source}</td>
                    <td className="p-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span></td>
                    <td className="p-4 whitespace-nowrap text-foreground-muted">{formatDate(item.createdAt)}</td>
                    <td className="p-4"><button type="button" onClick={() => setSelected(item)} className="rounded-control border border-border px-3 py-2 text-primary transition hover:bg-primary/10">مشاهده و پیگیری</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div className="divide-y divide-border-subtle md:hidden">
              {items.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelected(item)} className="block w-full p-4 text-right transition hover:bg-surface-hover">
                  <div className="flex items-start justify-between gap-3"><div><div className="font-ui text-sm font-bold">{display(item.name)}</div><div dir="ltr" className="mt-1 w-fit text-xs text-foreground-muted">{item.phone}</div></div><span className={`shrink-0 rounded-full border px-2.5 py-1 font-ui text-[11px] ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span></div>
                  <p className="mt-3 font-ui text-sm">{item.need}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted"><span>{sourceLabels[item.source] ?? item.source}</span><span>{formatDate(item.createdAt)}</span></div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center"><UserRoundSearch className="mx-auto text-primary" aria-hidden="true" /><p className="mt-3 font-ui font-bold">درخواستی پیدا نشد</p><p className="mt-1 font-ui text-sm text-foreground-muted">درخواست‌های فرم صفحه اصلی اینجا نمایش داده می‌شوند.</p></div>
        )}
      </Card>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 font-ui text-sm text-foreground-muted">
          <span>صفحه {pagination.page.toLocaleString("fa-IR")} از {pagination.totalPages.toLocaleString("fa-IR")}</span>
          <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-control border border-border px-4 py-2 disabled:opacity-40">قبلی</button><button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-control border border-border px-4 py-2 disabled:opacity-40">بعدی</button></div>
        </div>
      ) : null}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="جزئیات درخواست مشاوره"
        description={selected ? `${statusLabels[selected.status]} · ثبت‌شده در ${formatDate(selected.createdAt)}` : undefined}
        size="lg"
        footer={selected && canManage ? <><button type="button" onClick={() => setSelected(null)} className="h-10 rounded-control border border-border px-5 font-ui text-sm">انصراف</button><button type="button" disabled={saving} onClick={() => void save()} className="h-10 rounded-control bg-primary px-5 font-ui text-sm font-bold text-white disabled:opacity-50">{saving ? "در حال ذخیره…" : "ذخیره پیگیری"}</button></> : undefined}
      >
        {selected ? <div className="space-y-4">
          <ModalSection title="اطلاعات مخاطب">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="نام" value={display(selected.name)} />
              <Detail label="شماره موبایل" value={selected.phone} ltr />
              <Detail label="نام کسب‌وکار" value={display(selected.businessName)} />
              <Detail label="نوع کسب‌وکار" value={display(selected.businessType)} />
            </dl>
          </ModalSection>
          <ModalSection title="نیاز و ترجیح تماس">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="نیاز اصلی" value={selected.need} />
              <Detail label="کانال ترجیحی" value={display(selected.channel)} />
              <Detail label="منبع ثبت" value={sourceLabels[selected.source] ?? selected.source} />
              <Detail label="زمان رضایت برای تماس" value={formatDate(selected.consentAt)} />
            </dl>
            {selected.note ? <div className="mt-4 rounded-control border border-border-subtle bg-background p-3"><div className="font-ui text-xs text-foreground-subtle">توضیحات کاربر</div><p className="mt-2 whitespace-pre-wrap font-ui text-sm leading-7">{selected.note}</p></div> : null}
          </ModalSection>
          <ModalSection title="پیگیری داخلی" description={canManage ? "نتیجه تماس و اقدام بعدی فقط برای تیم مدیریت قابل مشاهده است." : "برای ویرایش این بخش دسترسی مدیریت درخواست لازم است."}>
            <label className="block"><span className="mb-2 block font-ui text-xs text-foreground-muted">وضعیت</span><select disabled={!canManage} value={editStatus} onChange={(event) => setEditStatus(event.target.value as ConsultationLead["status"])} className="h-11 w-full rounded-control border border-border bg-background px-3 font-ui text-sm disabled:opacity-60">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="mt-4 block"><span className="mb-2 block font-ui text-xs text-foreground-muted">یادداشت داخلی</span><textarea disabled={!canManage} value={internalNote} maxLength={2000} onChange={(event) => setInternalNote(event.target.value)} rows={5} placeholder="خلاصه تماس، نیاز دقیق و اقدام بعدی…" className="w-full resize-y rounded-control border border-border bg-background p-3 font-ui text-sm leading-7 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-60" /><span className="mt-1 block text-left font-ui text-[11px] text-foreground-subtle">{internalNote.length.toLocaleString("fa-IR")} / ۲۰۰۰</span></label>
          </ModalSection>
        </div> : null}
      </Modal>
    </div>
  );
}

function Detail({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return <div><dt className="font-ui text-xs text-foreground-subtle">{label}</dt><dd dir={ltr ? "ltr" : undefined} className={`mt-1 font-ui text-sm font-semibold text-foreground ${ltr ? "w-fit" : ""}`}>{value}</dd></div>;
}
