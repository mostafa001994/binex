"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAdminBusinessApi,
  getAdminBusinessesApi,
  getAdminUsersApi,
  type AdminBusiness,
  type AdminUser,
  type AdminPagination as PaginationType,
} from "@/lib/api-client/admin";
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

export default function AdminBusinessesPage() {
  const { user: actor } = useAdminSession();
  const [search, setSearch] =
    useState("");
  const [status, setStatus] =
    useState<
      AdminBusiness["status"] | ""
    >("");
  const [serviceStatus, setServiceStatus] =
    useState<
      | AdminBusiness["services"][number]["status"]
      | ""
    >("");
  const [page, setPage] =
    useState(1);
  const [businesses, setBusinesses] =
    useState<AdminBusiness[]>([]);
  const [pagination, setPagination] =
    useState<PaginationType | null>(
      null,
    );
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ownerOptions, setOwnerOptions] = useState<AdminUser[]>([]);
  const [draft, setDraft] = useState({ name: "", phone: "", category: "", ownerUserId: "" });
  const canManage = hasAdminPermission(actor.permissions, "admin.businesses.manage");

  useEffect(() => {
    if (!canManage) return;
    getAdminUsersApi({ status: "active", pageSize: 100 })
      .then((result) => setOwnerOptions(result.items))
      .catch(() => undefined);
  }, [canManage]);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setLoading(true);
        setError("");

        getAdminBusinessesApi({
          search,
          status,
          serviceStatus,
          page,
        })
          .then((result) => {
            setBusinesses(
              result.items,
            );
            setPagination(
              result.pagination,
            );
          })
          .catch((reason) => {
            setError(
              reason instanceof Error
                ? reason.message
                : "کسب‌وکارها قابل دریافت نیستند.",
            );
          })
          .finally(() =>
            setLoading(false),
          );
      }, 180);

    return () =>
      window.clearTimeout(timer);
  }, [
    search,
    status,
    serviceStatus,
    page,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    status,
    serviceStatus,
  ]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setServiceStatus("");
    setPage(1);
  };

  async function createBusiness() {
    setSaving(true);
    try {
      await createAdminBusinessApi(draft);
      toast.success("کسب‌وکار و مالک آن ایجاد شدند");
      setCreateOpen(false);
      setDraft({ name: "", phone: "", category: "", ownerUserId: "" });
      setStatus(""); setPage(1);
      const result = await getAdminBusinessesApi({ search, serviceStatus, page: 1 });
      setBusinesses(result.items); setPagination(result.pagination);
    } catch (reason) {
      toast.error("ایجاد کسب‌وکار انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="کسب‌وکارها"
        description="مدیریت کسب‌وکار، مالک، اعضا و سرویس‌های تخصیص‌یافته."
        actions={canManage ? <Button leadingIcon={<Plus size={16}/>} onClick={() => setCreateOpen(true)}>کسب‌وکار جدید</Button> : undefined}
      />

      <AdminFilterBar
        onReset={resetFilters}
        hasActiveFilters={Boolean(
          search ||
            status ||
            serviceStatus,
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
            placeholder="نام، شماره یا مالک"
            className="font-ui h-10 w-full rounded-control border border-border bg-background pr-9 pl-3 text-xs outline-none transition focus:border-primary/40"
          />
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as
                | AdminBusiness["status"]
                | "",
            )
          }
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none xl:w-[170px]"
        >
          <option value="">
            همه وضعیت‌ها
          </option>
          <option value="active">
            فعال
          </option>
          <option value="suspended">
            تعلیق
          </option>
          <option value="archived">
            آرشیوشده
          </option>
        </select>

        <select
          value={serviceStatus}
          onChange={(event) =>
            setServiceStatus(
              event.target.value as
                | AdminBusiness["services"][number]["status"]
                | "",
            )
          }
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none xl:w-[180px]"
        >
          <option value="">
            همه سرویس‌ها
          </option>
          <option value="setup">
            راه‌اندازی
          </option>
          <option value="active">
            فعال
          </option>
          <option value="paused">
            متوقف
          </option>
        </select>
      </AdminFilterBar>

      {error ? (
        <div className="rounded-card border border-error/20 bg-error/[0.04] p-4 font-ui text-sm text-error">
          {error}
        </div>
      ) : loading ? (
        <AdminTableSkeleton rows={6} />
      ) : businesses.length ? (
        <>
          <div className="hidden overflow-hidden rounded-card border border-border bg-surface shadow-binix-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-right">
                <thead className="bg-surface-raised/70">
                  <tr className="font-ui text-[11px] text-foreground-subtle">
                    <th className="px-4 py-3 font-medium">
                      کسب‌وکار
                    </th>
                    <th className="px-4 py-3 font-medium">
                      مالک
                    </th>
                    <th className="px-4 py-3 font-medium">
                      اعضا
                    </th>
                    <th className="px-4 py-3 font-medium">
                      سرویس فعال
                    </th>
                    <th className="px-4 py-3 font-medium">
                      وضعیت
                    </th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {businesses.map(
                    (business) => (
                      <tr
                        key={business.id}
                        className="border-t border-border-subtle font-ui text-xs transition hover:bg-surface-hover/50"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">
                            {business.name}
                          </div>
                          <div
                            dir="ltr"
                            className="mt-1 text-right text-[10px] text-foreground-subtle"
                          >
                            {business.phone ||
                              "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          {business.owner
                            ?.name ||
                            business.owner
                              ?.phone ||
                            "—"}
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          {business.memberCount.toLocaleString(
                            "fa-IR",
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          {business.services
                            .filter(
                              (item) =>
                                item.status ===
                                "active",
                            )
                            .length.toLocaleString(
                              "fa-IR",
                            )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              business.status ===
                              "active"
                                ? "success"
                                : "error"
                            }
                          >
                            {business.status ===
                            "active"
                              ? "فعال"
                              : business.status === "suspended" ? "تعلیق" : "آرشیوشده"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/businesses/${business.id}`}
                            className="inline-flex items-center gap-1 text-primary"
                          >
                            مدیریت
                            <ArrowLeft
                              size={13}
                            />
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {businesses.map(
              (business) => (
                <Link
                  key={business.id}
                  href={`/admin/businesses/${business.id}`}
                  className="block rounded-card border border-border bg-surface p-4 shadow-binix-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-ui text-sm font-semibold">
                        {business.name}
                      </div>
                      <div className="mt-1 font-ui text-[11px] text-foreground-muted">
                        مالک:{" "}
                        {business.owner
                          ?.name ||
                          business.owner
                            ?.phone ||
                          "—"}
                      </div>
                    </div>
                    <Badge
                      variant={
                        business.status ===
                        "active"
                          ? "success"
                          : "error"
                      }
                    >
                      {business.status ===
                      "active"
                        ? "فعال"
                        : business.status === "suspended" ? "تعلیق" : "آرشیوشده"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-subtle pt-3">
                    <MobileStat
                      label="اعضا"
                      value={business.memberCount}
                    />
                    <MobileStat
                      label="سرویس فعال"
                      value={
                        business.services.filter(
                          (item) =>
                            item.status ===
                            "active",
                        ).length
                      }
                    />
                  </div>
                </Link>
              ),
            )}
          </div>
        </>
      ) : (
        <div className="rounded-card border border-border bg-surface">
          <AdminEmptyState
            title="کسب‌وکاری پیدا نشد"
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
          label="کسب‌وکار"
          onPageChange={setPage}
        />
      ) : null}

      <Modal open={createOpen} onClose={() => !saving && setCreateOpen(false)} title="ایجاد کسب‌وکار" description="یک کسب‌وکار واقعی همراه با مالک اولیه در دیتابیس ساخته می‌شود." footer={<div className="flex gap-2"><Button loading={saving} onClick={() => void createBusiness()}>ایجاد کسب‌وکار</Button><Button variant="secondary" disabled={saving} onClick={() => setCreateOpen(false)}>انصراف</Button></div>}>
        <div className="grid gap-4 font-ui sm:grid-cols-2">
          <label className="text-xs">نام کسب‌وکار<input required minLength={2} data-field-label="نام کسب‌وکار" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label>
          <label className="text-xs">مالک اولیه<select required data-field-label="مالک اولیه" value={draft.ownerUserId} onChange={(event) => setDraft((current) => ({ ...current, ownerUserId: event.target.value }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"><option value="">انتخاب کاربر فعال</option>{ownerOptions.map((owner) => <option key={owner.id} value={owner.id}>{owner.name || owner.phone} — {owner.phone}</option>)}</select></label>
          <label className="text-xs">شماره تماس اختیاری<input dir="ltr" inputMode="numeric" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="09123456789" className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left"/></label>
          <label className="text-xs">دسته‌بندی اختیاری<input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label>
        </div>
        <p className="mt-4 font-ui text-[11px] leading-6 text-foreground-subtle">ساخت کسب‌وکار بدون مالک مجاز نیست. سرویس و اشتراک بعداً به‌صورت مستقل تخصیص داده می‌شوند.</p>
      </Modal>
    </div>
  );
}

function MobileStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-control bg-surface-raised/60 px-3 py-2">
      <div className="font-ui text-[10px] text-foreground-subtle">
        {label}
      </div>
      <div className="mt-1 font-ui text-sm font-semibold">
        {value.toLocaleString("fa-IR")}
      </div>
    </div>
  );
}
