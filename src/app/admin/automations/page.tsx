"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Link2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { useAdminSession } from "@/components/admin/admin-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { clearAdminAutomationConnectorApi, getAdminAutomationConnectorsApi, updateAdminAutomationConnectorApi, type AdminAutomationConnector } from "@/lib/api-client/admin";

const statusLabels = { draft: "پیش‌نویس", active: "فعال", disabled: "غیرفعال" } as const;

export default function AdminAutomationsPage() {
  const { user } = useAdminSession();
  const canManage = hasAdminPermission(user.permissions, "admin.provisioning.manage");
  const [items, setItems] = useState<AdminAutomationConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminAutomationConnector | null>(null);
  const [saving, setSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [draft, setDraft] = useState({ status: "draft" as "draft" | "active" | "disabled", endpoint: "", authSecret: "", timeoutSeconds: 30 });

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setItems((await getAdminAutomationConnectorsApi()).items); }
    catch (reason) { toast.error("اتصال‌های اتوماسیون دریافت نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  function edit(item: AdminAutomationConnector) {
    setSelected(item);
    setDraft({ status: item.connector?.status ?? "draft", endpoint: "", authSecret: "", timeoutSeconds: item.connector?.timeoutSeconds ?? 30 });
  }
  async function save() {
    if (!selected) return;
    setSaving(true);
    try { await updateAdminAutomationConnectorApi(selected.service.id, draft); toast.success("پیکربندی اتصال ذخیره شد"); setSelected(null); await refresh(); }
    catch (reason) { toast.error("ذخیره اتصال انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setSaving(false); }
  }
  async function clear() {
    if (!selected) return;
    setSaving(true);
    try { await clearAdminAutomationConnectorApi(selected.service.id); toast.success("اطلاعات اتصال پاک شد"); setSelected(null); await refresh(); }
    catch (reason) { toast.error("پاک‌کردن اتصال انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setSaving(false); }
  }

  const configured = items.filter((item) => item.connector?.endpointConfigured).length;
  const active = items.filter((item) => item.connector?.status === "active" && item.connector.endpointConfigured).length;
  const blockedJobs = items.reduce((sum, item) => sum + (!item.connector?.endpointConfigured || item.connector.status !== "active" ? item.queue.pending + item.queue.failed : 0), 0);

  return <div className="space-y-5">
    <AdminPageHeader title="مرکز اتصال‌های اتوماسیون" description="آمادگی اتصال هر سرویس به n8n و صف عملیات را مدیریت کنید. نشانی اتصال و کلید احراز هویت رمزنگاری می‌شوند و دوباره نمایش داده نمی‌شوند." />
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="نشانی ثبت‌شده" value={configured}/><Metric label="اتصال فعال" value={active} tone="success"/><Metric label="کار مسدود یا ناموفق" value={blockedJobs} tone={blockedJobs ? "warning" : "default"}/></div>
    {loading ? <div className="grid gap-4 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-card bg-surface-raised"/>)}</div> : items.length ? <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => {
      const ready = item.connector?.status === "active" && item.connector.endpointConfigured;
      return <Card key={item.service.id} className="space-y-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{item.service.name}</h2><p className="mt-1 font-ui text-xs text-foreground-muted">{item.service.id}</p></div><Badge variant={ready ? "success" : item.connector?.status === "disabled" ? "error" : "warning"}>{item.connector ? statusLabels[item.connector.status] : "پیکربندی‌نشده"}</Badge></div>
        <div className={`flex items-center gap-2 rounded-control border p-3 font-ui text-xs ${ready ? "border-success/20 bg-success/5 text-success" : "border-warning/20 bg-warning/5 text-warning"}`}>{ready ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>} {ready ? "اتصال برای مصرف‌کننده صف آماده است" : "تا تکمیل اتصال، اجرای واقعی نباید آغاز شود"}</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Fact label="نشانی اتصال" value={item.connector?.endpointConfigured ? "ثبت شده" : "ثبت نشده"}/><Fact label="احراز هویت" value={item.connector?.authSecretConfigured ? "ثبت شده" : "اختیاری/ثبت نشده"}/><Fact label="در صف" value={item.queue.pending.toLocaleString("fa-IR")}/><Fact label="ناموفق" value={item.queue.failed.toLocaleString("fa-IR")}/></div>
        {canManage ? <Button variant="secondary" leadingIcon={<Settings2 size={15}/>} onClick={() => edit(item)}>تنظیم اتصال</Button> : null}
      </Card>;
    })}</div> : <div className="rounded-card border border-border bg-surface"><AdminEmptyState title="سرویسی برای اتصال وجود ندارد" description="ابتدا سرویس را در کاتالوگ ایجاد کنید."/></div>}

    <Modal open={Boolean(selected) && !clearOpen} onClose={() => !saving && setSelected(null)} title={selected ? `اتصال n8n برای ${selected.service.name}` : "تنظیم اتصال"} description="در این مرحله فقط اطلاعات امن ذخیره می‌شود و هیچ درخواست آزمایشی یا واقعی به n8n ارسال نخواهد شد." footer={<div className="flex flex-wrap gap-2"><Button loading={saving} onClick={() => void save()}>ذخیره</Button><Button variant="secondary" disabled={saving} onClick={() => setSelected(null)}>انصراف</Button>{selected?.connector?.endpointConfigured ? <Button variant="danger" disabled={saving} onClick={() => setClearOpen(true)}>پاک‌کردن اتصال</Button> : null}</div>}>
      <div className="grid gap-4 font-ui sm:grid-cols-2">
        <label className="text-xs">وضعیت<select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as typeof draft.status }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="draft">پیش‌نویس</option><option value="active">فعال</option><option value="disabled">غیرفعال</option></select></label>
        <label className="text-xs">مهلت پاسخ (ثانیه)<input type="number" min={5} max={120} value={draft.timeoutSeconds} onChange={(event) => setDraft((current) => ({ ...current, timeoutSeconds: Number(event.target.value) }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label>
        <label className="text-xs sm:col-span-2">نشانی Webhook جدید<input required={draft.status === "active" && !selected?.connector?.endpointConfigured} data-field-label="نشانی Webhook" type="password" autoComplete="off" value={draft.endpoint} onChange={(event) => setDraft((current) => ({ ...current, endpoint: event.target.value }))} placeholder={selected?.connector?.endpointConfigured ? "برای حفظ مقدار فعلی خالی بگذارید" : "http://n8n:5678/webhook/..."} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left" dir="ltr"/></label>
        <label className="text-xs sm:col-span-2">مقدار احراز هویت اختیاری<input type="password" autoComplete="new-password" value={draft.authSecret} onChange={(event) => setDraft((current) => ({ ...current, authSecret: event.target.value }))} placeholder={selected?.connector?.authSecretConfigured ? "برای حفظ مقدار فعلی خالی بگذارید" : "Bearer token یا secret آینده"} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left" dir="ltr"/></label>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-control border border-border-subtle bg-surface-raised p-3 font-ui text-[11px] leading-6 text-foreground-muted"><Link2 size={15} className="mt-1 shrink-0"/>ساختار payload، امضا و پاسخ workflow بعد از دریافت اطلاعات اتصال هر سرویس تعریف می‌شود. فعال‌کردن این گزینه به‌تنهایی worker خارجی ایجاد نمی‌کند.</div>
    </Modal>
    <ConfirmDialog open={clearOpen} onClose={() => setClearOpen(false)} onConfirm={() => { setClearOpen(false); void clear(); }} title="پاک‌کردن اطلاعات اتصال" description={`اطلاعات اتصال ${selected?.service.name ?? "این سرویس"} به‌صورت برگشت‌ناپذیر پاک می‌شود.`} consequences={["نشانی Webhook و کلید احراز هویت حذف می‌شوند.", "کارهای جدید تا ثبت اتصال معتبر اجرا نخواهند شد.", "مقدارهای رمزنگاری‌شده قابل بازیابی از پنل نیستند."]} confirmLabel="پاک‌کردن اتصال" />
  </div>;
}

function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "warning" }) { return <div className="rounded-card border border-border bg-surface p-4"><div className={`font-ui text-xs ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground-muted"}`}>{label}</div><div className="mt-2 font-ui text-xl font-bold">{value.toLocaleString("fa-IR")}</div></div>; }
function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-control bg-surface-raised p-2.5 font-ui"><div className="text-[10px] text-foreground-subtle">{label}</div><div className="mt-1 text-xs">{value}</div></div>; }
