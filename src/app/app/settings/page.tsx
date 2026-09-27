"use client";

import { useEffect, useState } from "react";
import { Bell, Clock3, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/components/app/app-page";
import { AppSection } from "@/components/app/app-section";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  useAuthSession,
  useAuthSessionActions,
} from "@/components/auth/auth-session";
import {
  useBusiness,
  useBusinessActions,
} from "@/components/business/business-context";
import { getSessionOverviewApi, updateMeApi, type SessionOverview } from "@/lib/api-client/auth";
import { updateCurrentBusinessApi } from "@/lib/api-client/business";
import { formatTehranPersianDateTime } from "@/lib/persian-date";
import { BusinessTeamSettings } from "@/components/app/business-team-settings";

export default function SettingsPage() {
  const user = useAuthSession();
  const businessContext = useBusiness();
  const { setUser } = useAuthSessionActions();
  const { setBusinessContext } = useBusinessActions();

  const [name, setName] = useState(user.name ?? "");
  const [business, setBusiness] = useState(
    businessContext.business.name,
  );
  const [importantOnly, setImportantOnly] = useState(
    user.preferences.importantNotificationsOnly,
  );
  const [saving, setSaving] = useState(false);
  const [sessionOverview, setSessionOverview] = useState<SessionOverview | null>(null);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    getSessionOverviewApi()
      .then(setSessionOverview)
      .catch((reason) => setSessionError(reason instanceof Error ? reason.message : "اطلاعات نشست قابل دریافت نیست."));
  }, []);

  async function saveProfile() {
    if (saving) return;

    const businessName = business.trim();

    if (!businessName) {
      toast.error("نام کسب‌وکار را وارد کنید");
      return;
    }

    setSaving(true);

    try {
      const [userResult, businessResult] = await Promise.all([
        updateMeApi(name.trim(), importantOnly),
        businessName === businessContext.business.name
          ? Promise.resolve(businessContext)
          : updateCurrentBusinessApi(businessName),
      ]);

      setUser(userResult.user);
      setBusinessContext(businessResult);
      setBusiness(businessResult.business.name);
      setName(userResult.user.name ?? "");

      toast.success("اطلاعات حساب ذخیره شد");
    } catch (error) {
      toast.error("ذخیره تغییرات انجام نشد", {
        description:
          error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppPage width="compact">
      <PageHeader
        title="تنظیمات"
        description="اطلاعات حساب، ظاهر، اعلان‌ها و امنیت را مدیریت کنید."
      />

      <AppSection
        title="حساب"
        description="این اطلاعات از حساب و کسب‌وکار فعلی شما دریافت می‌شوند."
      >
        <Card id="account" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-primary" />
            <h2 data-display-title="true" className="text-lg font-bold">
              پروفایل
            </h2>
          </div>

          <FormField id="settings-phone" label="شماره موبایل">
            <Input
              id="settings-phone"
              dir="ltr"
              value={user.phone}
              disabled
            />
          </FormField>

          <FormField id="settings-name" label="نام و نام خانوادگی" optional>
            <Input
              id="settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="نام شما"
              autoComplete="name"
              maxLength={80}
            />
          </FormField>

          <FormField
            id="settings-business"
            label="نام کسب‌وکار"
          >
            <Input
              id="settings-business"
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
              placeholder="نام مجموعه یا برند"
              maxLength={100}
              disabled={businessContext.membership.role !== "owner"}
            />
          </FormField>

          {businessContext.membership.role !== "owner" && (
            <p className="font-ui text-xs leading-6 text-foreground-subtle">
              فقط مالک کسب‌وکار می‌تواند نام کسب‌وکار را تغییر دهد.
            </p>
          )}

          <Button
            type="button"
            onClick={saveProfile}
            loading={saving}
            leadingIcon={<Save size={16} />}
          >
            ذخیره تغییرات
          </Button>
        </Card>
      </AppSection>

      <AppSection
        title="تیم کسب‌وکار"
        description="مالک می‌تواند همکاران ثبت‌شده در Binix را به کسب‌وکار اضافه کند."
      >
        <BusinessTeamSettings />
      </AppSection>

      <AppSection
        title="ظاهر"
        description="تم نمایش روی همین دستگاه ذخیره می‌شود."
      >
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 data-display-title="true" className="text-lg font-bold">
              حالت نمایش
            </h2>
            <p className="mt-1 font-ui text-sm leading-7 text-foreground-muted">
              بین حالت روشن و تاریک جابه‌جا شوید.
            </p>
          </div>
          <ThemeToggle />
        </Card>
      </AppSection>

      <AppSection
        title="اعلان‌ها"
        description="این ترجیح در حساب شما ذخیره می‌شود و روی همه دستگاه‌ها یکسان است."
      >
        <Card id="notifications" className="scroll-mt-24">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
                <Bell size={18} />
              </div>
              <div>
                <h2 data-display-title="true" className="text-lg font-bold">
                  فقط اعلان‌های مهم
                </h2>
                <p className="mt-1 font-ui text-sm leading-7 text-foreground-muted">
                  خطای سرویس، رویداد مهم یا مورد نیازمند اقدام را در اولویت قرار بده.
                </p>
              </div>
            </div>
            <Switch
              checked={importantOnly}
              onCheckedChange={setImportantOnly}
              ariaLabel="فقط اعلان‌های مهم"
            />
          </div>
        </Card>
      </AppSection>

      <AppSection
        title="امنیت"
        description="ورود حساب با شماره موبایل و کد یک‌بارمصرف انجام می‌شود."
      >
        <Card id="security" className="scroll-mt-24">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-success/10 text-success">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 data-display-title="true" className="text-lg font-bold">
                نشست فعال امن
              </h2>
              <p className="mt-1 font-ui text-sm leading-7 text-foreground-muted">
                نشست ورود با Cookie امن HttpOnly نگهداری می‌شود و هر ورود جدید، نشست قبلی را به‌صورت خودکار می‌بندد.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
            <SessionFact label="نشست‌های فعال" value={sessionOverview ? sessionOverview.activeCount.toLocaleString("fa-IR") : sessionError ? "نامشخص" : "در حال دریافت…"} />
            <SessionFact label="شروع نشست" value={sessionOverview ? formatTehranPersianDateTime(sessionOverview.current.createdAt) : "—"} />
            <SessionFact label="اعتبار تا" value={sessionOverview ? formatTehranPersianDateTime(sessionOverview.current.expiresAt) : "—"} icon={<Clock3 size={14} />} />
          </div>
          {sessionError && <p className="mt-3 font-ui text-xs text-error">{sessionError}</p>}
        </Card>
      </AppSection>
    </AppPage>
  );
}

function SessionFact({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-control border border-border-subtle bg-surface-raised/40 p-3">
      <div className="flex items-center gap-1.5 font-ui text-xs text-foreground-subtle">{icon}{label}</div>
      <div className="mt-2 font-ui text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
