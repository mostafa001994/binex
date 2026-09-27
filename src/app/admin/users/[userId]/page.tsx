"use client";

import Link from "next/link";
import {
  use,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { ArrowRight, Pencil } from "lucide-react";
import {
  getAdminUserApi,
  getAdminAccessRolesApi,
  revokeAdminUserSessionsApi,
  updateAdminUserStatusApi,
  updateAdminUserRoleApi,
  updateAdminUserIdentityApi,
  type AdminAccessRole,
  type AdminUser,
} from "@/lib/api-client/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getAdminUserApi>
    > | null>(null);
  const [error, setError] =
    useState("");
  const [saving, setSaving] =
    useState(false);
  const [roles, setRoles] = useState<AdminAccessRole[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [identity, setIdentity] = useState({ name: "", email: "" });
  const [securityAction, setSecurityAction] = useState<"block" | "activate" | "revoke" | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError("");
      setData(
        await getAdminUserApi(userId),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "اطلاعات کاربر قابل دریافت نیست.",
      );
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    getAdminAccessRolesApi().then((result) => setRoles(result.roles)).catch(() => undefined);
  }, []);

  async function changeRole(
    accessRoleId: string,
  ) {
    if (!data) return;

    setSaving(true);

    try {
      await updateAdminUserRoleApi(
        userId,
        accessRoleId,
      );
      toast.success(
        "نقش کاربر به‌روزرسانی شد",
      );
      await refresh();
    } catch (reason) {
      toast.error(
        "تغییر نقش انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: AdminUser["status"]) {
    if (!data) return;
    setSaving(true);
    try {
      const result = await updateAdminUserStatusApi(userId, status);
      toast.success(status === "blocked" ? "حساب کاربر مسدود شد" : "حساب کاربر فعال شد", {
        description: `${result.revokedSessions.toLocaleString("fa-IR")} نشست بسته شد.`,
      });
      await refresh();
    } catch (reason) {
      toast.error("تغییر وضعیت حساب انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(false); }
  }

  async function revokeSessions() {
    if (!data) return;
    setSaving(true);
    try {
      const result = await revokeAdminUserSessionsApi(userId);
      toast.success("نشست‌های کاربر بسته شدند", { description: `${result.revokedSessions.toLocaleString("fa-IR")} نشست فعال بسته شد.` });
      await refresh();
    } catch (reason) {
      toast.error("بستن نشست‌ها انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(false); }
  }

  function beginIdentityEdit() {
    if (!data) return;
    setIdentity({ name: data.user.name ?? "", email: data.user.email ?? "" });
    setEditOpen(true);
  }

  async function saveIdentity() {
    setSaving(true);
    try {
      await updateAdminUserIdentityApi(userId, identity);
      toast.success("اطلاعات کاربر به‌روزرسانی شد");
      setEditOpen(false); await refresh();
    } catch (reason) {
      toast.error("ویرایش کاربر انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(false); }
  }

  if (error) {
    return (
      <Card className="text-center">
        <p className="font-ui text-sm text-error">
          {error}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() =>
            void refresh()
          }
        >
          تلاش مجدد
        </Button>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="h-48 animate-pulse rounded-card bg-surface-raised" />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 font-ui text-xs text-foreground-muted hover:text-foreground"
      >
        <ArrowRight size={14} />
        بازگشت به کاربران
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              data-display-title="true"
              className="text-2xl font-bold"
            >
              {data.user.name ||
                "کاربر بدون نام"}
            </h1>
            <p
              dir="ltr"
              className="mt-1 text-right font-ui text-sm text-foreground-muted"
            >
              {data.user.phone}
            </p>
            {data.user.email ? <p dir="ltr" className="mt-1 text-right font-ui text-xs text-foreground-subtle">{data.user.email}</p> : null}
          </div>
          <Badge
            variant={
              data.user.role ===
              "super-admin"
                ? "warning"
                : data.user.role ===
                    "admin"
                  ? "success"
                  : "default"
            }
          >
            {data.user.accessRole.name}
          </Badge>
          <Badge variant={data.user.status === "active" ? "success" : "error"}>{data.user.status === "active" ? "حساب فعال" : "حساب مسدود"}</Badge>
          {data.canManageIdentity ? <Button variant="secondary" leadingIcon={<Pencil size={14}/>} onClick={beginIdentityEdit}>ویرایش اطلاعات</Button> : null}
        </div>

        {data.canManageRole && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
            {roles.map((role) => (
              <Button
                key={role.id}
                type="button"
                variant={
                  data.user.accessRole.id === role.id
                    ? "primary"
                    : "secondary"
                }
                disabled={
                  saving ||
                  data.user.accessRole.id === role.id
                }
                onClick={() =>
                  void changeRole(role.id)
                }
              >
                {role.name}
              </Button>
            ))}
          </div>
        )}
      </Card>

      <Modal open={editOpen} onClose={() => !saving && setEditOpen(false)} title="ویرایش اطلاعات کاربر" description="شماره موبایل شناسه ورود است و از این بخش تغییر نمی‌کند." footer={<div className="flex gap-2"><Button loading={saving} onClick={() => void saveIdentity()}>ذخیره</Button><Button variant="secondary" disabled={saving} onClick={() => setEditOpen(false)}>انصراف</Button></div>}>
        <div className="grid gap-4 font-ui sm:grid-cols-2"><label className="text-xs">نام و نام خانوادگی<input value={identity.name} onChange={(event) => setIdentity({...identity,name:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label><label className="text-xs">ایمیل<input dir="ltr" type="email" value={identity.email} onChange={(event) => setIdentity({...identity,email:event.target.value})} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left"/></label></div>
      </Modal>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 data-display-title="true" className="text-lg font-bold">امنیت حساب</h2><p className="mt-1 font-ui text-xs text-foreground-muted">نشست‌های فعال: {data.activeSessionCount.toLocaleString("fa-IR")}</p></div>
          {data.canManageSecurity ? <div className="flex flex-wrap gap-2">
            {data.user.status === "active" ? <Button variant="danger" loading={saving} onClick={() => setSecurityAction("block")}>مسدود کردن حساب</Button> : <Button loading={saving} onClick={() => setSecurityAction("activate")}>فعال کردن حساب</Button>}
            <Button variant="secondary" loading={saving} disabled={data.activeSessionCount === 0} onClick={() => setSecurityAction("revoke")}>خروج از همه دستگاه‌ها</Button>
          </div> : null}
        </div>
        {!data.canManageSecurity ? <p className="mt-3 font-ui text-xs text-foreground-subtle">به‌دلایل امنیتی، تغییر وضعیت حساب خودتان یا حساب super-admin از این بخش مجاز نیست.</p> : null}
      </Card>

      <Card>
        <h2
          data-display-title="true"
          className="text-lg font-bold"
        >
          کسب‌وکارهای مرتبط
        </h2>

        <div className="mt-4 divide-y divide-border-subtle">
          {data.businesses.length ? (
            data.businesses.map(
              (item) => (
                <Link
                  key={
                    item.membership.id
                  }
                  href={`/admin/businesses/${item.business.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="font-ui text-xs font-semibold">
                      {
                        item.business
                          .name
                      }
                    </div>
                    <div className="mt-1 font-ui text-[10px] text-foreground-subtle">
                      {item.membership
                        .role === "owner"
                        ? "مالک"
                        : "عضو"}
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.business
                        .status ===
                      "active"
                        ? "success"
                        : "error"
                    }
                  >
                    {item.business
                      .status ===
                    "active"
                      ? "فعال"
                      : "تعلیق"}
                  </Badge>
                </Link>
              ),
            )
          ) : (
            <p className="font-ui text-sm text-foreground-muted">
              کسب‌وکاری برای این کاربر ثبت نشده.
            </p>
          )}
        </div>
      </Card>
      <ConfirmDialog
        open={Boolean(securityAction)}
        onClose={() => setSecurityAction(null)}
        onConfirm={() => {
          const action = securityAction;
          setSecurityAction(null);
          if (action === "block") void changeStatus("blocked");
          else if (action === "activate") void changeStatus("active");
          else if (action === "revoke") void revokeSessions();
        }}
        title={securityAction === "block" ? "مسدودکردن حساب" : securityAction === "activate" ? "فعال‌کردن حساب" : "خروج از همه دستگاه‌ها"}
        description={`این عملیات روی حساب ${data.user.name || data.user.phone} اعمال می‌شود.`}
        consequences={securityAction === "block" ? ["ورود کاربر مسدود می‌شود.", "تمام نشست‌های فعال او بسته می‌شوند.", "این تغییر در گزارش تغییرات ثبت می‌شود."] : securityAction === "activate" ? ["کاربر دوباره اجازه ورود خواهد داشت.", "برای ورود باید نشست جدید ایجاد کند."] : [`${data.activeSessionCount.toLocaleString("fa-IR")} نشست فعال بسته خواهد شد.`, "کاربر باید دوباره وارد حساب شود."]}
        confirmLabel={securityAction === "block" ? "مسدودکردن" : securityAction === "activate" ? "فعال‌کردن" : "خروج از دستگاه‌ها"}
        tone={securityAction === "block" ? "danger" : "warning"}
      />
    </div>
  );
}
