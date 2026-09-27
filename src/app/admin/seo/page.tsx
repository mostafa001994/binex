"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  RotateCcw,
  Save,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminSession } from "@/components/admin/admin-gate";
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {
  getAdminSeoSettingsApi,
  resetAdminSeoSettingApi,
  updateAdminSeoSettingApi,
  type AdminSeoPage,
  type AdminSeoSettings,
} from "@/lib/api-client/admin";

type SeoDraft = Pick<
  AdminSeoPage,
  | "path"
  | "title"
  | "description"
  | "canonicalUrl"
  | "ogImageUrl"
  | "ogImageAlt"
  | "noIndex"
  | "updatedAt"
>;

function toDraft(page: AdminSeoPage): SeoDraft {
  return {
    path: page.path,
    title: page.title,
    description: page.description,
    canonicalUrl: page.canonicalUrl,
    ogImageUrl: page.ogImageUrl,
    ogImageAlt: page.ogImageAlt,
    noIndex: page.noIndex,
    updatedAt: page.updatedAt,
  };
}

export default function AdminSeoPage() {
  const { user } = useAdminSession();
  const canWrite = hasAdminPermission(user.permissions, "admin.content.write");
  const [settings, setSettings] = useState<AdminSeoSettings | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [draft, setDraft] = useState<SeoDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [savedSignature, setSavedSignature] = useState("");

  const selectedPage = useMemo(
    () => settings?.pages.find((page) => page.path === selectedPath) ?? null,
    [selectedPath, settings],
  );
  const dirty = Boolean(draft) && JSON.stringify(draft) !== savedSignature;
  useUnsavedChanges(dirty);
  const healthIssues = useMemo(() => {
    if (!draft || !settings) return [];
    const issues: string[] = [];
    if (draft.noIndex) issues.push("این صفحه از ایندکس موتور جست‌وجو خارج شده است.");
    if (draft.ogImageUrl && !draft.ogImageAlt)
      issues.push("تصویر شبکه اجتماعی متن جایگزین ندارد.");
    if (
      draft.canonicalUrl.startsWith("http") &&
      !draft.canonicalUrl.startsWith(settings.environment.publicSiteUrl)
    )
      issues.push("Canonical به دامنه‌ای خارج از سایت اشاره می‌کند.");
    if (draft.title.length < 25) issues.push("عنوان SEO بسیار کوتاه است.");
    if (draft.description.length < 70) issues.push("توضیح SEO بسیار کوتاه است.");
    return issues;
  }, [draft, settings]);

  const load = useCallback(async (preferredPath?: string) => {
    setLoading(true);
    try {
      const result = await getAdminSeoSettingsApi();
      const path =
        preferredPath &&
        result.pages.some((page) => page.path === preferredPath)
          ? preferredPath
          : result.pages[0]?.path || "";
      setSettings(result);
      setSelectedPath(path);
      const page = result.pages.find((item) => item.path === path);
      setDraft(page ? toDraft(page) : null);
      setSavedSignature(page ? JSON.stringify(toDraft(page)) : "");
    } catch (error) {
      toast.error("دریافت تنظیمات SEO انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function selectPage(page: AdminSeoPage) {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده کنار گذاشته شود؟")) return;
    setSelectedPath(page.path);
    const next = toDraft(page);
    setDraft(next);
    setSavedSignature(JSON.stringify(next));
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      await updateAdminSeoSettingApi(draft);
      await load(draft.path);
      toast.success("تنظیمات SEO ذخیره شد");
    } catch (error) {
      toast.error("ذخیره تنظیمات SEO انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!draft || !selectedPage?.overridden) return;
    setSaving(true);
    try {
      await resetAdminSeoSettingApi(draft.path);
      await load(draft.path);
      toast.success("تنظیمات پیش‌فرض بازیابی شد");
    } catch (error) {
      toast.error("بازگردانی تنظیمات انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-admin-form-root className="space-y-6">
      <AdminPageHeader
        title="مدیریت SEO سایت"
        description="عنوان و توضیح نتایج جست‌وجو، Canonical، تصویر اشتراک‌گذاری و وضعیت ایندکس صفحات اصلی را مدیریت کنید."
        actions={
          <Button
            loading={saving}
            disabled={!draft || !canWrite || !dirty}
            onClick={() => void save()}
          >
            <Save size={15} /> ذخیره تغییرات
          </Button>
        }
      />

      {settings ? (
        <Card className="grid gap-4 p-4 md:grid-cols-4">
          <div>
            <div className="text-foreground-muted text-xs">آدرس عمومی سایت</div>
            <div dir="ltr" className="mt-1 truncate text-sm font-semibold">
              {settings.environment.publicSiteUrl}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-foreground-muted text-xs">
                تأیید Search Console
              </div>
              <div className="mt-1 text-sm">
                {settings.environment.searchConsoleVerificationConfigured
                  ? "کد تأیید در محیط تنظیم شده است"
                  : "پس از اتصال دامنه، کد تأیید را در Environment قرار دهید"}
              </div>
            </div>
            <Badge
              variant={
                settings.environment.searchConsoleVerificationConfigured
                  ? "success"
                  : "warning"
              }
            >
              {settings.environment.searchConsoleVerificationConfigured
                ? "تنظیم شده"
                : "در انتظار دامنه"}
            </Badge>
          </div>
          <div>
            <div className="text-foreground-muted text-xs">صفحات سفارشی‌شده</div>
            <div className="mt-1 text-lg font-bold">
              {settings.pages.filter((page) => page.overridden).length.toLocaleString("fa-IR")}
              <span className="text-foreground-subtle mr-1 text-xs">از {settings.pages.length.toLocaleString("fa-IR")}</span>
            </div>
          </div>
          <div>
            <div className="text-foreground-muted text-xs">صفحات Noindex</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-bold">
              {settings.pages.filter((page) => page.noIndex).length.toLocaleString("fa-IR")}
              {settings.pages.some((page) => page.noIndex) ? <ShieldAlert size={16} className="text-warning" /> : <CheckCircle2 size={16} className="text-success" />}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit p-3">
          <div className="mb-2 flex items-center gap-2 px-2 py-1 text-sm font-bold">
            <SearchCheck size={16} className="text-primary" /> صفحات قابل مدیریت
          </div>
          {loading ? (
            <p className="text-foreground-muted p-4 text-sm">
              در حال دریافت...
            </p>
          ) : null}
          <div className="space-y-1">
            {settings?.pages.map((page) => (
              <button
                key={page.path}
                type="button"
                onClick={() => selectPage(page)}
                className={`rounded-control w-full border p-3 text-right transition ${selectedPath === page.path ? "border-primary bg-primary/5" : "hover:bg-surface-hover border-transparent"}`}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {page.label}
                  {page.overridden ? (
                    <Badge variant="info">سفارشی</Badge>
                  ) : null}
                </span>
                <span
                  dir="ltr"
                  className="text-foreground-subtle mt-1 block text-xs"
                >
                  {page.path}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {draft ? (
          <div className="space-y-5">
            <Card className="p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{selectedPage?.label}</h2>
                  <p dir="ltr" className="text-foreground-subtle mt-1 text-xs">
                    {draft.path}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={!selectedPage?.overridden || saving || !canWrite}
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw size={14} /> بازگردانی پیش‌فرض
                </Button>
              </div>

              {healthIssues.length ? (
                <div className="border-warning/30 bg-warning/[0.06] text-warning mb-5 rounded-lg border p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold"><AlertTriangle size={15} /> موارد نیازمند بررسی</div>
                  <ul className="mt-2 list-disc space-y-1 pr-5 leading-6">
                    {healthIssues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="border-success/25 bg-success/[0.05] text-success mb-5 flex items-center gap-2 rounded-lg border p-4 text-xs font-bold">
                  <CheckCircle2 size={15} /> خطای واضحی در تنظیمات این صفحه دیده نشد.
                </div>
              )}

              <fieldset disabled={!canWrite} className="grid gap-5 sm:grid-cols-2">
                <SeoField
                  label="عنوان SEO"
                  count={`${draft.title.length}/70`}
                  wide
                >
                  <input
                    required
                    data-field-label="عنوان SEO"
                    value={draft.title}
                    maxLength={70}
                    onChange={(event) =>
                      setDraft({ ...draft, title: event.target.value })
                    }
                  />
                </SeoField>
                <SeoField
                  label="توضیح SEO"
                  count={`${draft.description.length}/170`}
                  wide
                >
                  <textarea
                    required
                    data-field-label="توضیح SEO"
                    rows={3}
                    value={draft.description}
                    maxLength={170}
                    onChange={(event) =>
                      setDraft({ ...draft, description: event.target.value })
                    }
                  />
                </SeoField>
                <SeoField label="Canonical URL" wide>
                  <input
                    dir="ltr"
                    value={draft.canonicalUrl}
                    placeholder={draft.path}
                    onChange={(event) =>
                      setDraft({ ...draft, canonicalUrl: event.target.value })
                    }
                  />
                </SeoField>
                <SeoField label="تصویر Open Graph" wide>
                  <div className="flex gap-2">
                    <input
                      dir="ltr"
                      value={draft.ogImageUrl}
                      onChange={(event) =>
                        setDraft({ ...draft, ogImageUrl: event.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="shrink-0"
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      <ImagePlus size={15} /> کتابخانه
                    </Button>
                  </div>
                </SeoField>
                <SeoField label="Alt تصویر Open Graph" wide>
                  <input
                    value={draft.ogImageAlt}
                    maxLength={255}
                    onChange={(event) =>
                      setDraft({ ...draft, ogImageAlt: event.target.value })
                    }
                  />
                </SeoField>
                <label className="border-border bg-surface-hover rounded-control flex items-center gap-3 border p-4 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={draft.noIndex}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      if (
                        checked &&
                        !window.confirm(
                          "با فعال‌کردن Noindex این صفحه از نتایج موتورهای جست‌وجو حذف می‌شود. ادامه می‌دهید؟",
                        )
                      ) return;
                      setDraft({ ...draft, noIndex: checked });
                    }}
                  />
                  <span>
                    جلوگیری از ایندکس این صفحه
                    <span className="text-foreground-muted mt-1 block text-xs">
                      فقط برای صفحات موقت یا در حال بازطراحی فعال کنید.
                    </span>
                  </span>
                </label>
              </fieldset>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold">پیش‌نمایش نتیجه جست‌وجو</h3>
              <div className="mt-4 max-w-2xl" dir="rtl">
                <div
                  className="text-foreground-subtle flex items-center gap-2 text-xs"
                  dir="ltr"
                >
                  <ExternalLink size={12} />
                  {draft.canonicalUrl ||
                    `${settings?.environment.publicSiteUrl || ""}${draft.path}`}
                </div>
                <div className="mt-2 text-xl text-[#1a0dab]">{draft.title}</div>
                <p className="mt-1 text-sm leading-6 text-[#4d5156] dark:text-slate-300">
                  {draft.description}
                </p>
              </div>
              {draft.ogImageUrl ? (
                <div className="border-border mt-5 overflow-hidden rounded-lg border sm:max-w-md">
                  <img
                    src={draft.ogImageUrl}
                    alt={draft.ogImageAlt || draft.title}
                    className="aspect-[1.91/1] w-full object-cover"
                  />
                </div>
              ) : null}
            </Card>
          </div>
        ) : null}
      </div>

      {draft ? (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          selectedUrl={draft.ogImageUrl}
          title="انتخاب تصویر Open Graph"
          onSelect={(item) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    ogImageUrl: item.url,
                    ogImageAlt: item.altText || current.ogImageAlt,
                  }
                : current,
            )
          }
        />
      ) : null}
      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          setResetOpen(false);
          void reset();
        }}
        title="بازگردانی تنظیمات SEO"
        description={`تنظیمات «${selectedPage?.label || "این صفحه"}» به مقادیر پیش‌فرض برگردد؟`}
        consequences={["عنوان، توضیح، Canonical، تصویر اجتماعی و Noindex سفارشی حذف می‌شوند."]}
        confirmLabel="بازگردانی پیش‌فرض"
        tone="warning"
      />
    </div>
  );
}

function SeoField({
  label,
  count,
  wide = false,
  children,
}: {
  label: string;
  count?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`text-foreground-muted text-xs font-semibold ${wide ? "sm:col-span-2" : ""}`}
    >
      <span className="flex items-center justify-between gap-2">
        {label}
        {count ? <span className="text-foreground-subtle">{count}</span> : null}
      </span>
      <div className="[&_input]:rounded-control [&_input]:border-border [&_input]:bg-background [&_textarea]:rounded-control [&_textarea]:border-border [&_textarea]:bg-background mt-2 [&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:px-3 [&_input]:text-sm [&_textarea]:w-full [&_textarea]:border [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:leading-7">
        {children}
      </div>
    </label>
  );
}
