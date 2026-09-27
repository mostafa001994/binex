"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  RefreshCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AppSection } from "@/components/app/app-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  deleteSalesAgentCredentialApi,
  getSalesAgentCredentialVerificationApi,
  getSalesAgentCredentialsApi,
  replaceBaleCredentialApi,
  replaceWooCommerceCredentialApi,
  waitForSalesAgentCredentialVerificationApi,
  type SalesAgentCredentialStatus,
  type SalesAgentCredentialVerification,
} from "@/lib/api-client/sales-agent";

export function SalesAgentConsole() {
  const [status, setStatus] =
    useState<SalesAgentCredentialStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setStatus(
        await getSalesAgentCredentialsApi(),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "اطلاعات اتصال قابل دریافت نیست.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-card bg-surface-raised" />
        <div className="h-64 animate-pulse rounded-card bg-surface-raised" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <Card className="text-center">
        <RefreshCcw
          size={20}
          className="mx-auto text-error"
        />

        <p className="mt-3 font-ui text-sm text-foreground-muted">
          {error}
        </p>

        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => void load()}
        >
          تلاش مجدد
        </Button>
      </Card>
    );
  }

  return (
    <>
      <BaleCard
        status={status}
        onChanged={setStatus}
      />

      <WooCommerceCard
        status={status}
        onChanged={setStatus}
      />
    </>
  );
}

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        dir="ltr"
        autoComplete="off"
        className="pl-10"
      />

      <button
        type="button"
        aria-label={
          visible
            ? "مخفی کردن مقدار"
            : "نمایش مقدار"
        }
        onClick={() =>
          setVisible((current) => !current)
        }
        className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-control text-foreground-subtle hover:text-foreground"
      >
        {visible ? (
          <EyeOff size={15} />
        ) : (
          <Eye size={15} />
        )}
      </button>
    </div>
  );
}


function VerificationBadge({
  verification,
}: {
  verification:
    | SalesAgentCredentialVerification
    | null;
}) {
  if (
    !verification ||
    verification.status === "idle"
  ) {
    return null;
  }

  if (
    verification.status === "pending" ||
    verification.status === "processing"
  ) {
    return (
      <Badge variant="warning">
        در حال بررسی اتصال
      </Badge>
    );
  }

  if (
    verification.status === "succeeded"
  ) {
    return (
      <Badge variant="success">
        اتصال تأیید شد
      </Badge>
    );
  }

  return (
    <Badge variant="error">
      {verification.status === "canceled"
        ? "بررسی لغو شد"
        : "اتصال ناموفق"}
    </Badge>
  );
}

function VerificationMessage({
  verification,
}: {
  verification:
    | SalesAgentCredentialVerification
    | null;
}) {
  if (
    !verification ||
    verification.status === "idle"
  ) {
    return null;
  }

  if (
    verification.status === "pending" ||
    verification.status === "processing"
  ) {
    return (
      <p className="mb-4 font-ui text-xs text-foreground-muted">
        اطلاعات ذخیره شده و اتصال در حال
        بررسی است…
      </p>
    );
  }

  if (
    verification.status === "succeeded"
  ) {
    return (
      <p className="mb-4 font-ui text-xs text-success">
        اتصال با موفقیت بررسی و تأیید شد.
      </p>
    );
  }

  return (
    <p className="mb-4 font-ui text-xs text-error">
      {verification.error ??
        "بررسی اتصال ناموفق بود."}
    </p>
  );
}

