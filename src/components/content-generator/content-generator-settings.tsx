"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2, Save, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppSection } from "@/components/app/app-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getContentGeneratorSettingsApi,
  saveContentGeneratorSettingsApi,
  type ContentGeneratorSettings,
} from "@/lib/api-client/content-generator";

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ContentGeneratorSettingsForm() {
  const [settings, setSettings] = useState<ContentGeneratorSettings | null>(null);
  const [keywords, setKeywords] = useState("");
  const [sourceUrls, setSourceUrls] = useState("");
  const [targetSiteUrl, setTargetSiteUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const applySettings = useCallback((value: ContentGeneratorSettings) => {
    setSettings(value);
    setKeywords(value.keywords.join("\n"));
    setSourceUrls(value.sourceUrls.join("\n"));
    setTargetSiteUrl(value.targetSiteUrl ?? "");
    setApiKey("");
    setSecretKey("");
  }, []);

  useEffect(() => {
    getContentGeneratorSettingsApi()
      .then(({ settings: value }) => applySettings(value))
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "تنظیمات قابل دریافت نیست.",
        ),
      )
      .finally(() => setLoading(false));
  }, [applySettings]);

  async function save() {
    const keywordItems = lines(keywords);
    const sourceItems = lines(sourceUrls);

    if (!keywordItems.length || !sourceItems.length || !targetSiteUrl.trim()) {
      toast.error("کلمات کلیدی، منابع و سایت مقصد را کامل کنید");
      return;
    }

    if (!settings?.apiKeyConfigured && !apiKey.trim()) {
      toast.error("API Key را وارد کنید");
      return;
    }

    if (!settings?.secretKeyConfigured && !secretKey.trim()) {
      toast.error("Secret Key را وارد کنید");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await saveContentGeneratorSettingsApi({
        keywords: keywordItems,
        sourceUrls: sourceItems,
        targetSiteUrl: targetSiteUrl.trim(),
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim(),
      });
      applySettings(result.settings);
      toast.success("تنظیمات تولید محتوای هوشمند ذخیره شد");
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "ذخیره تنظیمات ناموفق بود.";
      setError(message);
      toast.error("ذخیره تنظیمات انجام نشد", { description: message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-card bg-surface-raised" />;
  }

  return (
    <AppSection
      title="تنظیمات تولید و انتشار محتوا"
      description="موضوع‌ها، منابع مرجع و اتصال سایت مقصد را مشخص کنید. هر مورد را در یک خط جدا بنویسید."
    >
      <div id="content-setup" className="grid scroll-mt-24 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-control border border-primary/15 bg-primary/10 text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 data-display-title="true" className="font-bold">راهبرد محتوا</h2>
              <p className="mt-1 font-ui text-xs text-foreground-muted">ورودی‌هایی که تولید محتوا براساس آن‌ها انجام می‌شود.</p>
            </div>
          </div>

          <div className="space-y-5">
            <FormField id="content-keywords" label="کلمات کلیدی" hint="حداکثر ۳۰ مورد؛ هر خط یک کلمه یا عبارت کلیدی">
              <Textarea id="content-keywords" rows={6} value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder={"اتوماسیون فروش\nهوش مصنوعی برای کسب‌وکار"} />
            </FormField>
            <FormField id="content-sources" label="URL منابع محتوا" hint="حداکثر ۲۰ آدرس معتبر با http یا https؛ هر خط یک URL">
              <Textarea id="content-sources" dir="ltr" rows={7} value={sourceUrls} onChange={(event) => setSourceUrls(event.target.value)} placeholder={"https://example.com/article-one\nhttps://example.org/reference"} />
            </FormField>
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-control border border-primary/15 bg-primary/10 text-primary">
                <Link2 size={18} />
              </div>
              <div>
                <h2 data-display-title="true" className="font-bold">سایت مقصد انتشار</h2>
                <p className="mt-1 font-ui text-xs text-foreground-muted">اطلاعات API سایت خودتان</p>
              </div>
            </div>
            <Badge variant={settings?.connectionConfigured ? "success" : "warning"}>
              {settings?.connectionConfigured ? "اتصال ثبت شده" : "نیازمند تنظیم"}
            </Badge>
          </div>

          <div className="space-y-5">
            <FormField id="target-site-url" label="URL سایت مقصد">
              <Input id="target-site-url" type="url" dir="ltr" value={targetSiteUrl} onChange={(event) => setTargetSiteUrl(event.target.value)} placeholder="https://your-site.example" autoComplete="url" />
            </FormField>
            <FormField id="publisher-api-key" label="API Key" hint={settings?.apiKeyConfigured ? "قبلاً ثبت شده؛ برای تغییر، مقدار جدید وارد کنید." : "کلید دسترسی API سایت مقصد"}>
              <Input id="publisher-api-key" type="password" dir="ltr" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={settings?.apiKeyConfigured ? "••••••••••••" : "API Key"} autoComplete="new-password" />
            </FormField>
            <FormField id="publisher-secret-key" label="Secret Key" hint={settings?.secretKeyConfigured ? "قبلاً ثبت شده؛ برای تغییر، مقدار جدید وارد کنید." : "کلید محرمانه API سایت مقصد"}>
              <Input id="publisher-secret-key" type="password" dir="ltr" value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder={settings?.secretKeyConfigured ? "••••••••••••" : "Secret Key"} autoComplete="new-password" />
            </FormField>
          </div>

          <div className="mt-6 rounded-control border border-info/20 bg-info/[0.06] p-4">
            <div className="flex items-start gap-2 text-info">
              <ShieldCheck size={17} className="mt-0.5 shrink-0" />
              <p className="font-ui text-xs leading-6">API Key و Secret Key رمزنگاری می‌شوند و بعد از ذخیره هیچ‌وقت به‌صورت کامل در پنل یا API نمایش داده نمی‌شوند.</p>
            </div>
          </div>

          {error ? <div role="alert" className="mt-4 rounded-control border border-error/20 bg-error/[0.06] p-3 font-ui text-xs text-error">{error}</div> : null}

          <Button className="mt-6 w-full" size="lg" loading={saving} leadingIcon={<Save size={16} />} onClick={() => void save()}>
            ذخیره تنظیمات
          </Button>
          <p className="mt-3 text-center font-ui text-[11px] leading-5 text-foreground-subtle">ثبت این اطلاعات به‌تنهایی محتوایی منتشر نمی‌کند؛ اتصال موتور تولید و انتشار در مرحلهٔ بعد فعال می‌شود.</p>
        </Card>
      </div>
    </AppSection>
  );
}
