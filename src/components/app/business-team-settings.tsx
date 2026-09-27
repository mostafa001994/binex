"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  addCurrentBusinessMemberApi,
  getCurrentBusinessMembersApi,
  removeCurrentBusinessMemberApi,
  updateCurrentBusinessMemberApi,
  type CurrentBusinessMember,
  type CurrentBusinessMembersResponse,
} from "@/lib/api-client/business";

const editableRoles = [
  { value: "admin", label: "مدیر کسب‌وکار" },
  { value: "member", label: "عضو" },
];

const roleLabels = { owner: "مالک", admin: "مدیر کسب‌وکار", member: "عضو" } as const;

export function BusinessTeamSettings() {
  const [data, setData] = useState<CurrentBusinessMembersResponse | null>(null);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [busy, setBusy] = useState("");
  const [removing, setRemoving] = useState<CurrentBusinessMember | null>(null);

  const load = useCallback(() => {
    setError("");
    setData(null);
    getCurrentBusinessMembersApi()
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "اعضای کسب‌وکار قابل دریافت نیستند."));
  }, []);

  useEffect(() => load(), [load]);

  async function addMember() {
    if (busy) return;
    if (!/^09\d{9}$/.test(phone.trim())) {
      toast.error("شماره موبایل معتبر وارد کنید");
      return;
    }
    setBusy("add");
    try {
      setData(await addCurrentBusinessMemberApi(phone.trim(), role));
      setPhone("");
      toast.success("عضو به کسب‌وکار اضافه شد");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "افزودن عضو انجام نشد.");
    } finally {
      setBusy("");
    }
  }

  async function changeRole(member: CurrentBusinessMember, nextRole: string) {
    if (nextRole !== "admin" && nextRole !== "member") return;
    setBusy(member.id);
    try {
      setData(await updateCurrentBusinessMemberApi(member.id, nextRole));
      toast.success("نقش عضو تغییر کرد");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "تغییر نقش انجام نشد.");
    } finally {
      setBusy("");
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setBusy(removing.id);
    try {
      setData(await removeCurrentBusinessMemberApi(removing.id));
      toast.success("عضو از کسب‌وکار حذف شد");
      setRemoving(null);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "حذف عضو انجام نشد.");
    } finally {
      setBusy("");
    }
  }

  if (error) {
    return (
      <Card className="text-center">
        <Users size={22} className="mx-auto text-error" />
        <p className="mt-3 font-ui text-sm text-foreground-muted">{error}</p>
        <Button className="mt-4" variant="secondary" leadingIcon={<RefreshCw size={15} />} onClick={load}>تلاش دوباره</Button>
      </Card>
    );
  }

  if (!data) return <div className="h-52 animate-pulse rounded-card bg-surface-raised" />;

  return (
    <>
      <Card id="team" className="scroll-mt-24">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary"><Users size={18} /></div>
            <div>
              <h2 data-display-title="true" className="text-lg font-bold">اعضای کسب‌وکار</h2>
              <p className="mt-1 font-ui text-sm leading-7 text-foreground-muted">دسترسی همکاران به پنل این کسب‌وکار را مدیریت کنید.</p>
            </div>
          </div>
          <Badge>{data.members.length.toLocaleString("fa-IR")} عضو</Badge>
        </div>

        {data.access.canManage && (
          <div className="mt-5 grid gap-3 rounded-card border border-border-subtle bg-surface-raised/40 p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
            <FormField id="team-phone" label="شماره موبایل همکار" hint="کاربر باید قبلاً یک‌بار وارد Binix شده باشد.">
              <Input id="team-phone" dir="ltr" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="09123456789" />
            </FormField>
            <FormField id="team-role" label="نقش">
              <Select id="team-role" value={role} onValueChange={(value) => setRole(value as "admin" | "member")} options={editableRoles} />
            </FormField>
            <Button loading={busy === "add"} leadingIcon={<UserPlus size={16} />} onClick={addMember}>افزودن</Button>
          </div>
        )}

        <div className="mt-5 divide-y divide-border-subtle">
          {data.members.map((member) => (
            <div key={member.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-ui text-sm font-semibold text-foreground">{member.user.name || "کاربر بدون نام"}</span>
                  {member.isCurrentUser && <Badge>شما</Badge>}
                </div>
                <div dir="ltr" className="mt-1 w-fit font-ui text-xs text-foreground-subtle">{member.user.phone}</div>
              </div>
              {data.access.canManage && member.role !== "owner" ? (
                <div className="flex items-center gap-2">
                  <Select className="w-44" value={member.role} disabled={busy === member.id} onValueChange={(value) => void changeRole(member, value)} options={editableRoles} />
                  <Button size="icon" variant="danger" disabled={busy === member.id} onClick={() => setRemoving(member)} aria-label={`حذف ${member.user.name || member.user.phone}`}><Trash2 size={16} /></Button>
                </div>
              ) : (
                <Badge variant={member.role === "owner" ? "warning" : "default"}>{roleLabels[member.role]}</Badge>
              )}
            </div>
          ))}
        </div>

        {!data.access.canManage && <p className="mt-5 rounded-control border border-border-subtle bg-surface-raised/40 p-3 font-ui text-xs leading-6 text-foreground-muted">فقط مالک کسب‌وکار می‌تواند اعضا و نقش‌های داخلی را تغییر دهد.</p>}
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => !busy && setRemoving(null)}
        onConfirm={() => void confirmRemove()}
        loading={Boolean(removing && busy === removing.id)}
        title="حذف عضو از کسب‌وکار"
        description={removing ? `${removing.user.name || removing.user.phone} از اعضای این کسب‌وکار حذف شود؟` : ""}
        consequences={["دسترسی کاربر به پنل و سرویس‌های این کسب‌وکار قطع می‌شود.", "حساب شخصی کاربر حذف نخواهد شد."]}
        confirmLabel="حذف عضو"
      />
    </>
  );
}
