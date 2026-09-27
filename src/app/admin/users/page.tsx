"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
} from "lucide-react";
import {
  createAdminUserApi,
  getAdminRoleOptionsApi,
  getAdminUsersApi,
  type AdminPagination as PaginationType,
  type AdminRoleOption,
  type AdminUser,
} from "@/lib/api-client/admin";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAdminSession } from "@/components/admin/admin-gate";
import { hasAdminPermission } from "@/lib/admin-permissions";

export default function AdminUsersPage() {
  const { user: actor } = useAdminSession();
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<AdminRoleOption[]>([]);
  const [status, setStatus] = useState<AdminUser["status"] | "">("");
  const [page, setPage] = useState(1);
  const [users, setUsers] =
    useState<AdminUser[]>([]);
  const [pagination, setPagination] =
    useState<PaginationType | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ phone: "", name: "", email: "", accessRoleId: "" });
  const canCreate = hasAdminPermission(actor.permissions, "admin.users.manage");
  const canAssignRole = hasAdminPermission(actor.permissions, "admin.roles.manage");

  useEffect(() => {
    getAdminRoleOptionsApi().then((result) => setRoles(result.roles)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");

      getAdminUsersApi({
        search,
        roleId,
        status,
        page,
      })
        .then((result) => {
          setUsers(result.items);
          setPagination(result.pagination);
        })
        .catch((reason) => {
          setError(
            reason instanceof Error
              ? reason.message
              : "کاربران قابل دریافت نیستند.",
          );
        })
        .finally(() =>
          setLoading(false),
        );
    }, 180);

    return () =>
      window.clearTimeout(timer);
  }, [search, roleId, status, page]);

  useEffect(() => {
    setPage(1);
  }, [search, roleId, status]);

  const resetFilters = () => {
    setSearch("");
    setRoleId("");
    setStatus("");
    setPage(1);
  };

  async function createUser() {
    setSaving(true);
    try {
      await createAdminUserApi({ ...draft, accessRoleId: canAssignRole ? draft.accessRoleId || undefined : undefined });
      toast.success("حساب کاربر ساخته شد");
      setCreateOpen(false);
      setDraft({ phone: "", name: "", email: "", accessRoleId: "" });
      setPage(1);
      const result = await getAdminUsersApi({ search, roleId, status, page: 1 });
      setUsers(result.items); setPagination(result.pagination);
    } catch (reason) {
      toast.error("ایجاد حساب انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="کاربران"
        description="حساب‌های سیستم، نقش‌ها و کسب‌وکارهای مرتبط."
        actions={canCreate ? <Button leadingIcon={<Plus size={16}/>} onClick={() => setCreateOpen(true)}>کاربر جدید</Button> : undefined}
      />

      <AdminFilterBar
        onReset={resetFilters}
        hasActiveFilters={Boolean(
          search || roleId || status,
        )}
      >
        <label className="relative block min-w-0 xl:w-[340px]">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
          />
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="جستجو با شماره، نام یا نقش"
            className="font-ui h-10 w-full rounded-control border border-border bg-background pr-9 pl-3 text-xs outline-none transition focus:border-primary/40"
          />
        </label>

        <select
          value={roleId}
          onChange={(event) =>
            setRoleId(event.target.value)
          }
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none transition focus:border-primary/40 xl:w-[180px]"
        >
          <option value="">همه نقش‌ها</option>
          {roles.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select value={status} onChange={(event) => setStatus(event.target.value as AdminUser["status"] | "")} className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none transition focus:border-primary/40 xl:w-[180px]">
          <option value="">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="blocked">مسدود</option>
        </select>
      </AdminFilterBar>

      {error ? (
        <div className="rounded-card border border-error/20 bg-error/[0.04] p-4 font-ui text-sm text-error">
          {error}
        </div>
      ) : loading ? (
        <AdminTableSkeleton rows={6} />
      ) : users.length ? (
        <>
          <div className="hidden overflow-hidden rounded-card border border-border bg-surface shadow-binix-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right">
                <thead className="bg-surface-raised/70">
                  <tr className="font-ui text-[11px] text-foreground-subtle">
                    <th className="px-4 py-3 font-medium">
                      شماره موبایل
                    </th>
                    <th className="px-4 py-3 font-medium">
                      نام
                    </th>
                    <th className="px-4 py-3 font-medium">
                      نقش
                    </th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-4 py-3 font-medium">
                      ایجاد حساب
                    </th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-border-subtle font-ui text-xs transition hover:bg-surface-hover/50"
                    >
                      <td
                        dir="ltr"
                        className="px-4 py-3 text-right"
                      >
                        {user.phone}
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {user.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge user={user} />
                      </td>
                      <td className="px-4 py-3"><Badge variant={user.status === "active" ? "success" : "error"}>{user.status === "active" ? "فعال" : "مسدود"}</Badge></td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {new Date(
                          user.createdAt,
                        ).toLocaleDateString(
                          "fa-IR",
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1 text-primary"
                        >
                          جزئیات
                          <ArrowLeft size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block rounded-card border border-border bg-surface p-4 shadow-binix-sm transition active:scale-[.995]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-ui text-sm font-semibold">
                      {user.name ||
                        "کاربر بدون نام"}
                    </div>
                    <div
                      dir="ltr"
                      className="mt-1 text-right font-ui text-xs text-foreground-muted"
                    >
                      {user.phone}
                    </div>
                  </div>
                  <RoleBadge user={user} />
                  <Badge variant={user.status === "active" ? "success" : "error"}>{user.status === "active" ? "فعال" : "مسدود"}</Badge>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 font-ui text-[10px] text-foreground-subtle">
                  <span>
                    ایجاد{" "}
                    {new Date(
                      user.createdAt,
                    ).toLocaleDateString(
                      "fa-IR",
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    جزئیات
                    <ArrowLeft size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-card border border-border bg-surface">
          <AdminEmptyState
            title="کاربری پیدا نشد"
            description="فیلترها یا عبارت جستجو را تغییر دهید."
          />
        </div>
      )}

      {pagination ? (
        <AdminPagination
          page={pagination.page}
          totalPages={
            pagination.totalPages
          }
          total={pagination.total}
          label="کاربر"
          onPageChange={setPage}
        />
      ) : null}

      <Modal open={createOpen} onClose={() => !saving && setCreateOpen(false)} title="ایجاد کاربر" description="کاربر پس از ایجاد می‌تواند با همان شماره موبایل و OTP وارد شود." footer={<div className="flex gap-2"><Button loading={saving} onClick={() => void createUser()}>ایجاد حساب</Button><Button variant="secondary" disabled={saving} onClick={() => setCreateOpen(false)}>انصراف</Button></div>}>
        <div className="grid gap-4 font-ui sm:grid-cols-2">
          <label className="text-xs">شماره موبایل<input required pattern="09[0-9]{9}" data-field-label="شماره موبایل" data-required-message="شماره موبایل را با فرمت 09xxxxxxxxx وارد کنید." dir="ltr" inputMode="numeric" value={draft.phone} onChange={(event) => setDraft({...draft,phone:event.target.value})} placeholder="09123456789" className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left"/></label>
          <label className="text-xs">نام و نام خانوادگی<input value={draft.name} onChange={(event) => setDraft({...draft,name:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label>
          <label className="text-xs">ایمیل اختیاری<input dir="ltr" type="email" value={draft.email} onChange={(event) => setDraft({...draft,email:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left"/></label>
          {canAssignRole ? <label className="text-xs">نقش اولیه<select value={draft.accessRoleId} onChange={(event) => setDraft({...draft,accessRoleId:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="">کاربر عادی</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label> : null}
        </div>
      </Modal>
    </div>
  );
}

function RoleBadge({
  user,
}: {
  user: AdminUser;
}) {
  const role = user.role;
  if (role === "super-admin") {
    return (
      <Badge variant="warning">
        {user.accessRole.name}
      </Badge>
    );
  }

  if (role === "admin") {
    return (
      <Badge variant="success">
        {user.accessRole.name}
      </Badge>
    );
  }

  return <Badge>{user.accessRole.name}</Badge>;
}