function BaleCard({
  status,
  onChanged,
}: {
  status: SalesAgentCredentialStatus;
  onChanged: (
    value: SalesAgentCredentialStatus,
  ) => void;
}) {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [
    verification,
    setVerification,
  ] =
    useState<SalesAgentCredentialVerification | null>(
      null,
    );

  useEffect(() => {
    if (!status.baleBotTokenConfigured) {
      setVerification(null);
      return;
    }

    void getSalesAgentCredentialVerificationApi(
      "bale",
    )
      .then(setVerification)
      .catch(() => undefined);
  }, [
    status.baleBotTokenConfigured,
    status.updatedAt,
  ]);

  async function save() {
    if (!token.trim()) {
      toast.error("توکن بات بله را وارد کنید");
      return;
    }

    setSaving(true);

    try {
      const result =
        await replaceBaleCredentialApi(
          token.trim(),
        );

      onChanged(result.credentials);
      setToken("");

      if (!result.verificationJobId) {
        toast.warning(
          "توکن ذخیره شد، اما بررسی اتصال اجرا نشد.",
        );
        return;
      }

      setVerification({
        provider: "bale",
        jobId: result.verificationJobId,
        status: "pending",
        error: null,
        createdAt: null,
        updatedAt: null,
        completedAt: null,
      });

      toast.info(
        "توکن ذخیره شد؛ اتصال بله در حال بررسی است.",
      );

      const checked =
        await waitForSalesAgentCredentialVerificationApi(
          "bale",
          result.verificationJobId,
        );

      setVerification(checked);

      if (checked.status === "succeeded") {
        toast.success(
          "اتصال بله با موفقیت تأیید شد",
        );
      } else if (
        checked.status === "failed"
      ) {
        toast.error(
          "اتصال بله تأیید نشد",
          {
            description:
              checked.error ?? undefined,
          },
        );
      } else {
        toast.info(
          "بررسی اتصال بله هنوز ادامه دارد.",
        );
      }
    } catch (reason) {
      toast.error("ذخیره توکن انجام نشد", {
        description:
          reason instanceof Error
            ? reason.message
            : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!status.baleBotTokenConfigured) return;

    if (
      !window.confirm(
        "توکن بات بله حذف شود؟",
      )
    ) {
      return;
    }

    setRemoving(true);

    try {
      const next =
        await deleteSalesAgentCredentialApi(
          "bale",
        );

      onChanged(next);
      setToken("");
      toast.success("توکن بله حذف شد");
    } catch (reason) {
      toast.error("حذف توکن انجام نشد", {
        description:
          reason instanceof Error
            ? reason.message
            : undefined,
      });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <AppSection
      title="اتصال بله"
      description="توکن بات بله برای فروشنده هوشمند."
    >
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-primary" />
            <span className="font-ui text-sm font-semibold">
              Bale Bot Token
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                status.baleBotTokenConfigured
                  ? "success"
                  : "warning"
              }
            >
              {status.baleBotTokenConfigured
                ? "ثبت شده"
                : "ثبت نشده"}
            </Badge>

            <VerificationBadge
              verification={verification}
            />
          </div>
        </div>

        <VerificationMessage
          verification={verification}
        />

        {status.baleBotTokenConfigured &&
          status.baleBotTokenMasked && (
            <div
              dir="ltr"
              className="mb-3 rounded-control border border-border bg-surface-raised px-3 py-2 font-mono text-xs text-foreground-muted"
            >
              {status.baleBotTokenMasked}
            </div>
          )}

        <SecretInput
          value={token}
          onChange={setToken}
          placeholder={
            status.baleBotTokenConfigured
              ? "برای جایگزینی، توکن جدید را وارد کنید"
              : "توکن بات بله"
          }
        />

        <div className="mt-3 flex flex-wrap gap-3">
          <Button
            type="button"
            loading={saving}
            leadingIcon={<Save size={15} />}
            onClick={() => void save()}
          >
            {status.baleBotTokenConfigured
              ? "جایگزینی"
              : "ذخیره"}
          </Button>

          {status.baleBotTokenConfigured && (
            <Button
              type="button"
              variant="secondary"
              loading={removing}
              leadingIcon={<Trash2 size={15} />}
              onClick={() => void remove()}
            >
              حذف
            </Button>
          )}
        </div>
      </Card>
    </AppSection>
  );
}

function WooCommerceCard({
  status,
  onChanged,
}: {
  status: SalesAgentCredentialStatus;
  onChanged: (
    value: SalesAgentCredentialStatus,
  ) => void;
}) {
  const [storeUrl, setStoreUrl] = useState(
    status.woocommerceStoreUrl ?? "",
  );

  const [consumerKey, setConsumerKey] =
    useState("");

  const [
    consumerSecret,
    setConsumerSecret,
  ] = useState("");

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [
    verification,
    setVerification,
  ] =
    useState<SalesAgentCredentialVerification | null>(
      null,
    );

  useEffect(() => {
    if (!status.woocommerceConfigured) {
      setVerification(null);
      return;
    }

    void getSalesAgentCredentialVerificationApi(
      "woocommerce",
    )
      .then(setVerification)
      .catch(() => undefined);
  }, [
    status.woocommerceConfigured,
    status.updatedAt,
  ]);

  async function save() {
    if (!storeUrl.trim()) {
      toast.error(
        "آدرس فروشگاه را وارد کنید",
      );
      return;
    }

    if (!consumerKey.trim()) {
      toast.error(
        "Consumer Key را وارد کنید",
      );
      return;
    }

    if (!consumerSecret.trim()) {
      toast.error(
        "Consumer Secret را وارد کنید",
      );
      return;
    }

    setSaving(true);

    try {
      const result =
        await replaceWooCommerceCredentialApi({
          storeUrl: storeUrl.trim(),
          consumerKey: consumerKey.trim(),
          consumerSecret:
            consumerSecret.trim(),
        });

      onChanged(result.credentials);

      setStoreUrl(
        result.credentials
          .woocommerceStoreUrl ?? "",
      );

      setConsumerKey("");
      setConsumerSecret("");

      if (!result.verificationJobId) {
        toast.warning(
          "اطلاعات ذخیره شد، اما بررسی اتصال اجرا نشد.",
        );
        return;
      }

      setVerification({
        provider: "woocommerce",
        jobId: result.verificationJobId,
        status: "pending",
        error: null,
        createdAt: null,
        updatedAt: null,
        completedAt: null,
      });

      toast.info(
        "اطلاعات ذخیره شد؛ اتصال ووکامرس در حال بررسی است.",
      );

      const checked =
        await waitForSalesAgentCredentialVerificationApi(
          "woocommerce",
          result.verificationJobId,
        );

      setVerification(checked);

      if (checked.status === "succeeded") {
        toast.success(
          "اتصال ووکامرس با موفقیت تأیید شد",
        );
      } else if (
        checked.status === "failed"
      ) {
        toast.error(
          "اتصال ووکامرس تأیید نشد",
          {
            description:
              checked.error ?? undefined,
          },
        );
      } else {
        toast.info(
          "بررسی اتصال ووکامرس هنوز ادامه دارد.",
        );
      }
    } catch (reason) {
      toast.error(
        "ذخیره اتصال ووکامرس انجام نشد",
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

  async function remove() {
    if (!status.woocommerceConfigured) {
      return;
    }

    if (
      !window.confirm(
        "اطلاعات اتصال ووکامرس حذف شود؟",
      )
    ) {
      return;
    }

    setRemoving(true);

    try {
      const next =
        await deleteSalesAgentCredentialApi(
          "woocommerce",
        );

      onChanged(next);
      setStoreUrl("");
      setConsumerKey("");
      setConsumerSecret("");

      toast.success(
        "اتصال ووکامرس حذف شد",
      );
    } catch (reason) {
      toast.error(
        "حذف اتصال ووکامرس انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <AppSection
      title="اتصال WooCommerce"
      description="آدرس فروشگاه و کلیدهای WooCommerce REST API را ثبت کنید."
    >
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-primary" />
            <span className="font-ui text-sm font-semibold">
              WooCommerce REST API
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                status.woocommerceConfigured
                  ? "success"
                  : "warning"
              }
            >
              {status.woocommerceConfigured
                ? "ثبت شده"
                : "ثبت نشده"}
            </Badge>

            <VerificationBadge
              verification={verification}
            />
          </div>
        </div>

        <VerificationMessage
          verification={verification}
        />

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-ui text-xs text-foreground-muted">
              آدرس فروشگاه
            </label>

            <Input
              type="url"
              value={storeUrl}
              onChange={(event) =>
                setStoreUrl(
                  event.target.value,
                )
              }
              placeholder="https://shop.example.com"
              dir="ltr"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="mb-2 block font-ui text-xs text-foreground-muted">
              Consumer Key
            </label>

            {status.woocommerceConsumerKeyConfigured &&
              status.woocommerceConsumerKeyMasked && (
                <div
                  dir="ltr"
                  className="mb-2 rounded-control border border-border bg-surface-raised px-3 py-2 font-mono text-xs text-foreground-muted"
                >
                  {
                    status.woocommerceConsumerKeyMasked
                  }
                </div>
              )}

            <SecretInput
              value={consumerKey}
              onChange={setConsumerKey}
              placeholder="ck_..."
            />
          </div>

          <div>
            <label className="mb-2 block font-ui text-xs text-foreground-muted">
              Consumer Secret
            </label>

            {status.woocommerceConsumerSecretConfigured &&
              status.woocommerceConsumerSecretMasked && (
                <div
                  dir="ltr"
                  className="mb-2 rounded-control border border-border bg-surface-raised px-3 py-2 font-mono text-xs text-foreground-muted"
                >
                  {
                    status.woocommerceConsumerSecretMasked
                  }
                </div>
              )}

            <SecretInput
              value={consumerSecret}
              onChange={setConsumerSecret}
              placeholder="cs_..."
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            loading={saving}
            leadingIcon={<Save size={15} />}
            onClick={() => void save()}
          >
            {status.woocommerceConfigured
              ? "جایگزینی اتصال"
              : "ذخیره اتصال"}
          </Button>

          {status.woocommerceConfigured && (
            <Button
              type="button"
              variant="secondary"
              loading={removing}
              leadingIcon={<Trash2 size={15} />}
              onClick={() => void remove()}
            >
              حذف اتصال
            </Button>
          )}
        </div>

        <p className="mt-4 font-ui text-[10px] leading-5 text-foreground-subtle">
          Consumer Key و Consumer Secret پس از ذخیره به‌صورت کامل در پنل نمایش داده نمی‌شوند.
        </p>
      </Card>
    </AppSection>
  );
}
