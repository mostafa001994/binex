"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  createAdminAccessRoleApi,
  getAdminAccessRolesApi,
  updateAdminAccessRoleApi,
  type AdminAccessRole,
  type AdminPermissionDefinition,
} from "@/lib/api-client/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type FormState = { code: string; name: string; description: string; permissions: string[] };
const EMPTY: FormState = { code: "", name: "", description: "", permissions: [] };

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminAccessRole[]>([]);
  const [definitions, setDefinitions] = useState<AdminPermissionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccessRole | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const refresh = useCallback(async () => {
    try {
      const result = await getAdminAccessRolesApi();
      setRoles(result.roles); setDefinitions(result.permissions);
    } catch (reason) {
      toast.error("نقش‌ها دریافت نشدند", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const groups = useMemo(() => Object.entries(Object.groupBy(definitions.filter((item) => item.code !== "admin.roles.manage"), (item) => item.group)), [definitions]);
  const beginCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const beginEdit = (role: AdminAccessRole) => { setEditing(role); setForm({ code: role.code, name: role.name, description: role.description ?? "", permissions: role.permissions.filter((item) => item !== "admin.roles.manage") }); setOpen(true); };
  const toggle = (code: string) => setForm((current) => ({ ...current, permissions: current.permissions.includes(code) ? current.permissions.filter((item) => item !== code) : [...current.permissions, code] }));

  async function save() {
    setSaving(true);
    try {
      if (editing) await updateAdminAccessRoleApi(editing.id, { name: form.name, description: form.description, permissions: form.permissions });
      else await createAdminAccessRoleApi(form);
      toast.success(editing ? "نقش به‌روزرسانی شد" : "نقش جدید ساخته شد");
      setOpen(false); await refresh();
    } catch (reason) {
      toast.error("ذخیره نقش انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(false); }
  }

  return <div className="space-y-5">
    <AdminPageHeader title="نقش‌ها و سطح دسترسی" description="نقش‌های مدیریتی را بسازید و مجوز هر بخش را به‌صورت مستقل تعیین کنید." actions={<Button leadingIcon={<Plus size={16}/>} onClick={beginCreate}>نقش جدید</Button>} />
    {loading ? <AdminTableSkeleton rows={5}/> : roles.length ? <div className="grid gap-4 md:grid-cols-2">
      {roles.map((role) => <article key={role.id} className="rounded-card border border-border bg-surface p-5 shadow-binix-sm">
        <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 data-display-title="true" className="text-lg font-bold">{role.name}</h2>{role.isSystem ? <Badge>پیش‌فرض</Badge> : <Badge variant="success">سفارشی</Badge>}{role.isProtected ? <Badge variant="warning">حفاظت‌شده</Badge> : null}</div><div dir="ltr" className="mt-1 text-right font-ui text-[11px] text-foreground-subtle">{role.code}</div></div><ShieldCheck className="text-primary" size={20}/></div>
        <p className="mt-3 min-h-10 font-ui text-xs leading-5 text-foreground-muted">{role.description || "بدون توضیح"}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-control bg-surface-raised p-3 font-ui text-xs"><span>کاربران: {role.userCount.toLocaleString("fa-IR")}</span><span>مجوزها: {role.permissions.length.toLocaleString("fa-IR")}</span></div>
        <Button className="mt-4 w-full" variant="secondary" disabled={role.isProtected} onClick={() => beginEdit(role)}>{role.isProtected ? "غیرقابل ویرایش" : "ویرایش نقش"}</Button>
      </article>)}
    </div> : <AdminEmptyState title="نقشی تعریف نشده" description="اولین نقش مدیریتی را ایجاد کنید."/>}
    <Modal open={open} onClose={() => !saving && setOpen(false)} title={editing ? "ویرایش نقش" : "ایجاد نقش"} description="مجوز مدیریت نقش‌ها فقط برای مدیر ارشد محفوظ می‌ماند." footer={<div className="flex gap-2"><Button loading={saving} onClick={() => void save()}>ذخیره</Button><Button variant="secondary" disabled={saving} onClick={() => setOpen(false)}>انصراف</Button></div>}>
      <div className="space-y-5 font-ui"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs">نام نقش<input required minLength={2} data-field-label="نام نقش" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label><label className="text-xs">کد انگلیسی<input required minLength={3} pattern="[a-z][a-z0-9-]*" data-field-label="کد انگلیسی نقش" dir="ltr" disabled={Boolean(editing)} value={form.code} onChange={(e) => setForm({...form,code:e.target.value.toLowerCase()})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left disabled:opacity-60"/></label></div><label className="block text-xs">توضیحات<textarea value={form.description} onChange={(e) => setForm({...form,description:e.target.value})} className="mt-2 min-h-20 w-full rounded-control border border-border bg-background p-3"/></label>
        <div><h3 className="text-sm font-semibold">مجوزها</h3><div className="mt-3 space-y-4">{groups.map(([group, items]) => <fieldset key={group} className="rounded-control border border-border p-4"><legend className="px-2 text-xs font-semibold text-primary">{group}</legend><div className="grid gap-3 sm:grid-cols-2">{items?.map((item) => <label key={item.code} className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={form.permissions.includes(item.code)} onChange={() => toggle(item.code)} className="size-4 accent-[var(--primary)]"/><span>{item.label}</span></label>)}</div></fieldset>)}</div></div>
      </div>
    </Modal>
  </div>;
}
