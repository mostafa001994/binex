"use client";

import Link from "next/link";
import {
  use,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Crown,
  Archive,
  Pencil,
  RotateCcw,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  assignAdminBusinessServiceApi,
  getAdminBusinessApi,
  removeAdminBusinessServiceApi,
  updateAdminBusinessServiceApi,
  updateAdminBusinessStatusApi,
  addAdminBusinessMemberApi,
  removeAdminBusinessMemberApi,
  transferAdminBusinessOwnershipApi,
  archiveAdminBusinessApi,
  restoreAdminBusinessApi,
  updateAdminBusinessProfileApi,
} from "@/lib/api-client/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAdminSession } from "@/components/admin/admin-gate";
import { hasAdminPermission } from "@/lib/admin-permissions";

type Status =
  | "setup"
  | "active"
  | "paused"
  | "coming-soon";

export default function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{
    businessId: string;
  }>;
}) {
  const { businessId } = use(params);
  const { user: actor } = useAdminSession();
  const canManage = hasAdminPermission(actor.permissions, "admin.businesses.manage");

  const [data, setData] =
    useState<Awaited<
      ReturnType<typeof getAdminBusinessApi>
    > | null>(null);
  const [error, setError] =
    useState("");
  const [saving, setSaving] =
    useState<string | null>(null);
  const [confirmBusinessStatus, setConfirmBusinessStatus] =
    useState<
      "active" | "suspended" | null
    >(null);
  const [pendingRemove, setPendingRemove] =
    useState<{
      serviceId: string;
      serviceName: string;
    } | null>(null);
  const [newMemberUserId, setNewMemberUserId] =
    useState("");
  const [memberBusy, setMemberBusy] =
    useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({ name: "", phone: "", category: "" });

  const refresh =
    useCallback(async () => {
      try {
        setError("");
        setData(
          await getAdminBusinessApi(
            businessId,
          ),
        );
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "اطلاعات کسب‌وکار قابل دریافت نیست.",
        );
      }
    }, [businessId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function changeBusinessStatus(
    status: "active" | "suspended",
  ) {
    setSaving("business-status");

    try {
      await updateAdminBusinessStatusApi(
        businessId,
        status,
      );
      await refresh();
      toast.success(
        "وضعیت کسب‌وکار بروزرسانی شد",
      );
    } catch (reason) {
      toast.error(
        "تغییر وضعیت انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setSaving(null);
      setConfirmBusinessStatus(
        null,
      );
    }
  }

  function openEdit() {
    if (!data) return;
    setEditDraft({ name: data.business.name, phone: data.business.phone ?? "", category: data.business.category ?? "" });
    setEditOpen(true);
  }

  async function saveProfile() {
    setSaving("profile");
    try {
      await updateAdminBusinessProfileApi(businessId, editDraft);
      await refresh(); setEditOpen(false);
      toast.success("مشخصات کسب‌وکار بروزرسانی شد");
    } catch (reason) {
      toast.error("ویرایش انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(null); }
  }

  async function archiveBusiness() {
    setSaving("archive");
    try {
      await archiveAdminBusinessApi(businessId);
      await refresh(); setArchiveOpen(false);
      toast.success("کسب‌وکار آرشیو شد");
    } catch (reason) {
      toast.error("آرشیو انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(null); }
  }

  async function restoreBusiness() {
    setSaving("restore");
    try {
      await restoreAdminBusinessApi(businessId);
      await refresh();
      toast.success("کسب‌وکار با وضعیت تعلیق‌شده بازیابی شد");
    } catch (reason) {
      toast.error("بازیابی انجام نشد", { description: reason instanceof Error ? reason.message : undefined });
    } finally { setSaving(null); }
  }

  async function assignService(
    serviceId: string,
  ) {
    setSaving(serviceId);

    try {
      await assignAdminBusinessServiceApi(
        businessId,
        serviceId,
      );
      await refresh();
      toast.success(
        "سرویس تخصیص داده شد",
      );
    } catch (reason) {
      toast.error(
        "تخصیص سرویس انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setSaving(null);
    }
  }

  async function changeStatus(
    serviceId: string,
    status: Status,
  ) {
    setSaving(serviceId);

    try {
      await updateAdminBusinessServiceApi(
        businessId,
        serviceId,
        status,
      );
      await refresh();
      toast.success(
        "وضعیت سرویس بروزرسانی شد",
      );
    } catch (reason) {
      toast.error(
        "تغییر وضعیت انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setSaving(null);
    }
  }

  async function removeService() {
    if (!pendingRemove) return;

    setSaving(
      pendingRemove.serviceId,
    );

    try {
      await removeAdminBusinessServiceApi(
        businessId,
        pendingRemove.serviceId,
      );
      await refresh();
      toast.success("سرویس حذف شد");
    } catch (reason) {
      toast.error(
        "حذف سرویس انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setSaving(null);
      setPendingRemove(null);
    }
  }

  if (error) {
    return (
      <Card className="text-center">
        <h1
          data-display-title="true"
          className="text-xl font-bold"
        >
          دریافت اطلاعات انجام نشد
        </h1>
        <p className="mt-2 font-ui text-sm text-foreground-muted">
          {error}
        </p>
        <Button
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

  async function addMember() {
    if (!data || !newMemberUserId.trim()) return;

    setMemberBusy(true);
    try {
      await addAdminBusinessMemberApi(
        data.business.id,
        {
          userId:
            newMemberUserId.trim(),
          role: "member",
        },
      );
      setNewMemberUserId("");
      toast.success(
        "عضو اضافه شد",
      );
      await refresh();
    } catch (reason) {
      toast.error(
        "افزودن عضو انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setMemberBusy(false);
    }
  }

  async function removeMember(
    memberId: string,
  ) {
    if (!data) return;

    setMemberBusy(true);
    try {
      await removeAdminBusinessMemberApi(
        data.business.id,
        memberId,
      );
      toast.success(
        "عضو حذف شد",
      );
      await refresh();
    } catch (reason) {
      toast.error(
        "حذف عضو انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setMemberBusy(false);
    }
  }

  async function transferOwnership(
    memberId: string,
  ) {
    if (!data) return;

    setMemberBusy(true);
    try {
      await transferAdminBusinessOwnershipApi(
        data.business.id,
        memberId,
      );
      toast.success(
        "مالکیت منتقل شد",
      );
      await refresh();
    } catch (reason) {
      toast.error(
        "انتقال مالکیت انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setMemberBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            data-display-title="true"
            className="text-2xl font-bold"
          >
            {data.business.name}
          </h1>
          <p
            dir="ltr"
            className="mt-1 text-right font-ui text-xs text-foreground-muted"
          >
            {data.business.phone ||
              data.business.id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              data.business.status === "active"
                ? "success"
                : data.business.status === "suspended" ? "error" : "warning"
            }
          >
            {data.business.status === "active" ? "فعال" : data.business.status === "suspended" ? "تعلیق" : "آرشیوشده"}
          </Badge>

          {canManage && data.business.status !== "archived" ? <Button variant="secondary" leadingIcon={<Pencil size={14}/>} onClick={openEdit}>ویرایش مشخصات</Button> : null}

          {canManage && data.business.status !== "archived" ? <Button
            variant="secondary"
            onClick={() =>
              setConfirmBusinessStatus(
                data.business.status ===
                  "active"
                  ? "suspended"
                  : "active",
              )
            }
          >
            {data.business.status ===
            "active"
              ? "تعلیق کسب‌وکار"
              : "فعال‌سازی مجدد"}
          </Button> : null}

          {canManage && data.business.status !== "archived" ? <Button variant="danger" leadingIcon={<Archive size={14}/>} onClick={() => setArchiveOpen(true)}>آرشیو</Button> : null}
          {canManage && data.business.status === "archived" ? <Button loading={saving === "restore"} leadingIcon={<RotateCcw size={14}/>} onClick={() => void restoreBusiness()}>بازیابی</Button> : null}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CommerceStat label="کل اشتراک‌ها" value={data.commerce.counts.subscriptions} href={`/admin/subscriptions?search=${encodeURIComponent(data.business.name)}`} />
        <CommerceStat label="اشتراک عملیاتی" value={data.commerce.counts.activeSubscriptions} href={`/admin/subscriptions?search=${encodeURIComponent(data.business.name)}`} />
        <CommerceStat label="کل سفارش‌ها" value={data.commerce.counts.orders} href={`/admin/orders?search=${encodeURIComponent(data.business.name)}`} />
        <CommerceStat label="در انتظار پرداخت" value={data.commerce.counts.pendingOrders} href={`/admin/orders?search=${encodeURIComponent(data.business.name)}`} />
      </section>

      {data.business.status === "archived" ? <Card className="border-warning/25 bg-warning/[0.04]"><p className="font-ui text-sm text-warning">این کسب‌وکار آرشیو است؛ ویرایش اعضا، سرویس‌ها و وضعیت آن تا زمان بازیابی غیرفعال است.</p></Card> : null}

      <Card data-admin-form-root>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              data-display-title="true"
              className="text-lg font-bold"
            >
              مدیریت اعضا
            </h2>
            <p className="mt-1 font-ui text-xs text-foreground-subtle">
              افزودن عضو، حذف عضو و انتقال مالکیت کسب‌وکار.
            </p>
          </div>

          <div className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
            <input
              required
              data-field-label="شناسه کاربر عضو جدید"
              value={newMemberUserId}
              onChange={(event) =>
                setNewMemberUserId(
                  event.target.value,
                )
              }
              placeholder="شناسه کاربر عضو جدید"
              className="font-ui h-10 min-w-0 flex-1 rounded-control border border-border bg-background px-3 text-xs outline-none transition focus:border-primary/40"
            />
            <Button
              loading={memberBusy}
              disabled={
                data.business.status === "archived" || !canManage
              }
              leadingIcon={
                <UserPlus size={15} />
              }
              onClick={() =>
                void addMember()
              }
            >
              افزودن
            </Button>
          </div>
        </div>

        <div className="mt-5 divide-y divide-border-subtle">
          {data.members.map(
            (member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-ui text-xs font-semibold">
                    {member.user
                      ?.name ||
                      "کاربر بدون نام"}
                  </div>
                  <div
                    dir="ltr"
                    className="mt-1 text-right font-ui text-[10px] text-foreground-subtle"
                  >
                    {member.user
                      ?.phone ||
                      member.userId}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {member.role ===
                  "owner" ? (
                    <Badge variant="warning">
                      مالک
                    </Badge>
                  ) : (
                    <>
                      <Badge>
                        عضو
                      </Badge>

                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={
                          memberBusy || data.business.status === "archived" || !canManage
                        }
                        leadingIcon={
                          <Crown
                            size={14}
                          />
                        }
                        onClick={() =>
                          void transferOwnership(
                            member.id,
                          )
                        }
                      >
                        انتقال مالکیت
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        disabled={
                          memberBusy || data.business.status === "archived" || !canManage
                        }
                        leadingIcon={
                          <UserMinus
                            size={14}
                          />
                        }
                        onClick={() =>
                          void removeMember(
                            member.id,
                          )
                        }
                      >
                        حذف عضو
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      {data.salesAgentCredentials && (
        <Card>
          <h2
            data-display-title="true"
            className="text-lg font-bold"
          >
            وضعیت اتصال فروشنده هوشمند
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CredentialStatus
              label="توکن بات بله"
              configured={
                data
                  .salesAgentCredentials
                  .baleBotTokenConfigured
              }
            />
            <CredentialStatus
              label="توکن ووکامرس"
              configured={
                data
                  .salesAgentCredentials
                  .woocommerceTokenConfigured
              }
            />
          </div>
          <p className="mt-3 font-ui text-[10px] text-foreground-subtle">
            مقدار Token برای Admin نمایش داده نمی‌شود.
          </p>
        </Card>
      )}

      <section>
        <h2
          data-display-title="true"
          className="text-lg font-bold"
        >
          سرویس‌ها
        </h2>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {data.services.map(
            ({ definition, state }) => (
              <Card
                key={definition.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-ui text-[10px] text-foreground-subtle">
                      {
                        definition.category
                      }
                    </div>
                    <h3
                      data-display-title="true"
                      className="mt-1 text-base font-bold"
                    >
                      {definition.name}
                    </h3>
                  </div>

                  {state ? (
                    <ServiceStatus
                      status={
                        state.status
                      }
                    />
                  ) : (
                    <Badge>
                      تخصیص داده نشده
                    </Badge>
                  )}
                </div>

                <p className="mt-3 font-ui text-xs leading-6 text-foreground-muted">
                  {
                    definition.description
                  }
                </p>

                {state ? (
                  <>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {(
                        [
                          "setup",
                          "active",
                          "paused",
                        ] as Status[]
                      ).map(
                        (status) => (
                          <button
                            key={
                              status
                            }
                            type="button"
                            disabled={
                              saving ===
                                definition.id ||
                              data.business.status === "archived" ||
                              !canManage ||
                              state.status ===
                                "coming-soon" ||
                              state.status ===
                                status ||
                              definition.availability ===
                                "coming-soon"
                            }
                            onClick={() =>
                              void changeStatus(
                                definition.id,
                                status,
                              )
                            }
                            className="font-ui h-9 rounded-control border border-border bg-surface-raised px-2 text-[10px] text-foreground-muted transition hover:border-primary/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {status ===
                            "setup"
                              ? "راه‌اندازی"
                              : status ===
                                  "active"
                                ? "فعال"
                                : "توقف"}
                          </button>
                        ),
                      )}
                    </div>

                    {definition.availability !==
                      "coming-soon" && (
                      <Button
                        type="button"
                        variant="danger"
                        disabled={data.business.status === "archived" || !canManage}
                        className="mt-3 w-full"
                        onClick={() =>
                          setPendingRemove(
                            {
                              serviceId:
                                definition.id,
                              serviceName:
                                definition.name,
                            },
                          )
                        }
                      >
                        حذف سرویس از کسب‌وکار
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={
                      definition.availability ===
                        "coming-soon" || data.business.status === "archived" || !canManage
                    }
                    loading={
                      saving ===
                      definition.id
                    }
                    onClick={() =>
                      void assignService(
                        definition.id,
                      )
                    }
                  >
                    {definition.availability ===
                      "coming-soon"
                      ? "به‌زودی"
                      : "تخصیص سرویس"}
                  </Button>
                )}
              </Card>
            ),
          )}
        </div>
      </section>

      <Modal
        open={Boolean(
          confirmBusinessStatus,
        )}
        onClose={() =>
          setConfirmBusinessStatus(
            null,
          )
        }
        title={
          confirmBusinessStatus ===
          "suspended"
            ? "تعلیق کسب‌وکار"
            : "فعال‌سازی کسب‌وکار"
        }
        description={
          confirmBusinessStatus ===
          "suspended"
            ? "تعلیق کسب‌وکار یک عملیات مدیریتی مهم است و در گزارش تغییرات ثبت می‌شود."
            : "دسترسی کسب‌وکار دوباره فعال می‌شود."
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setConfirmBusinessStatus(
                  null,
                )
              }
            >
              انصراف
            </Button>
            <Button
              variant={
                confirmBusinessStatus ===
                "suspended"
                  ? "danger"
                  : "primary"
              }
              loading={
                saving ===
                "business-status"
              }
              onClick={() => {
                if (
                  confirmBusinessStatus
                ) {
                  void changeBusinessStatus(
                    confirmBusinessStatus,
                  );
                }
              }}
            >
              تایید
            </Button>
          </div>
        }
      >
        <p className="font-ui text-sm leading-6 text-foreground-muted">
          {confirmBusinessStatus === "suspended"
            ? "با تأیید، دسترسی این کسب‌وکار متوقف می‌شود."
            : "با تأیید، دسترسی این کسب‌وکار دوباره فعال می‌شود."}
        </p>
      </Modal>

      <Modal open={editOpen} onClose={() => saving !== "profile" && setEditOpen(false)} title="ویرایش مشخصات کسب‌وکار" description="این اطلاعات در پنل کاربر و عملیات مدیریتی استفاده می‌شود." footer={<div className="flex gap-2"><Button loading={saving === "profile"} onClick={() => void saveProfile()}>ذخیره تغییرات</Button><Button variant="secondary" disabled={saving === "profile"} onClick={() => setEditOpen(false)}>انصراف</Button></div>}>
        <div className="grid gap-4 font-ui sm:grid-cols-2">
          <label className="text-xs">نام کسب‌وکار<input required data-field-label="نام کسب‌وکار" value={editDraft.name} onChange={(event) => setEditDraft((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label>
          <label className="text-xs">شماره تماس<input dir="ltr" inputMode="numeric" value={editDraft.phone} onChange={(event) => setEditDraft((current) => ({ ...current, phone: event.target.value }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3 text-left"/></label>
          <label className="text-xs sm:col-span-2">دسته‌بندی<input value={editDraft.category} onChange={(event) => setEditDraft((current) => ({ ...current, category: event.target.value }))} className="mt-2 h-10 w-full rounded-control border border-border bg-background px-3"/></label>
        </div>
      </Modal>

      <Modal open={archiveOpen} onClose={() => saving !== "archive" && setArchiveOpen(false)} title="آرشیو کسب‌وکار" description="حذف دائمی انجام نمی‌شود و سابقه مالی و عملیاتی حفظ خواهد شد." footer={<div className="flex gap-2"><Button variant="danger" loading={saving === "archive"} onClick={() => void archiveBusiness()}>آرشیو امن</Button><Button variant="secondary" disabled={saving === "archive"} onClick={() => setArchiveOpen(false)}>انصراف</Button></div>}>
        <p className="font-ui text-sm leading-7 text-foreground-muted">اگر اشتراک باز یا عملیات راه‌اندازی در جریان وجود داشته باشد، سرور آرشیو را متوقف می‌کند. برای ادامه باید ابتدا آن موارد تعیین تکلیف شوند.</p>
      </Modal>

      <Modal
        open={Boolean(
          pendingRemove,
        )}
        onClose={() =>
          setPendingRemove(null)
        }
        title="حذف سرویس"
        description={
          pendingRemove
            ? `سرویس «${pendingRemove.serviceName}» از این کسب‌وکار حذف می‌شود.`
            : ""
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setPendingRemove(null)
              }
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              loading={Boolean(
                pendingRemove &&
                  saving ===
                    pendingRemove.serviceId,
              )}
              onClick={() =>
                void removeService()
              }
            >
              حذف سرویس
            </Button>
          </div>
        }
      >
        <p className="font-ui text-sm leading-6 text-foreground-muted">
          این عملیات دسترسی کسب‌وکار به سرویس انتخاب‌شده را حذف می‌کند و در گزارش تغییرات ثبت می‌شود.
        </p>
      </Modal>
    </div>
  );
}

function CommerceStat({ label, value, href }: { label: string; value: number; href: string }) {
  return <Link href={href} className="rounded-card border border-border bg-surface p-4 shadow-binix-sm transition hover:border-primary/25"><div className="font-ui text-xs text-foreground-muted">{label}</div><div className="mt-2 font-ui text-xl font-bold">{value.toLocaleString("fa-IR")}</div><div className="mt-3 font-ui text-[10px] text-primary">مشاهده جزئیات ←</div></Link>;
}

function CredentialStatus({
  label,
  configured,
}: {
  label: string;
  configured: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-control border border-border-subtle bg-surface-raised/40 px-3 py-3">
      <span className="font-ui text-xs">
        {label}
      </span>
      <Badge
        variant={
          configured
            ? "success"
            : "warning"
        }
      >
        {configured
          ? "ثبت شده"
          : "ثبت نشده"}
      </Badge>
    </div>
  );
}

function ServiceStatus({
  status,
}: {
  status: Status;
}) {
  if (status === "active") {
    return (
      <Badge variant="success">
        فعال
      </Badge>
    );
  }
  if (status === "paused") {
    return (
      <Badge variant="error">
        متوقف
      </Badge>
    );
  }
  if (status === "coming-soon") {
    return (
      <Badge variant="warning">
        به‌زودی
      </Badge>
    );
  }
  return <Badge>راه‌اندازی</Badge>;
}
