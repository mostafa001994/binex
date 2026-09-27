"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useAdminSession } from "@/components/admin/admin-gate";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { normalizePersianNumber } from "@/lib/persian-date";
import {
  createAdminPlanApi,
  getAdminCatalogServicesApi,
  getAdminPlansApi,
  updateAdminPlanApi,
  type AdminCatalogService,
  type AdminServicePlan,
} from "@/lib/api-client/admin";

type Draft = {
  serviceId: string;
  code: string;
  name: string;
  description: string;
  status: AdminServicePlan["status"];
  billingPeriod: AdminServicePlan["billingPeriod"];
  customDurationDays: string;
  priceToman: string;
  trialDays: string;
  isPublic: boolean;
  sortOrder: string;
  features: string;
};

const emptyDraft: Draft = {
  serviceId: "",
  code: "",
  name: "",
  description: "",
  status: "draft",
  billingPeriod: "monthly",
  customDurationDays: "",
  priceToman: "",
  trialDays: "0",
  isPublic: true,
  sortOrder: "0",
  features: "",
};

const statusLabel = { draft: "پیش‌نویس", active: "فعال", archived: "بایگانی" };
const periodLabel = { monthly: "ماهانه", quarterly: "سه‌ماهه", yearly: "سالانه", custom: "سفارشی" };

function digits(value: string) {
  return normalizePersianNumber(value).replace(/[^0-9]/g, "");
}

function tomanToIrr(value: string) {
  const normalized = digits(value);
  if (!normalized) throw new Error("مبلغ پلن را به تومان وارد کنید.");
  return (BigInt(normalized) * 10n).toString();
}

function formatToman(irr: string) {
  return (BigInt(irr) / 10n).toLocaleString("fa-IR");
}

function formatTomanInput(value: string) {
  const normalized = digits(value);
  return normalized ? BigInt(normalized).toLocaleString("fa-IR") : "";
}

function pricePreview(value: string) {
  const normalized = digits(value);
  if (!normalized) return "مبلغ را بدون اعشار وارد کنید.";
  const toman = BigInt(normalized);
  return `${toman.toLocaleString("fa-IR")} تومان = ${(toman * 10n).toLocaleString("fa-IR")} ریال در دیتابیس`;
}

