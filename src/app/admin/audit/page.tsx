"use client";

import { useEffect, useState } from "react";
import {
  getAdminAuditApi,
  type AdminAuditItem,
  type AdminPagination as PaginationType,
} from "@/lib/api-client/admin";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import {
  AUDIT_ACTIONS,
  AUDIT_ACTION_LABELS,
  AUDIT_TARGET_TYPES,
  AUDIT_TARGET_LABELS,
  getAuditActionLabel,
  getAuditTargetLabel,
} from "@/lib/audit";
import {
  formatTehranPersianDateTime,
  persianDateToTehranIso,
} from "@/lib/persian-date";

export default function AdminAuditPage() {
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [actorQuery, setActorQuery] = useState("");
  const [targetId, setTargetId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminAuditItem[]>([]);
  const [pagination, setPagination] =
    useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fromIso = persianDateToTehranIso(from);
  const toIso = persianDateToTehranIso(to, true);
  const datesAreValid = fromIso !== null && toIso !== null;

  useEffect(() => {
    if (!datesAreValid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getAdminAuditApi({
      action,
      targetType,
      actorQuery,
      targetId,
      from: fromIso,
      to: toIso,
      page,
    })
      .then((result) => {
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch((reason) => {
        setError(
          reason instanceof Error
            ? reason.message
            : "Audit قابل دریافت نیست.",
        );
      })
      .finally(() => setLoading(false));
  }, [
    action,
    targetType,
    actorQuery,
    targetId,
    fromIso,
    toIso,
    datesAreValid,
    page,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    action,
    targetType,
    actorQuery,
    targetId,
    from,
    to,
  ]);

  const resetFilters = () => {
    setAction("");
    setTargetType("");
    setActorQuery("");
    setTargetId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = Boolean(
    action ||
      targetType ||
      actorQuery ||
      targetId ||
      from ||
      to,
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="گزارش تغییرات"
        description="تاریخچه عملیات مدیریتی و تغییرات حساس سیستم."
      />

      <AdminFilterBar
        onReset={resetFilters}
        hasActiveFilters={hasFilters}
      >
        <select
          value={action}
          onChange={(event) =>
            setAction(
              event.target.value,
            )
          }
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none xl:w-[190px]"
        >
          <option value="">همه عملیات‌ها</option>
          {AUDIT_ACTIONS.map((item) => (
            <option key={item} value={item}>
              {AUDIT_ACTION_LABELS[item]}
            </option>
          ))}
        </select>
        <input
          value={actorQuery}
          onChange={(event) =>
            setActorQuery(
              event.target.value,
            )
          }
          placeholder="نام، موبایل یا شناسه عامل"
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none xl:w-[220px]"
        />
        <select
          value={targetType}
          onChange={(event) =>
            setTargetType(
              event.target.value,
            )
          }
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs xl:w-[190px]"
        >
          <option value="">
            همه هدف‌ها
          </option>
          {AUDIT_TARGET_TYPES.map((item) => (
            <option key={item} value={item}>
              {AUDIT_TARGET_LABELS[item]}
            </option>
          ))}
        </select>
        <input
          value={targetId}
          onChange={(event) =>
            setTargetId(
              event.target.value,
            )
          }
          placeholder="شناسه هدف"
          className="font-ui h-10 rounded-control border border-border bg-background px-3 text-xs outline-none xl:w-[220px]"
        />
        <PersianDateFilter
          label="از تاریخ"
          value={from}
          onChange={setFrom}
          invalid={fromIso === null}
        />
        <PersianDateFilter
          label="تا تاریخ"
          value={to}
          onChange={setTo}
          invalid={toIso === null}
        />
      </AdminFilterBar>

      {!datesAreValid ? (
        <p className="font-ui text-xs text-error">
          تاریخ را با قالب شمسی ۱۴۰۵/۰۶/۰۳ وارد کنید.
        </p>
      ) : null}

      {error ? (
        <div className="rounded-card border border-error/20 bg-error/[0.04] p-4 font-ui text-sm text-error">
          {error}
        </div>
      ) : loading ? (
        <AdminTableSkeleton rows={7} />
      ) : items.length ? (
        <>
          <div className="hidden overflow-hidden rounded-card border border-border bg-surface shadow-binix-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-right">
                <thead className="bg-surface-raised/70">
                  <tr className="font-ui text-[11px] text-foreground-subtle">
                    <th className="px-4 py-3 font-medium">
                      زمان
                    </th>
                    <th className="px-4 py-3 font-medium">
                      عملیات
                    </th>
                    <th className="px-4 py-3 font-medium">
                      عامل
                    </th>
                    <th className="px-4 py-3 font-medium">
                      هدف
                    </th>
                    <th className="px-4 py-3 font-medium">
                      جزئیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-t border-border-subtle align-top font-ui text-xs transition hover:bg-surface-hover/40"
                      >
                        <td className="px-4 py-3 text-foreground-muted">
                          {formatTehranPersianDateTime(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge>
                            {getAuditActionLabel(item.action)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          <div>{getAuditActorTitle(item)}</div>
                          <div dir="ltr" className="mt-1 text-right text-[10px]">
                            {getAuditActorSubtitle(item)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground-muted">
                          <div>
                            {getAuditTargetLabel(item.targetType)}
                          </div>
                          <div
                            dir="ltr"
                            className="mt-1 text-right text-[10px]"
                          >
                            {item.targetId ||
                              "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <AuditMetadata metadata={item.metadata} />
                          <AuditRequestContext item={item} />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-card border border-border bg-surface p-4 shadow-binix-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Badge>
                    {getAuditActionLabel(item.action)}
                  </Badge>
                  <span className="font-ui text-[10px] text-foreground-subtle">
                    {formatTehranPersianDateTime(item.createdAt)}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <AuditField
                    label="عامل"
                    value={
                      `${getAuditActorTitle(item)} — ${getAuditActorSubtitle(item)}`
                    }
                  />
                  <AuditField
                    label="هدف"
                    value={`${getAuditTargetLabel(item.targetType)} / ${item.targetId || "—"}`}
                  />
                </div>

                <div className="mt-3">
                  <AuditMetadata metadata={item.metadata} />
                </div>
                <AuditRequestContext item={item} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-card border border-border bg-surface">
          <AdminEmptyState
            title="رویدادی پیدا نشد"
            description={
              hasFilters
                ? "فیلترهای فعلی نتیجه‌ای ندارند."
                : "هنوز عملیات مدیریتی ثبت نشده است."
            }
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
          label="رویداد"
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

function AuditRequestContext({
  item,
}: {
  item: AdminAuditItem;
}) {
  if (!item.requestId && !item.ipAddress) return null;

  return (
    <div className="mt-2 space-y-1 font-ui text-[10px] text-foreground-subtle">
      {item.requestId ? (
        <div dir="ltr" className="break-all text-right">
          شناسه درخواست: {item.requestId}
        </div>
      ) : null}
      {item.ipAddress ? (
        <div dir="ltr" className="text-right">
          نشانی IP: {item.ipAddress}
        </div>
      ) : null}
    </div>
  );
}

function PersianDateFilter({
  label,
  value,
  onChange,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  return (
    <label className="relative block xl:w-[180px]">
      <span className="pointer-events-none absolute right-3 top-1 font-ui text-[9px] text-foreground-subtle">
        {label}
      </span>
      <input
        type="text"
        inputMode="numeric"
        dir="ltr"
        aria-label={label}
        aria-invalid={invalid}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="۱۴۰۵/۰۶/۰۳"
        className={`font-ui h-12 w-full rounded-control border bg-background px-3 pt-3 text-right text-xs outline-none transition ${
          invalid
            ? "border-error focus:border-error"
            : "border-border focus:border-primary"
        }`}
      />
    </label>
  );
}

function getAuditActorTitle(item: AdminAuditItem) {
  return item.actor?.name?.trim() || item.actor?.phone || "عامل ناشناس";
}

function getAuditActorSubtitle(item: AdminAuditItem) {
  if (item.actor?.name?.trim() && item.actor.phone) return item.actor.phone;
  return item.actorUserId;
}

const METADATA_LABELS: Record<string, string> = {
  name: "نام",
  slug: "اسلاگ",
  status: "وضعیت",
  visibility: "سطح نمایش",
  role: "نقش",
  businessId: "شناسه کسب‌وکار",
  serviceId: "شناسه سرویس",
  userId: "شناسه کاربر",
  memberId: "شناسه عضویت",
  ownerMemberId: "شناسه عضویت مالک",
  ownerUserId: "شناسه کاربری مالک",
  previousStatus: "وضعیت قبلی",
  planCode: "کد پلن",
  planName: "نام پلن",
  priceAmount: "مبلغ ریالی",
};

const METADATA_VALUE_LABELS: Record<string, string> = {
  active: "فعال",
  suspended: "تعلیق‌شده",
  paused: "متوقف",
  setup: "در حال راه‌اندازی",
  "coming-soon": "به‌زودی",
  public: "عمومی",
  private: "خصوصی",
  owner: "مالک",
  admin: "مدیر",
  member: "عضو",
  "super-admin": "مدیر کل",
  support: "پشتیبانی",
  finance: "مالی",
  user: "کاربر",
  pending: "در انتظار",
  trialing: "آزمایشی",
  "past-due": "سررسید گذشته",
  canceled: "لغوشده",
  expired: "منقضی",
};

function auditMetadataLabel(key: string) {
  return METADATA_LABELS[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function auditMetadataValue(value: string | number | boolean | null) {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  return METADATA_VALUE_LABELS[String(value)] || String(value);
}

function AuditMetadata({
  metadata,
}: {
  metadata: AdminAuditItem["metadata"];
}) {
  const handled = new Set<string>();
  const changes: Array<{
    key: string;
    before: AdminAuditItem["metadata"][string];
    after: AdminAuditItem["metadata"][string];
  }> = [];

  Object.keys(metadata).forEach((key) => {
    if (!key.startsWith("before")) return;

    const suffix = key.slice("before".length);
    const afterKey = `after${suffix}`;
    if (!(afterKey in metadata)) return;

    handled.add(key);
    handled.add(afterKey);

    if (metadata[key] !== metadata[afterKey]) {
      const normalizedKey = `${suffix.charAt(0).toLowerCase()}${suffix.slice(1)}`;
      changes.push({
        key: normalizedKey,
        before: metadata[key],
        after: metadata[afterKey],
      });
    }
  });

  const details = Object.entries(metadata).filter(([key]) => !handled.has(key));

  if (!changes.length && !details.length) {
    return (
      <div className="max-w-[420px] rounded-control border border-border-subtle bg-surface-raised/60 p-3 font-ui text-[11px] text-foreground-muted">
        تغییری در فیلدهای اصلی ایجاد نشد.
      </div>
    );
  }

  return (
    <div className="max-w-[420px] space-y-2">
      {changes.map((change) => (
        <div
          key={change.key}
          className="rounded-control border border-border-subtle bg-surface-raised/60 p-2.5"
        >
          <div className="font-ui text-[10px] text-foreground-subtle">
            {auditMetadataLabel(change.key)}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-ui text-[11px]">
            <span dir="ltr" className="text-foreground-muted">
              {auditMetadataValue(change.before)}
            </span>
            <span aria-hidden="true" className="text-primary">←</span>
            <span dir="ltr" className="text-foreground">
              {auditMetadataValue(change.after)}
            </span>
          </div>
        </div>
      ))}

      {details.map(([key, value]) => (
        <div
          key={key}
          className="grid grid-cols-[minmax(90px,auto)_1fr] gap-3 rounded-control bg-surface-raised/60 p-2.5 font-ui text-[11px]"
        >
          <span className="text-foreground-subtle">
            {auditMetadataLabel(key)}
          </span>
          <span dir="ltr" className="break-all text-right text-foreground-muted">
            {auditMetadataValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function AuditField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control bg-surface-raised/60 p-2.5">
      <div className="font-ui text-[10px] text-foreground-subtle">
        {label}
      </div>
      <div
        dir="ltr"
        className="mt-1 break-all text-right font-ui text-[11px] text-foreground-muted"
      >
        {value}
      </div>
    </div>
  );
}
