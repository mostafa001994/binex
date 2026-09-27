"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type InvalidEvent,
} from "react";
import {
  Edit3,
  Eye,
  Pause,
  Play,
  Plus,
  Send,
  TimerReset,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PersianDateTimePicker } from "@/components/ui/persian-date-time-picker";
import {
  createAdminCustomOfferApi,
  createAdminCustomServiceApi,
  getAdminCustomOffersApi,
  getAdminCustomServicesApi,
  transitionAdminCustomOfferApi,
  transitionAdminCustomSubscriptionApi,
  updateAdminCustomOfferApi,
  updateAdminCustomServiceApi,
  type CustomOffer,
  type CustomService,
  type CustomSubscription,
} from "@/lib/api-client/custom-services";

const inputClass =
  "font-ui h-10 w-full rounded-control border border-border bg-background px-3 text-xs outline-none invalid:border-error focus:border-primary/50";
const areaClass =
  "font-ui min-h-24 w-full rounded-control border border-border bg-background px-3 py-2 text-xs leading-6 outline-none invalid:border-error focus:border-primary/50";
const labels: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  ACTIVE: "فعال",
  ARCHIVED: "بایگانی",
  SENT: "ارسال‌شده",
  PAYMENT_PENDING: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  EXPIRED: "منقضی",
  CANCELED: "لغوشده",
  PAUSED: "متوقف",
  ENDED: "پایان‌یافته",
};
const periodLabel = (
  offer: Pick<CustomOffer, "billingPeriod" | "customDurationDays">,
) =>
  offer.billingPeriod === "CUSTOM"
    ? `${offer.customDurationDays} روز`
    : offer.billingPeriod === "MONTHLY"
      ? "یک ماه"
      : offer.billingPeriod === "QUARTERLY"
        ? "سه ماه"
        : "یک سال";
const persianDate = (value: string) =>
  new Date(value).toLocaleString("fa-IR-u-ca-persian", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tehran",
  });
const money = (value: string) => {
  try {
    return `${(BigInt(value) / 10n).toLocaleString("fa-IR")} تومان`;
  } catch {
    return "—";
  }
};
const digits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (char) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(char)))
    .replace(/\D/g, "");
const tomanValue = (value: string) => Math.floor(Number(value) / 10).toString();
const defaultDeadline = () => new Date(Date.now() + 7 * 86400000).toISOString();

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-ui text-foreground-muted mb-1.5 block text-xs">
        {label}
      </span>
      {children}
    </label>
  );
}
function invalid(event: InvalidEvent<HTMLFormElement>) {
  const target = event.target as HTMLElement;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => target.focus(), 250);
}