export default function AdminPlansPage() {
  const { user } = useAdminSession();
  const canManage = hasAdminPermission(user.permissions, "admin.plans.manage");
  const [plans, setPlans] = useState<AdminServicePlan[]>([]);
  const [services, setServices] = useState<AdminCatalogService[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminServicePlan | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [planResult, serviceResult] = await Promise.all([
        getAdminPlansApi(serviceFilter),
        getAdminCatalogServicesApi(),
      ]);
      setPlans(planResult.plans);
      setServices(serviceResult.services);
    } catch (reason) {
      toast.error("دریافت پلن‌ها انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally {
      setLoading(false);
    }
  }, [serviceFilter]);

  useEffect(() => { void refresh(); }, [refresh]);

  const serviceNames = useMemo(() => new Map(services.map((item) => [item.id, item.name])), [services]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return plans;
    return plans.filter((plan) => `${plan.name} ${plan.code} ${serviceNames.get(plan.serviceId) || ""}`.toLowerCase().includes(query));
  }, [plans, search, serviceNames]);

  function createPlan() {
    setEditing(null);
    setDraft({ ...emptyDraft, serviceId: serviceFilter || services[0]?.id || "" });
    setOpen(true);
  }

  function editPlan(plan: AdminServicePlan) {
    setEditing(plan);
    setDraft({
      serviceId: plan.serviceId,
      code: plan.code,
      name: plan.name,
      description: plan.description || "",
      status: plan.status,
      billingPeriod: plan.billingPeriod,
      customDurationDays: plan.customDurationDays ? String(plan.customDurationDays) : "",
      priceToman: (BigInt(plan.priceAmount) / 10n).toLocaleString("fa-IR"),
      trialDays: String(plan.trialDays),
      isPublic: plan.isPublic,
      sortOrder: String(plan.sortOrder),
      features: plan.features.join("\n"),
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        serviceId: draft.serviceId,
        code: draft.code,
        name: draft.name,
        description: draft.description || null,
        status: draft.status,
        billingPeriod: draft.billingPeriod,
        customDurationDays: draft.billingPeriod === "custom" ? Number(digits(draft.customDurationDays)) : null,
        priceAmount: tomanToIrr(draft.priceToman),
        currency: "IRR",
        trialDays: Number(digits(draft.trialDays) || "0"),
        isPublic: draft.isPublic,
        sortOrder: Number(normalizePersianNumber(draft.sortOrder) || "0"),
        features: draft.features.split("\n").map((item) => item.trim()).filter(Boolean),
      };

      if (editing) {
        await updateAdminPlanApi(editing.id, payload);
        toast.success("پلن بروزرسانی شد");
      } else {
        await createAdminPlanApi(payload);
        toast.success("پلن ایجاد شد");
      }
      setOpen(false);
      await refresh();
    } catch (reason) {
      toast.error("ذخیره پلن انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="پلن‌ها و قیمت‌گذاری"
        description="تعریف شرایط فروش هر سرویس؛ مبالغ در دیتابیس به ریال ذخیره و در پنل به تومان نمایش داده می‌شوند."
        actions={canManage ? <Button onClick={createPlan} leadingIcon={<Plus size={16} />}>پلن جدید</Button> : undefined}
      />

      <div className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-2">
        <label className="relative">
          <Search className="absolute right-3 top-3 text-foreground-subtle" size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نام یا کد پلن" className="font-ui h-10 w-full rounded-control border border-border bg-background pr-10 pl-3 text-xs outline-none" />
        </label>
        <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs">
          <option value="">همه سرویس‌ها</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </div>

      {loading ? <AdminTableSkeleton rows={6} /> : filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((plan) => (
            <Card key={plan.id} className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-bold">{plan.name}</h2><p className="mt-1 font-ui text-xs text-foreground-muted">{serviceNames.get(plan.serviceId)} · {plan.code}</p></div>
                <Badge>{statusLabel[plan.status]}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 font-ui text-xs sm:grid-cols-4">
                <PlanFact label="دوره" value={periodLabel[plan.billingPeriod]} />
                <PlanFact label="قیمت" value={`${formatToman(plan.priceAmount)} تومان`} />
                <PlanFact label="آزمایشی" value={`${plan.trialDays.toLocaleString("fa-IR")} روز`} />
                <PlanFact label="نمایش" value={plan.isPublic ? "عمومی" : "خصوصی"} />
              </div>
              {plan.features.length ? <ul className="space-y-1 font-ui text-xs text-foreground-muted">{plan.features.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}</ul> : null}
              {canManage ? <Button variant="secondary" className="w-full" onClick={() => editPlan(plan)}>ویرایش پلن</Button> : null}
            </Card>
          ))}
        </div>
      ) : <div className="rounded-card border border-border bg-surface"><AdminEmptyState title="پلنی تعریف نشده است" description="برای شروع فروش، پلن و قیمت هر سرویس را تعریف کنید." /></div>}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "ویرایش پلن" : "ایجاد پلن"} description="قیمت را به تومان وارد کنید؛ ذخیره‌سازی با واحد ریال انجام می‌شود." size="lg" footer={<div className="flex gap-2"><Button loading={saving} onClick={save}>ذخیره</Button><Button variant="secondary" onClick={() => setOpen(false)}>انصراف</Button></div>}>
        <div className="space-y-4">
          <section className="rounded-card border border-border-subtle bg-surface-raised/40 p-4"><h3 className="mb-4 font-ui text-sm font-bold">مشخصات و قیمت</h3><div className="grid gap-4 sm:grid-cols-2">
          <PlanSelect required label="سرویس" value={draft.serviceId} disabled={Boolean(editing)} onChange={(value) => setDraft((old) => ({ ...old, serviceId: value }))}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</PlanSelect>
          <PlanInput required label="کد انگلیسی پلن" value={draft.code} disabled={Boolean(editing)} onChange={(value) => setDraft((old) => ({ ...old, code: value }))} />
          <PlanInput required label="نام پلن" value={draft.name} onChange={(value) => setDraft((old) => ({ ...old, name: value }))} />
          <PlanInput required label="قیمت (تومان)" inputMode="numeric" value={draft.priceToman} hint={pricePreview(draft.priceToman)} onChange={(value) => setDraft((old) => ({ ...old, priceToman: formatTomanInput(value) }))} />
          <PlanSelect label="دوره" value={draft.billingPeriod} onChange={(value) => setDraft((old) => ({ ...old, billingPeriod: value as Draft["billingPeriod"] }))}><option value="monthly">ماهانه</option><option value="quarterly">سه‌ماهه</option><option value="yearly">سالانه</option><option value="custom">سفارشی</option></PlanSelect>
          {draft.billingPeriod === "custom" ? <PlanInput required label="تعداد روز دوره" inputMode="numeric" value={draft.customDurationDays} onChange={(value) => setDraft((old) => ({ ...old, customDurationDays: value }))} /> : null}
          <PlanSelect label="وضعیت" value={draft.status} onChange={(value) => setDraft((old) => ({ ...old, status: value as Draft["status"] }))}><option value="draft">پیش‌نویس</option><option value="active">فعال</option><option value="archived">بایگانی</option></PlanSelect>
          <PlanInput label="روزهای آزمایشی" inputMode="numeric" value={draft.trialDays} onChange={(value) => setDraft((old) => ({ ...old, trialDays: value }))} />
          <PlanInput label="ترتیب نمایش" value={draft.sortOrder} onChange={(value) => setDraft((old) => ({ ...old, sortOrder: value }))} />
          <label className="font-ui flex items-center gap-2 text-xs"><input type="checkbox" checked={draft.isPublic} onChange={(event) => setDraft((old) => ({ ...old, isPublic: event.target.checked }))} /> نمایش عمومی پلن</label>
          </div></section>
          <section className="rounded-card border border-border-subtle bg-surface-raised/40 p-4"><h3 className="mb-1 font-ui text-sm font-bold">محتوای قابل نمایش</h3><p className="mb-4 font-ui text-xs text-foreground-muted">این اطلاعات در زمان انتخاب پلن به کاربر کمک می‌کند.</p><div className="grid gap-4">
          <label className="font-ui space-y-1 sm:col-span-2"><span className="text-xs text-foreground-muted">توضیحات</span><textarea value={draft.description} onChange={(event) => setDraft((old) => ({ ...old, description: event.target.value }))} className="min-h-20 w-full rounded-control border border-border bg-background p-3 text-xs outline-none" /></label>
          <label className="font-ui space-y-1 sm:col-span-2"><span className="text-xs text-foreground-muted">قابلیت‌ها — هر خط یک مورد</span><textarea value={draft.features} onChange={(event) => setDraft((old) => ({ ...old, features: event.target.value }))} className="min-h-28 w-full rounded-control border border-border bg-background p-3 text-xs outline-none" /></label>
          </div></section>
        </div>
      </Modal>
    </div>
  );
}

function PlanFact({ label, value }: { label: string; value: string }) { return <div className="rounded-control bg-surface-raised p-2.5"><div className="text-[10px] text-foreground-subtle">{label}</div><div className="mt-1 text-foreground">{value}</div></div>; }
function PlanInput({ label, value, onChange, disabled, inputMode, hint, required = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; inputMode?: "numeric"; hint?: string; required?: boolean }) { return <label className="font-ui space-y-1"><span className="text-xs text-foreground-muted">{label}</span><input required={required} data-field-label={label} value={value} disabled={disabled} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-control border border-border bg-background px-3 text-xs outline-none disabled:opacity-60" />{hint ? <span className="block text-[10px] leading-5 text-foreground-subtle">{hint}</span> : null}</label>; }
function PlanSelect({ label, value, onChange, disabled, children, required = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; children: React.ReactNode; required?: boolean }) { return <label className="font-ui space-y-1"><span className="text-xs text-foreground-muted">{label}</span><select required={required} data-field-label={label} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-control border border-border bg-background px-3 text-xs outline-none disabled:opacity-60">{children}</select></label>; }
