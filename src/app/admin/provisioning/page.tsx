"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdminSession } from "@/components/admin/admin-gate";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { formatTehranPersianDateTime } from "@/lib/persian-date";
import { getAdminCatalogServicesApi, getAdminProvisioningJobsApi, retryAdminProvisioningJobApi, type AdminCatalogService, type AdminPagination as Pagination, type AdminProvisioningJob } from "@/lib/api-client/admin";

const statusLabels: Record<AdminProvisioningJob["status"], string> = {
  pending: "در صف", processing: "در حال اجرا", succeeded: "موفق", failed: "ناموفق", canceled: "لغوشده",
};
const actionLabels: Record<AdminProvisioningJob["action"], string> = {
  activate: "فعال‌سازی", update: "به‌روزرسانی", suspend: "توقف", cancel: "لغو سرویس",
};

export default function AdminProvisioningPage() {
  const { user } = useAdminSession();
  const canManage = hasAdminPermission(user.permissions, "admin.provisioning.manage");
  const [items, setItems] = useState<AdminProvisioningJob[]>([]);
  const [services, setServices] = useState<AdminCatalogService[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [retryTarget, setRetryTarget] = useState<AdminProvisioningJob | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status") || "");
    setAction(params.get("action") || "");
    setServiceId(params.get("serviceId") || "");
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [result, catalog] = await Promise.all([
        getAdminProvisioningJobsApi({ search, status, action, serviceId, page }),
        getAdminCatalogServicesApi(),
      ]);
      setItems(result.items); setPagination(result.pagination); setServices(catalog.services);
    } catch (reason) { toast.error("دریافت صف راه‌اندازی انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setLoading(false); }
  }, [action, page, search, serviceId, status]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { setPage(1); }, [search, status, action, serviceId]);

  async function retry(job: AdminProvisioningJob) {
    setRetrying(job.id);
    try { await retryAdminProvisioningJobApi(job.id); toast.success("کار دوباره در صف قرار گرفت"); await refresh(); }
    catch (reason) { toast.error("تلاش مجدد انجام نشد", { description: reason instanceof Error ? reason.message : undefined }); }
    finally { setRetrying(null); }
  }

  return <div className="space-y-5">
    <AdminPageHeader title="صف راه‌اندازی سرویس‌ها" description="نظارت بر عملیات n8n، تلاش‌های اجرا و خطاهای عملیاتی بدون نمایش داده ارسالی یا اطلاعات محرمانه." actions={<Link href="/admin/automations"><Button variant="secondary">وضعیت اتصال‌های n8n</Button></Link>} />
    <div className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-4">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="کسب‌وکار، سرویس یا شناسه اجرا" className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none" />
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه وضعیت‌ها</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={action} onChange={(event) => setAction(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه عملیات‌ها</option>{Object.entries(actionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs"><option value="">همه سرویس‌ها</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
    </div>
    {loading ? <AdminTableSkeleton rows={6} /> : items.length ? <div className="grid gap-4 xl:grid-cols-2">{items.map((job) => <Card key={job.id} className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-ui font-bold">{job.businessName}</h2><p className="mt-1 font-ui text-xs text-foreground-muted">{job.serviceName} · {actionLabels[job.action]}</p></div><Badge>{statusLabels[job.status]}</Badge></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Fact label="تلاش" value={`${job.attemptCount.toLocaleString("fa-IR")} از ${job.maxAttempts.toLocaleString("fa-IR")}`} /><Fact label="شناسه اجرا" value={job.n8nExecutionId || "—"} /><Fact label="ایجاد" value={formatTehranPersianDateTime(job.createdAt)} /><Fact label="پایان" value={job.completedAt ? formatTehranPersianDateTime(job.completedAt) : "—"} /></div>
      {job.lastError ? <div className="font-ui break-words rounded-control border border-danger/20 bg-danger/5 p-3 text-xs text-danger"><div className="mb-1 font-semibold">آخرین خطای پاک‌سازی‌شده</div>{job.lastError}</div> : null}
      {canManage && job.status === "failed" ? <Button loading={retrying === job.id} onClick={() => setRetryTarget(job)}>تلاش مجدد</Button> : null}
    </Card>)}</div> : <div className="rounded-card border border-border bg-surface"><AdminEmptyState title="کاری در صف راه‌اندازی نیست" description="پس از خرید یا تغییر وضعیت اشتراک، عملیات مربوط به n8n در این بخش ثبت می‌شود." /></div>}
    {pagination ? <AdminPagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} label="کار" onPageChange={setPage} /> : null}
    <ConfirmDialog open={Boolean(retryTarget)} onClose={() => setRetryTarget(null)} onConfirm={() => { if (retryTarget) { const job = retryTarget; setRetryTarget(null); void retry(job); } }} title="تلاش مجدد راه‌اندازی" description={retryTarget ? `راه‌اندازی «${retryTarget.serviceName}» برای «${retryTarget.businessName}» دوباره در صف قرار می‌گیرد.` : ""} consequences={["شمارنده تلاش افزایش می‌یابد.", "اجرای جدید ممکن است در سرویس بیرونی اثر ایجاد کند؛ تکرارپذیری باید در workflow رعایت شود.", "نتیجه تلاش در گزارش تغییرات ثبت می‌شود."]} confirmLabel="قرار دادن مجدد در صف" tone="warning" />
  </div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="font-ui min-w-0 rounded-control bg-surface-raised p-2.5"><div className="text-[10px] text-foreground-subtle">{label}</div><div className="mt-1 truncate text-xs">{value}</div></div>; }