export default function AdminCustomServicesPage() {
  const [tab, setTab] = useState<"services" | "offers" | "subscriptions">(
    "services",
  );
  const [services, setServices] = useState<CustomService[]>([]);
  const [offers, setOffers] = useState<CustomOffer[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomSubscription[]>([]);
  const [businesses, setBusinesses] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [offerServices, setOfferServices] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [detail, setDetail] = useState<CustomOffer | null>(null);
  const [editingService, setEditingService] = useState<CustomService | null>(
    null,
  );
  const [editingOffer, setEditingOffer] = useState<CustomOffer | null>(null);
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        getAdminCustomServicesApi(),
        getAdminCustomOffersApi(),
      ]);
      setServices(a.services);
      setOffers(b.offers);
      setSubscriptions(b.subscriptions);
      setBusinesses(b.businesses);
      setOfferServices(b.services);
    } catch (error) {
      toast.error("دریافت اطلاعات انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const filteredServices = useMemo(
    () =>
      services.filter(
        (item) =>
          (!status || item.status === status) &&
          `${item.name} ${item.shortName}`.includes(query),
      ),
    [services, status, query],
  );
  const filteredOffers = useMemo(
    () =>
      offers.filter(
        (item) =>
          (!status || item.status === status) &&
          `${item.title} ${item.business.name} ${item.customService.name}`.includes(
            query,
          ),
      ),
    [offers, status, query],
  );
  const filteredSubscriptions = useMemo(
    () =>
      subscriptions.filter(
        (item) =>
          (!status || item.status === status) &&
          `${item.serviceNameSnapshot} ${item.offerTitleSnapshot} ${item.business?.name ?? ""}`.includes(
            query,
          ),
      ),
    [subscriptions, status, query],
  );

  function openOffer(item?: CustomOffer) {
    setEditingOffer(item ?? null);
    setDeadline(item?.validUntil ?? defaultDeadline());
    setBillingPeriod(item?.billingPeriod.toLowerCase() ?? "monthly");
    setOfferOpen(true);
  }
  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name"),
      shortName: form.get("shortName"),
      description: form.get("description"),
      features: String(form.get("features") || "").split("\n"),
      appHref: form.get("appHref"),
      accent: form.get("accent"),
      iconKey: form.get("iconKey"),
      status: form.get("status"),
    };
    try {
      if (editingService)
        await updateAdminCustomServiceApi(editingService.id, body);
      else await createAdminCustomServiceApi(body);
      toast.success("سرویس اختصاصی ذخیره شد");
      setServiceOpen(false);
      await load();
    } catch (error) {
      toast.error("ذخیره انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }
  async function saveOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const toman = digits(String(form.get("priceToman") || ""));
    const body = {
      customServiceId: form.get("customServiceId"),
      businessId: form.get("businessId"),
      title: form.get("title"),
      description: form.get("description"),
      terms: form.get("terms"),
      features: String(form.get("features") || "").split("\n"),
      priceAmount: toman ? (BigInt(toman) * 10n).toString() : "",
      billingPeriod: form.get("billingPeriod"),
      customDurationDays: form.get("customDurationDays"),
      validUntil: deadline,
      version: editingOffer?.version,
    };
    try {
      if (editingOffer) await updateAdminCustomOfferApi(editingOffer.id, body);
      else await createAdminCustomOfferApi(body);
      toast.success(
        editingOffer ? "پیشنهاد ویرایش شد" : "پیشنهاد پیش‌نویس ساخته شد",
      );
      setOfferOpen(false);
      await load();
    } catch (error) {
      toast.error("ذخیره پیشنهاد انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }
  async function offerAction(item: CustomOffer, operation: "send" | "cancel") {
    if (
      operation === "cancel" &&
      !window.confirm("این پیشنهاد و پرداخت درحال‌انتظار آن لغو شود؟")
    )
      return;
    try {
      await transitionAdminCustomOfferApi(item.id, operation);
      toast.success(
        operation === "send" ? "پیشنهاد ارسال شد" : "پیشنهاد لغو شد",
      );
      await load();
    } catch (error) {
      toast.error("تغییر وضعیت انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }
  async function subscriptionAction(
    item: CustomSubscription,
    operation: "pause" | "resume" | "end" | "extend",
  ) {
    let days: number | undefined;
    if (operation === "extend") {
      const raw = window.prompt("اشتراک چند روز تمدید شود؟", "30");
      if (raw === null) return;
      days = Number(digits(raw));
    } else if (
      !window.confirm("این تغییر وضعیت روی دسترسی کسب‌وکار اعمال شود؟")
    )
      return;
    try {
      await transitionAdminCustomSubscriptionApi(item.id, operation, days);
      toast.success("وضعیت اشتراک به‌روزرسانی شد");
      await load();
    } catch (error) {
      toast.error("عملیات اشتراک انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const actions =
    tab === "services" ? (
      <Button
        leadingIcon={<Plus size={15} />}
        onClick={() => {
          setEditingService(null);
          setServiceOpen(true);
        }}
      >
        سرویس جدید
      </Button>
    ) : tab === "offers" ? (
      <Button leadingIcon={<Plus size={15} />} onClick={() => openOffer()}>
        پیشنهاد جدید
      </Button>
    ) : undefined;
  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="سرویس‌های اختصاصی"
        description="مدیریت مستقل سرویس، پیشنهاد مالی و اشتراک هر کسب‌وکار."
        actions={actions}
      />
      <div className="border-border flex flex-wrap gap-2 border-b">
        {(
          [
            ["services", "تعریف سرویس‌ها"],
            ["offers", "پیشنهادها"],
            ["subscriptions", "اشتراک‌ها"],
          ] as const
        ).map(([key, title]) => (
          <button
            key={key}
            className={`font-ui px-4 py-3 text-sm ${tab === key ? "border-primary text-primary border-b-2 font-bold" : "text-foreground-muted"}`}
            onClick={() => {
              setTab(key);
              setStatus("");
            }}
          >
            {title}
          </button>
        ))}
      </div>
      <Card className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          className={inputClass}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجو در عنوان، سرویس یا کسب‌وکار..."
        />
        <select
          className={inputClass}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(labels)
            .filter(([key]) =>
              tab === "services"
                ? ["DRAFT", "ACTIVE", "ARCHIVED"].includes(key)
                : tab === "subscriptions"
                  ? ["ACTIVE", "PAUSED", "ENDED"].includes(key)
                  : !["ACTIVE", "ARCHIVED", "PAUSED", "ENDED"].includes(key),
            )
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
      </Card>
      {loading ? (
        <div className="rounded-card bg-surface-raised h-52 animate-pulse" />
      ) : tab === "services" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredServices.map((item) => (
            <Card key={item.id}>
              <div className="flex justify-between">
                <div>
                  <h2 className="font-bold">{item.name}</h2>
                  <p className="font-ui text-foreground-muted text-xs">
                    {item.shortName}
                  </p>
                </div>
                <Badge
                  variant={item.status === "ACTIVE" ? "success" : "default"}
                >
                  {labels[item.status]}
                </Badge>
              </div>
              <p className="font-ui text-foreground-muted mt-3 text-xs leading-6">
                {item.description}
              </p>
              <div className="font-ui mt-3 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-control bg-surface-raised p-3">
                  {item._count?.offers ?? 0} پیشنهاد
                </span>
                <span className="rounded-control bg-surface-raised p-3">
                  {item._count?.subscriptions ?? 0} اشتراک
                </span>
              </div>
              <Button
                className="mt-4 w-full"
                variant="secondary"
                onClick={() => {
                  setEditingService(item);
                  setServiceOpen(true);
                }}
              >
                ویرایش
              </Button>
            </Card>
          ))}
        </div>
      ) : tab === "offers" ? (
        <div className="space-y-3">
          {filteredOffers.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-bold">{item.title}</h2>
                  <p className="font-ui text-foreground-muted text-xs">
                    {item.business.name} · {item.customService.name}
                  </p>
                </div>
                <Badge
                  variant={
                    item.status === "PAID"
                      ? "success"
                      : ["EXPIRED", "CANCELED"].includes(item.status)
                        ? "error"
                        : "warning"
                  }
                >
                  {labels[item.status]}
                </Badge>
              </div>
              <div className="font-ui mt-3 grid gap-2 text-xs sm:grid-cols-3">
                <span className="rounded-control bg-surface-raised p-3">
                  {money(item.priceAmount)}
                </span>
                <span className="rounded-control bg-surface-raised p-3">
                  مهلت: {persianDate(item.validUntil)}
                </span>
                <span className="rounded-control bg-surface-raised p-3">
                  {periodLabel(item)}
                </span>
              </div>
              <div className="border-border-subtle mt-4 flex flex-wrap gap-2 border-t pt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<Eye size={14} />}
                  onClick={() => setDetail(item)}
                >
                  جزئیات
                </Button>
                {item.status === "DRAFT" && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={<Edit3 size={14} />}
                      onClick={() => openOffer(item)}
                    >
                      ویرایش
                    </Button>
                    <Button
                      size="sm"
                      leadingIcon={<Send size={14} />}
                      onClick={() => void offerAction(item, "send")}
                    >
                      ارسال
                    </Button>
                  </>
                )}
                {["DRAFT", "SENT", "PAYMENT_PENDING"].includes(item.status) && (
                  <Button
                    size="sm"
                    variant="danger"
                    leadingIcon={<XCircle size={14} />}
                    onClick={() => void offerAction(item, "cancel")}
                  >
                    لغو
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubscriptions.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="font-bold">{item.serviceNameSnapshot}</h2>
                  <p className="font-ui text-foreground-muted text-xs">
                    {item.business?.name} · {item.offerTitleSnapshot}
                  </p>
                </div>
                <Badge
                  variant={item.status === "ACTIVE" ? "success" : "default"}
                >
                  {labels[item.status]}
                </Badge>
              </div>
              <div className="font-ui mt-3 grid gap-2 text-xs sm:grid-cols-3">
                <span className="rounded-control bg-surface-raised p-3">
                  شروع: {persianDate(item.startsAt)}
                </span>
                <span className="rounded-control bg-surface-raised p-3">
                  پایان: {persianDate(item.endsAt)}
                </span>
                <span className="rounded-control bg-surface-raised p-3">
                  {money(item.priceAmount)}
                </span>
              </div>
              <div className="border-border-subtle mt-4 flex flex-wrap gap-2 border-t pt-4">
                {item.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<Pause size={14} />}
                    onClick={() => void subscriptionAction(item, "pause")}
                  >
                    توقف
                  </Button>
                )}
                {item.status === "PAUSED" && (
                  <Button
                    size="sm"
                    leadingIcon={<Play size={14} />}
                    onClick={() => void subscriptionAction(item, "resume")}
                  >
                    ادامه
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={<TimerReset size={14} />}
                  onClick={() => void subscriptionAction(item, "extend")}
                >
                  تمدید
                </Button>
                {item.status !== "ENDED" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => void subscriptionAction(item, "end")}
                  >
                    پایان اشتراک
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {!loading &&
        ((tab === "services" && !filteredServices.length) ||
          (tab === "offers" && !filteredOffers.length) ||
          (tab === "subscriptions" && !filteredSubscriptions.length)) && (
          <Card className="font-ui text-foreground-muted text-center text-sm">
            موردی با این فیلتر پیدا نشد.
          </Card>
        )}

      <Modal
        open={serviceOpen}
        onClose={() => setServiceOpen(false)}
        title={editingService ? "ویرایش سرویس اختصاصی" : "تعریف سرویس اختصاصی"}
        footer={
          <>
            <Button type="submit" form="service-form" loading={saving}>
              ذخیره
            </Button>
            <Button variant="secondary" onClick={() => setServiceOpen(false)}>
              انصراف
            </Button>
          </>
        }
      >
        <form
          id="service-form"
          onSubmit={saveService}
          onInvalid={invalid}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="نام سرویس *">
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={editingService?.name}
              className={inputClass}
            />
          </Field>
          <Field label="نام کوتاه *">
            <input
              name="shortName"
              required
              minLength={2}
              maxLength={80}
              defaultValue={editingService?.shortName}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="توضیحات *">
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={3000}
                defaultValue={editingService?.description}
                className={areaClass}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="قابلیت‌ها؛ هر مورد در یک خط">
              <textarea
                name="features"
                defaultValue={editingService?.features.join("\n")}
                className={areaClass}
              />
            </Field>
          </div>
          <Field label="مسیر داخلی ورود (/app/...)">
            <input
              name="appHref"
              pattern="/app/.*"
              defaultValue={editingService?.appHref || ""}
              className={inputClass}
            />
          </Field>
          <Field label="رنگ شاخص">
            <input
              name="accent"
              defaultValue={editingService?.accent || "#078BFF"}
              className={inputClass}
            />
          </Field>
          <Field label="کلید آیکن">
            <input
              name="iconKey"
              defaultValue={editingService?.iconKey || "sparkles"}
              className={inputClass}
            />
          </Field>
          <Field label="وضعیت">
            <select
              name="status"
              defaultValue={editingService?.status.toLowerCase() || "draft"}
              className={inputClass}
            >
              <option value="draft">پیش‌نویس</option>
              <option value="active">فعال</option>
              <option value="archived">بایگانی</option>
            </select>
          </Field>
        </form>
      </Modal>
      <Modal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        title={
          editingOffer ? "ویرایش پیشنهاد پیش‌نویس" : "پیشنهاد اختصاصی جدید"
        }
        footer={
          <>
            <Button type="submit" form="offer-form" loading={saving}>
              ذخیره پیش‌نویس
            </Button>
            <Button variant="secondary" onClick={() => setOfferOpen(false)}>
              انصراف
            </Button>
          </>
        }
        size="lg"
      >
        <form
          id="offer-form"
          onSubmit={saveOffer}
          onInvalid={invalid}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="کسب‌وکار *">
            <select
              name="businessId"
              required
              disabled={Boolean(editingOffer)}
              defaultValue={editingOffer?.businessId || ""}
              className={inputClass}
            >
              <option value="">انتخاب کنید</option>
              {businesses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="سرویس فعال *">
            <select
              name="customServiceId"
              required
              disabled={Boolean(editingOffer)}
              defaultValue={editingOffer?.customServiceId || ""}
              className={inputClass}
            >
              <option value="">انتخاب کنید</option>
              {offerServices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="عنوان *">
              <input
                name="title"
                required
                minLength={2}
                maxLength={160}
                defaultValue={editingOffer?.title}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="شرح پیشنهاد *">
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={4000}
                defaultValue={editingOffer?.description}
                className={areaClass}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="خروجی‌ها؛ خالی باشد از سرویس مادر کپی می‌شود">
              <textarea
                name="features"
                defaultValue={editingOffer?.features.join("\n")}
                className={areaClass}
              />
            </Field>
          </div>
          <Field label="مبلغ به تومان *">
            <input
              name="priceToman"
              required
              inputMode="numeric"
              pattern="[0-9۰-۹]+"
                    defaultValue={editingOffer ? tomanValue(editingOffer.priceAmount) : ""}
              className={inputClass}
            />
          </Field>
          <Field label="دوره *">
            <select
              name="billingPeriod"
              value={billingPeriod}
              onChange={(event) => setBillingPeriod(event.target.value)}
              className={inputClass}
            >
              <option value="monthly">یک ماه</option>
              <option value="quarterly">سه ماه</option>
              <option value="yearly">یک سال</option>
              <option value="custom">سفارشی</option>
            </select>
          </Field>
          {billingPeriod === "custom" && (
            <Field label="تعداد روز *">
              <input
                name="customDurationDays"
                type="number"
                required
                min={1}
                max={3650}
                defaultValue={editingOffer?.customDurationDays ?? undefined}
                className={inputClass}
              />
            </Field>
          )}
          <div className="sm:col-span-2">
            <Field label="مهلت پرداخت (تقویم فارسی) *">
              <PersianDateTimePicker
                value={deadline}
                onChange={setDeadline}
                min={new Date(Date.now() + 60000)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="شرایط و تعهدات">
              <textarea
                name="terms"
                maxLength={4000}
                defaultValue={editingOffer?.terms || ""}
                className={areaClass}
              />
            </Field>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="جزئیات کامل پیشنهاد"
        size="lg"
      >
        {detail && (
          <div className="font-ui space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <b>کسب‌وکار:</b> {detail.business.name}
              </p>
              <p>
                <b>سرویس:</b> {detail.customService.name}
              </p>
              <p>
                <b>وضعیت:</b> {labels[detail.status]}
              </p>
              <p>
                <b>مهلت:</b> {persianDate(detail.validUntil)}
              </p>
              <p>
                <b>دوره:</b> {periodLabel(detail)}
              </p>
              <p>
                <b>مبلغ:</b> {money(detail.priceAmount)}
              </p>
            </div>
            <p className="leading-7 whitespace-pre-line">
              {detail.description}
            </p>
            {detail.features.length > 0 && (
              <ul className="list-inside list-disc space-y-1">
                {detail.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {detail.terms && (
              <div className="rounded-control bg-surface-raised p-4 leading-7 whitespace-pre-line">
                <b>شرایط:</b>
                <br />
                {detail.terms}
              </div>
            )}
            {detail.subscription && (
              <p className="rounded-control bg-success/10 text-success p-3">
                اشتراک تا {persianDate(detail.subscription.endsAt)} فعال است.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
