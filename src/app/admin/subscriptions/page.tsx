"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminSession } from "@/components/admin/admin-gate";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { formatTehranPersianDateTime } from "@/lib/persian-date";
import { changeAdminSubscriptionPlanApi, createAdminSubscriptionApi, getAdminBusinessesApi, getAdminCatalogServicesApi, getAdminPlansApi, getAdminSubscriptionsApi, renewAdminSubscriptionApi, transitionAdminSubscriptionApi, type AdminBusiness, type AdminCatalogService, type AdminPagination as Pagination, type AdminServicePlan, type AdminSubscription } from "@/lib/api-client/admin";

const statusLabels: Record<AdminSubscription["status"], string> = {
  pending: "در انتظار", trialing: "آزمایشی", active: "فعال", "past-due": "سررسید گذشته",
  paused: "متوقف", canceled: "لغوشده", expired: "منقضی",
};
const provisioningLabels: Record<AdminSubscription["provisioningStatus"], string> = {
  "not-started": "شروع‌نشده", queued: "در صف n8n", "in-progress": "در حال آماده‌سازی", ready: "آماده", failed: "ناموفق",
};

export default function AdminSubscriptionsPage() {
  const { user } = useAdminSession();
  const canManage = hasAdminPermission(user.permissions, "admin.subscriptions.manage");
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [services, setServices] = useState<AdminCatalogService[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [plans, setPlans] = useState<AdminServicePlan[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [planTarget, setPlanTarget] = useState<AdminSubscription | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [pendingAction, setPendingAction] = useState<{ item: AdminSubscription; operation: "cancel" | "renew" } | null>(null);
  const [draft, setDraft] = useState({ businessId: "", planId: "", status: "pending" as "pending" | "trialing" | "active", startsAt: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status") || "");
    setServiceId(params.get("serviceId") || "");
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [result, catalog, businessResult, planResult] = await Promise.all([getAdminSubscriptionsApi({ search, status, serviceId, page }), getAdminCatalogServicesApi(), getAdminBusinessesApi({ pageSize: 100 }), getAdminPlansApi()]);
      setItems(result.items); setPagination(result.pagination); setServices(catalog.services); setBusinesses(businessResult.items); setPlans(planResult.plans);
    } catch (reason) {
      toast.error("دریافت اشتراک‌ها انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setLoading(false); }
  }, [page, search, serviceId, status]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { setPage(1); }, [search, status, serviceId]);

  async function transition(item: AdminSubscription, operation: "pause" | "resume" | "cancel") {
    setChanging(item.id);
    try {
      await transitionAdminSubscriptionApi(item.id, operation);
      toast.success(operation === "pause" ? "اشتراک متوقف شد" : operation === "resume" ? "اشتراک در صف ادامه سرویس قرار گرفت" : "اشتراک لغو شد");
      await refresh();
    } catch (reason) { toast.error("تغییر اشتراک انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setChanging(null); }
  }

  async function createSubscription() {
    setChanging("create");
    try {
      await createAdminSubscriptionApi({ ...draft, startsAt: draft.startsAt ? new Date(`${draft.startsAt}T00:00:00`).toISOString() : undefined });
      toast.success("اشتراک دستی ایجاد شد", { description: draft.status === "pending" ? "هیچ پرداخت یا راه‌اندازی تأیید نشده است." : "کار راه‌اندازی در صف داخلی ثبت شد." });
      setCreateOpen(false); setDraft({ businessId: "", planId: "", status: "pending", startsAt: "" }); await refresh();
    } catch (reason) { toast.error("ایجاد اشتراک انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setChanging(null); }
  }

  async function renew(item: AdminSubscription) {
    setChanging(item.id);
    try { await renewAdminSubscriptionApi(item.id); toast.success("اشتراک تمدید شد"); await refresh(); }
    catch (reason) { toast.error("تمدید انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setChanging(null); }
  }

  async function changePlan() {
    if (!planTarget || !selectedPlanId) return;
    setChanging(planTarget.id);
    try { await changeAdminSubscriptionPlanApi(planTarget.id, selectedPlanId); toast.success("پلن اشتراک تغییر کرد"); setPlanTarget(null); setSelectedPlanId(""); await refresh(); }
    catch (reason) { toast.error("تغییر پلن انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setChanging(null); }
  }

  return <div className="space-y-5">
    <AdminPageHeader title="مدیریت اشتراک‌ها" description="کنترل چرخه اشتراک هر کسب‌وکار و وضعیت آماده‌سازی سرویس در n8n." actions={canManage ? <Button leadingIcon={<Plus size={16}/>} onClick={() => setCreateOpen(true)}>اشتراک جدید</Button> : undefined} />
    <div className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-3">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام کسب‌وکار، سرویس یا پلن" className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none" />
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه وضعیت‌ها</option>{Object.entries(statusLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select>
      <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه سرویس‌ها</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
    </div>
    {loading ? <AdminTableSkeleton rows={6} /> : items.length ? <div className="grid gap-4 xl:grid-cols-2">{items.map((item) => <Card key={item.id} className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{item.businessName}</h2><p className="mt-1 font-ui text-xs text-foreground-muted">{item.serviceName} · {item.planName}</p></div><Badge>{statusLabels[item.status]}</Badge></div>
      <div className="grid grid-cols-2 gap-2 font-ui text-xs sm:grid-cols-4"><Fact label="آماده‌سازی" value={provisioningLabels[item.provisioningStatus]} /><Fact label="مبلغ" value={`${(BigInt(item.priceAmount) / 10n).toLocaleString("fa-IR")} تومان`} /><Fact label="پایان دوره" value={item.currentPeriodEndsAt ? formatTehranPersianDateTime(item.currentPeriodEndsAt) : "—"} /><Fact label="تمدید خودکار" value={item.autoRenew ? "فعال" : "غیرفعال"} /></div>
      {canManage ? <div className="flex flex-wrap gap-2">{["active", "trialing", "past-due"].includes(item.status) ? <Button loading={changing === item.id} variant="secondary" onClick={() => transition(item, "pause")}>توقف</Button> : null}{item.status === "paused" ? <Button loading={changing === item.id} onClick={() => transition(item, "resume")}>ادامه</Button> : null}{["active", "past-due", "paused"].includes(item.status) ? <Button loading={changing === item.id} variant="secondary" onClick={() => setPendingAction({ item, operation: "renew" })}>تمدید دستی</Button> : null}{!["canceled", "expired"].includes(item.status) ? <Button variant="secondary" onClick={() => { setPlanTarget(item); setSelectedPlanId(""); }}>تغییر پلن</Button> : null}{!["canceled", "expired"].includes(item.status) ? <Button loading={changing === item.id} variant="danger" onClick={() => setPendingAction({ item, operation: "cancel" })}>لغو اشتراک</Button> : null}</div> : null}
    </Card>)}</div> : <div className="rounded-card border border-border bg-surface"><AdminEmptyState title="اشتراکی ثبت نشده است" description="بعد از تکمیل خرید، اشتراک‌های واقعی کسب‌وکارها در این بخش نمایش داده می‌شوند." /></div>}
    {pagination ? <AdminPagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} label="اشتراک" onPageChange={setPage} /> : null}
    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="ایجاد اشتراک دستی" description="این عملیات پرداخت موفق ثبت نمی‌کند. مبلغ و دوره از پلن انتخابی خوانده می‌شود." footer={<div className="flex gap-2"><Button loading={changing === "create"} onClick={() => void createSubscription()}>ایجاد اشتراک</Button><Button variant="secondary" onClick={() => setCreateOpen(false)}>انصراف</Button></div>}>
      <div className="grid gap-4 font-ui sm:grid-cols-2"><label className="text-xs">کسب‌وکار<select required data-field-label="کسب‌وکار" value={draft.businessId} onChange={(event) => setDraft({...draft,businessId:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="">انتخاب کنید</option>{businesses.filter((item) => item.status === "active").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs">پلن فعال<select required data-field-label="پلن فعال" value={draft.planId} onChange={(event) => setDraft({...draft,planId:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="">انتخاب کنید</option>{plans.filter((item) => item.status === "active").map((item) => <option key={item.id} value={item.id}>{item.name} · {(BigInt(item.priceAmount)/10n).toLocaleString("fa-IR")} تومان</option>)}</select></label><label className="text-xs">وضعیت اولیه<select value={draft.status} onChange={(event) => setDraft({...draft,status:event.target.value as typeof draft.status})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="pending">در انتظار؛ بدون راه‌اندازی</option><option value="trialing">آزمایشی؛ ارسال به صف راه‌اندازی</option><option value="active">فعال؛ ارسال به صف راه‌اندازی</option></select></label><label className="text-xs">تاریخ شروع<input type="date" value={draft.startsAt} onChange={(event) => setDraft({...draft,startsAt:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label></div>
    </Modal>
    <Modal open={Boolean(planTarget)} onClose={() => setPlanTarget(null)} title="تغییر پلن اشتراک" description="فقط پلن‌های فعال همین سرویس قابل انتخاب‌اند و مبلغ snapshot اشتراک به‌روز می‌شود." footer={<div className="flex gap-2"><Button loading={Boolean(planTarget && changing === planTarget.id)} onClick={() => void changePlan()}>ثبت تغییر پلن</Button><Button variant="secondary" onClick={() => setPlanTarget(null)}>انصراف</Button></div>}>
      <label className="block font-ui text-xs">پلن جدید<select required data-field-label="پلن جدید" value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="">انتخاب کنید</option>{plans.filter((item) => item.status === "active" && item.serviceId === planTarget?.serviceId && item.id !== planTarget?.planId).map((item) => <option key={item.id} value={item.id}>{item.name} · {(BigInt(item.priceAmount)/10n).toLocaleString("fa-IR")} تومان</option>)}</select></label>
    </Modal>
    <ConfirmDialog
      open={Boolean(pendingAction)}
      onClose={() => setPendingAction(null)}
      onConfirm={() => {
        if (!pendingAction) return;
        const action = pendingAction;
        setPendingAction(null);
        if (action.operation === "cancel") void transition(action.item, "cancel");
        else void renew(action.item);
      }}
      title={pendingAction?.operation === "cancel" ? "لغو اشتراک" : "تمدید دستی اشتراک"}
      description={pendingAction ? `اشتراک «${pendingAction.item.serviceName}» برای «${pendingAction.item.businessName}» تغییر می‌کند.` : ""}
      consequences={pendingAction?.operation === "cancel" ? ["اشتراک وارد وضعیت لغوشده می‌شود.", "عملیات لغو سرویس در صف راه‌اندازی ثبت می‌شود.", "این تغییر در گزارش تغییرات ثبت خواهد شد."] : ["یک دوره جدید بدون ثبت پرداخت ایجاد می‌شود.", "مسئولیت تطبیق مالی این تمدید با مدیر است."]}
      confirmLabel={pendingAction?.operation === "cancel" ? "لغو اشتراک" : "تمدید بدون پرداخت"}
      tone={pendingAction?.operation === "cancel" ? "danger" : "warning"}
    />
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-control bg-surface-raised p-2.5"><div className="text-[10px] text-foreground-subtle">{label}</div><div className="mt-1 text-foreground">{value}</div></div>; }
