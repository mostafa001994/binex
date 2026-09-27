"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Plus,
  Search,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAdminCatalogServiceApi,
  deleteAdminCatalogServiceApi,
  getAdminCatalogServicesApi,
  updateAdminCatalogServiceApi,
  type AdminCatalogService,
} from "@/lib/api-client/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminTableSkeleton } from "@/components/admin/admin-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { iconRegistry } from "@/constants/icon-registry";
import { createDefaultServiceMarketingContent } from "@/types/service-marketing";
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog";

type Draft = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  appHref: string;
  marketingHref: string;
  availability:
    | "available"
    | "coming-soon";
  status:
    | "draft"
    | "active"
    | "disabled";
  visibility:
    | "public"
    | "private";
  accent: string;
  iconKey: string;
  sortOrder: string;
  features: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroImageUrl: string;
  heroImageAlt: string;
  benefits: string;
  steps: string;
  trustTitle: string;
  trustDescription: string;
  trustItems: string;
  faq: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
  ctaHref: string;
};

const emptyDraft: Draft = {
  id: "",
  slug: "",
  name: "",
  shortName: "",
  category: "",
  description: "",
  appHref: "",
  marketingHref: "",
  availability: "available",
  status: "active",
  visibility: "public",
  accent: "#078BFF",
  iconKey: "layout-grid",
  sortOrder: "100",
  features: "",
  heroEyebrow: "",
  heroTitle: "",
  heroDescription: "",
  heroPrimaryCta: "مشاهده پلن‌ها",
  heroSecondaryCta: "درخواست مشاوره",
  heroImageUrl: "",
  heroImageAlt: "",
  benefits: "",
  steps: "",
  trustTitle: "راه‌اندازی شفاف و قابل پیگیری",
  trustDescription: "",
  trustItems: "",
  faq: "",
  ctaTitle: "",
  ctaDescription: "",
  ctaLabel: "درخواست مشاوره",
  ctaHref: "/#consultation",
};

function pairLines(items: Array<{ title: string; description: string }>) {
  return items.map((item) => `${item.title} | ${item.description}`).join("\n");
}

function parsePairLines(value: string) {
  return value
    .split("\n")
    .map((line) => {
      const [title, ...description] = line.split("|");
      return {
        title: title?.trim() || "",
        description: description.join("|").trim(),
      };
    })
    .filter((item) => item.title && item.description);
}

export default function AdminServicesPage() {
  const [services, setServices] =
    useState<AdminCatalogService[]>(
      [],
    );
  const [search, setSearch] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [editorOpen, setEditorOpen] =
    useState(false);
  const [editing, setEditing] =
    useState<AdminCatalogService | null>(
      null,
    );
  const [draft, setDraft] =
    useState<Draft>(emptyDraft);
  const [saving, setSaving] =
    useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<AdminCatalogService | null>(
      null,
    );

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((old) => ({ ...old, [key]: value }));
  }

  async function refresh() {
    setLoading(true);

    try {
      const result =
        await getAdminCatalogServicesApi();

      setServices(
        result.services,
      );
    } catch (reason) {
      toast.error(
        "دریافت کاتالوگ انجام نشد",
        {
          description:
            reason instanceof Error
              ? reason.message
              : undefined,
        },
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q =
      search
        .trim()
        .toLowerCase();

    if (!q) return services;

    return services.filter(
      (service) =>
        `${service.name} ${service.category} ${service.id} ${service.slug}`
          .toLowerCase()
          .includes(q),
    );
  }, [search, services]);

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  }

  function openEdit(
    service: AdminCatalogService,
  ) {
    setEditing(service);
    setDraft({
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortName:
        service.shortName,
      category:
        service.category,
      description:
        service.description,
      appHref:
        service.appHref || "",
      marketingHref:
        service.marketingHref,
      availability:
        service.availability,
      status: service.status,
      visibility:
        service.visibility,
      accent: service.accent,
      iconKey:
        service.iconKey,
      sortOrder: String(
        service.sortOrder,
      ),
      features:
        service.features.join(
          "\n",
        ),
      heroEyebrow: service.marketingContent.hero.eyebrow,
      heroTitle: service.marketingContent.hero.title,
      heroDescription: service.marketingContent.hero.description,
      heroPrimaryCta: service.marketingContent.hero.primaryCtaLabel,
      heroSecondaryCta: service.marketingContent.hero.secondaryCtaLabel,
      heroImageUrl: service.marketingContent.hero.imageUrl,
      heroImageAlt: service.marketingContent.hero.imageAlt,
      benefits: pairLines(service.marketingContent.benefits),
      steps: pairLines(service.marketingContent.steps),
      trustTitle: service.marketingContent.trust.title,
      trustDescription: service.marketingContent.trust.description,
      trustItems: service.marketingContent.trust.items.join("\n"),
      faq: service.marketingContent.faq
        .map((item) => `${item.question} | ${item.answer}`)
        .join("\n"),
      ctaTitle: service.marketingContent.cta.title,
      ctaDescription: service.marketingContent.cta.description,
      ctaLabel: service.marketingContent.cta.label,
      ctaHref: service.marketingContent.cta.href,
    });
    setEditorOpen(true);
  }

  async function save() {
    setSaving(true);

    try {
      const features = draft.features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      const defaults = createDefaultServiceMarketingContent({
        name: draft.name,
        category: draft.category,
        description: draft.description,
        features,
      });
      const payload = {
        id: draft.id,
        slug:
          draft.slug ||
          draft.id,
        name: draft.name,
        shortName:
          draft.shortName ||
          draft.name,
        category:
          draft.category,
        description:
          draft.description,
        appHref:
          draft.appHref ||
          null,
        marketingHref:
          draft.marketingHref,
        availability:
          draft.availability,
        status: draft.status,
        visibility:
          draft.visibility,
        accent:
          draft.accent,
        iconKey:
          draft.iconKey,
        sortOrder:
          Number(
            draft.sortOrder,
          ) || 100,
        features,
        marketingContent: {
          version: 1 as const,
          hero: {
            eyebrow: draft.heroEyebrow || defaults.hero.eyebrow,
            title: draft.heroTitle || defaults.hero.title,
            description: draft.heroDescription || defaults.hero.description,
            primaryCtaLabel: draft.heroPrimaryCta || defaults.hero.primaryCtaLabel,
            secondaryCtaLabel: draft.heroSecondaryCta || defaults.hero.secondaryCtaLabel,
            imageUrl: draft.heroImageUrl,
            imageAlt: draft.heroImageAlt,
          },
          benefits: parsePairLines(draft.benefits).length
            ? parsePairLines(draft.benefits)
            : defaults.benefits,
          steps: parsePairLines(draft.steps).length
            ? parsePairLines(draft.steps)
            : defaults.steps,
          trust: {
            title: draft.trustTitle || defaults.trust.title,
            description: draft.trustDescription || defaults.trust.description,
            items: draft.trustItems.split("\n").map((item) => item.trim()).filter(Boolean),
          },
          faq: parsePairLines(draft.faq).map((item) => ({
            question: item.title,
            answer: item.description,
          })),
          cta: {
            title: draft.ctaTitle || defaults.cta.title,
            description: draft.ctaDescription || defaults.cta.description,
            label: draft.ctaLabel || defaults.cta.label,
            href: draft.ctaHref || defaults.cta.href,
          },
        },
      } as const;

      if (editing) {
        await updateAdminCatalogServiceApi(
          editing.id,
          payload,
        );
        toast.success(
          "سرویس بروزرسانی شد",
        );
      } else {
        await createAdminCatalogServiceApi(
          payload,
        );
        toast.success(
          "سرویس جدید اضافه شد",
        );
      }

      setEditorOpen(false);
      await refresh();
    } catch (reason) {
      toast.error(
        "ذخیره سرویس انجام نشد",
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
    if (!pendingDelete) return;

    setSaving(true);

    try {
      await deleteAdminCatalogServiceApi(
        pendingDelete.id,
      );

      toast.success(
        "سرویس حذف شد",
      );
      setPendingDelete(
        null,
      );
      await refresh();
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
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="کاتالوگ سرویس‌ها"
        description="مرجع مرکزی سرویس‌های Binix. هر تغییری از این بخش در لیست‌های سایت و پنل کاربر به‌صورت داینامیک منعکس می‌شود."
        actions={
          <Button
            leadingIcon={
              <Plus size={15} />
            }
            onClick={openCreate}
          >
            سرویس جدید
          </Button>
        }
      />

      <AdminFilterBar
        onReset={() =>
          setSearch("")
        }
        hasActiveFilters={Boolean(
          search,
        )}
      >
        <label className="relative block xl:w-[360px]">
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
            placeholder="نام، ID، Slug یا دسته‌بندی"
            className="font-ui h-10 w-full rounded-control border border-border bg-background pr-9 pl-3 text-xs outline-none focus:border-primary/40"
          />
        </label>
      </AdminFilterBar>

      {loading ? (
        <AdminTableSkeleton
          rows={5}
        />
      ) : filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map(
            (service) => {
              const Icon =
                iconRegistry[
                  service.iconKey as keyof typeof iconRegistry
                ] ||
                iconRegistry[
                  "layout-grid"
                ];

              return (
                <Card
                  key={
                    service.id
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-card border"
                        style={{
                          color:
                            service.accent,
                          borderColor:
                            `color-mix(in srgb, ${service.accent} 25%, transparent)`,
                          background:
                            `color-mix(in srgb, ${service.accent} 10%, transparent)`,
                        }}
                      >
                        <Icon
                          size={19}
                        />
                      </div>
                      <div className="min-w-0">
                        <h2
                          data-display-title="true"
                          className="truncate text-lg font-bold"
                        >
                          {
                            service.name
                          }
                        </h2>
                        <div className="mt-1 font-ui text-[10px] text-foreground-subtle">{service.shortName || service.category}</div>
                      </div>
                    </div>

                    <CatalogStatus
                      service={
                        service
                      }
                    />
                  </div>

                  <p className="mt-4 font-ui text-xs leading-6 text-foreground-muted">
                    {
                      service.description
                    }
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Mini
                      label="نوع نمایش"
                      value={
                        service.visibility === "public" ? "عمومی" : "خصوصی"
                      }
                    />
                    <Mini
                      label="وضعیت عرضه"
                      value={
                        service.availability === "available" ? "قابل عرضه" : "به‌زودی"
                      }
                    />
                    <Mini
                      label="ترتیب"
                      value={String(
                        service.sortOrder,
                      )}
                    />
                    <Mini
                      label="دسته‌بندی"
                      value={
                        service.category
                      }
                    />
                  </div>
                  <details className="mt-3 font-ui text-[10px] text-foreground-subtle"><summary className="cursor-pointer select-none hover:text-foreground-muted">نمایش اطلاعات فنی</summary><div className="mt-2 break-all rounded-control bg-surface-raised p-2" dir="ltr">ID: {service.id}<br/>Slug: {service.slug}</div></details>

                  <div className="mt-4 flex gap-2 border-t border-border-subtle pt-4">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() =>
                        openEdit(
                          service,
                        )
                      }
                    >
                      ویرایش
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      aria-label="حذف سرویس"
                      onClick={() =>
                        setPendingDelete(
                          service,
                        )
                      }
                    >
                      <Trash2
                        size={15}
                      />
                    </Button>
                  </div>
                </Card>
              );
            },
          )}
        </div>
      ) : (
        <div className="rounded-card border border-border bg-surface">
          <AdminEmptyState
            title="سرویسی پیدا نشد"
            description="عبارت جستجو را تغییر دهید یا یک سرویس جدید بسازید."
          />
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={() =>
          setEditorOpen(false)
        }
        title={
          editing
            ? "ویرایش سرویس"
            : "افزودن سرویس"
        }
        description="اطلاعات این فرم منبع مرکزی نمایش سرویس در Binix است."
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setEditorOpen(
                  false,
                )
              }
            >
              انصراف
            </Button>
            <Button
              loading={saving}
              onClick={() =>
                void save()
              }
            >
              ذخیره
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="شناسه فنی"
            value={draft.id}
            required
            disabled={Boolean(
              editing,
            )}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                id: value,
              }))
            }
          />
          <Field
            label="نامک انگلیسی"
            value={draft.slug}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                slug: value,
              }))
            }
          />
          <Field
            label="نام سرویس"
            value={draft.name}
            required
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                name: value,
              }))
            }
          />
          <Field
            label="نام کوتاه"
            value={
              draft.shortName
            }
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                shortName:
                  value,
              }))
            }
          />
          <Field
            label="دسته‌بندی"
            value={
              draft.category
            }
            required
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                category:
                  value,
              }))
            }
          />
          <Field
            label="رنگ شاخص"
            value={draft.accent}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                accent: value,
              }))
            }
          />
          <Field
            label="مسیر صفحه معرفی"
            value={
              draft.marketingHref
            }
            placeholder="خالی = /services/{slug}"
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                marketingHref:
                  value,
              }))
            }
          />
          <Field
            label="مسیر داخل پنل"
            value={draft.appHref}
            placeholder="خالی = Workspace عمومی خودکار"
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                appHref: value,
              }))
            }
          />

          <SelectField
            label="وضعیت سرویس"
            value={draft.status}
            options={[
              "active",
              "draft",
              "disabled",
            ]}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                status:
                  value as Draft["status"],
              }))
            }
          />

          <SelectField
            label="نوع نمایش"
            value={
              draft.visibility
            }
            options={[
              "public",
              "private",
            ]}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                visibility:
                  value as Draft["visibility"],
              }))
            }
          />

          <SelectField
            label="وضعیت عرضه"
            value={
              draft.availability
            }
            options={[
              "available",
              "coming-soon",
            ]}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                availability:
                  value as Draft["availability"],
              }))
            }
          />

          <SelectField
            label="آیکون"
            value={draft.iconKey}
            options={Object.keys(
              iconRegistry,
            )}
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                iconKey:
                  value,
              }))
            }
          />

          <Field
            label="ترتیب نمایش"
            value={
              draft.sortOrder
            }
            onChange={(value) =>
              setDraft((old) => ({
                ...old,
                sortOrder:
                  value,
              }))
            }
          />

          <label className="sm:col-span-2">
            <span className="font-ui mb-1.5 block text-xs text-foreground-muted">
              توضیحات
            </span>
            <textarea
              required
              data-field-label="توضیحات سرویس"
              value={
                draft.description
              }
              onChange={(event) =>
                setDraft(
                  (old) => ({
                    ...old,
                    description:
                      event
                        .target
                        .value,
                  }),
                )
              }
              rows={4}
              className="font-ui w-full rounded-control border border-border bg-background p-3 text-xs outline-none focus:border-primary/40"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="font-ui mb-1.5 block text-xs text-foreground-muted">
              قابلیت‌ها — هر خط یک مورد
            </span>
            <textarea
              value={
                draft.features
              }
              onChange={(event) =>
                setDraft(
                  (old) => ({
                    ...old,
                    features:
                      event
                        .target
                        .value,
                  }),
                )
              }
              rows={4}
              className="font-ui w-full rounded-control border border-border bg-background p-3 text-xs outline-none focus:border-primary/40"
            />
          </label>

          <div className="sm:col-span-2 mt-3 rounded-card border border-border bg-surface-raised/40 p-4">
            <h3 className="font-display text-base font-bold">محتوای صفحه معرفی</h3>
            <p className="font-ui mt-1 text-[11px] leading-6 text-foreground-muted">
              همه صفحات سرویس از همین بخش‌ها و با یک قالب مشترک ساخته می‌شوند.
            </p>
          </div>

          <Field label="برچسب بالای عنوان" value={draft.heroEyebrow} onChange={(value) => updateDraft("heroEyebrow", value)} />
          <Field label="عنوان اصلی صفحه" value={draft.heroTitle} onChange={(value) => updateDraft("heroTitle", value)} />
          <TextAreaField className="sm:col-span-2" label="توضیح ابتدای صفحه" value={draft.heroDescription} onChange={(value) => updateDraft("heroDescription", value)} />
          <Field label="متن دکمه پلن‌ها" value={draft.heroPrimaryCta} onChange={(value) => updateDraft("heroPrimaryCta", value)} />
          <Field label="متن دکمه مشاوره" value={draft.heroSecondaryCta} onChange={(value) => updateDraft("heroSecondaryCta", value)} />

          <div className="sm:col-span-2 rounded-card border border-border bg-surface-raised/35 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-ui text-xs font-semibold text-foreground-muted">تصویر سمت چپ Hero</div>
                <p className="font-ui mt-1 text-[10px] leading-5 text-foreground-subtle">اختیاری است؛ اگر تصویری انتخاب نشود، کارت فعلی سرویس نمایش داده می‌شود.</p>
              </div>
              <div className="flex gap-2">
                {draft.heroImageUrl ? (
                  <Button type="button" variant="secondary" onClick={() => {
                    updateDraft("heroImageUrl", "");
                    updateDraft("heroImageAlt", "");
                  }}>
                    حذف تصویر
                  </Button>
                ) : null}
                <Button type="button" variant="secondary" onClick={() => setMediaPickerOpen(true)}>
                  <ImagePlus size={15} /> {draft.heroImageUrl ? "تغییر تصویر" : "انتخاب یا آپلود تصویر"}
                </Button>
              </div>
            </div>
            {draft.heroImageUrl ? (
              <img src={draft.heroImageUrl} alt={draft.heroImageAlt || draft.heroTitle || draft.name} className="mt-4 aspect-[16/7] w-full rounded-control border border-border object-cover" />
            ) : null}
          </div>
          <Field label="Alt تصویر Hero" value={draft.heroImageAlt} placeholder="توضیح کوتاه برای دسترس‌پذیری و SEO" onChange={(value) => updateDraft("heroImageAlt", value)} />

          <TextAreaField
            className="sm:col-span-2"
            label="مزایا — هر خط: عنوان | توضیح"
            value={draft.benefits}
            rows={5}
            onChange={(value) => updateDraft("benefits", value)}
          />
          <TextAreaField
            className="sm:col-span-2"
            label="مراحل استفاده — هر خط: عنوان | توضیح"
            value={draft.steps}
            rows={5}
            onChange={(value) => updateDraft("steps", value)}
          />

          <Field label="عنوان بخش اعتماد" value={draft.trustTitle} onChange={(value) => updateDraft("trustTitle", value)} />
          <TextAreaField label="توضیح بخش اعتماد" value={draft.trustDescription} onChange={(value) => updateDraft("trustDescription", value)} />
          <TextAreaField
            className="sm:col-span-2"
            label="موارد اعتماد — هر خط یک مورد"
            value={draft.trustItems}
            onChange={(value) => updateDraft("trustItems", value)}
          />
          <TextAreaField
            className="sm:col-span-2"
            label="پرسش‌های متداول — هر خط: پرسش | پاسخ"
            value={draft.faq}
            rows={5}
            onChange={(value) => updateDraft("faq", value)}
          />

          <Field label="عنوان دعوت پایانی" value={draft.ctaTitle} onChange={(value) => updateDraft("ctaTitle", value)} />
          <Field label="متن دکمه پایانی" value={draft.ctaLabel} onChange={(value) => updateDraft("ctaLabel", value)} />
          <TextAreaField className="sm:col-span-2" label="توضیح دعوت پایانی" value={draft.ctaDescription} onChange={(value) => updateDraft("ctaDescription", value)} />
          <Field label="لینک دکمه پایانی" value={draft.ctaHref} placeholder="مثال: /#consultation" onChange={(value) => updateDraft("ctaHref", value)} />
        </div>
      </Modal>

      <Modal
        open={Boolean(
          pendingDelete,
        )}
        onClose={() =>
          setPendingDelete(
            null,
          )
        }
        title="حذف سرویس"
        description={
          pendingDelete
            ? `سرویس «${pendingDelete.name}» حذف شود؟`
            : ""
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setPendingDelete(
                  null,
                )
              }
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              loading={saving}
              onClick={() =>
                void remove()
              }
            >
              حذف
            </Button>
          </div>
        }
      >
        <p className="font-ui text-sm leading-6 text-foreground-muted">
          اگر این سرویس به کسب‌وکاری تخصیص داده شده باشد، سرور اجازه حذف نمی‌دهد.
        </p>
      </Modal>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        selectedUrl={draft.heroImageUrl}
        title="انتخاب تصویر Hero سرویس"
        onSelect={(item) => {
          updateDraft("heroImageUrl", item.url);
          updateDraft("heroImageAlt", item.altText || draft.heroImageAlt || draft.heroTitle || draft.name);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="font-ui mb-1.5 block text-xs text-foreground-muted">
        {label}
      </span>
      <input
        required={required}
        data-field-label={label}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="font-ui h-10 w-full rounded-control border border-border bg-background px-3 text-xs outline-none focus:border-primary/40 disabled:opacity-50"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="font-ui mb-1.5 block text-xs text-foreground-muted">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="font-ui w-full rounded-control border border-border bg-background p-3 text-xs leading-6 outline-none focus:border-primary/40"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label>
      <span className="font-ui mb-1.5 block text-xs text-foreground-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="font-ui h-10 w-full rounded-control border border-border bg-background px-3 text-xs outline-none"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option === "active" ? "فعال" : option === "draft" ? "پیش‌نویس" : option === "disabled" ? "غیرفعال" : option === "public" ? "عمومی" : option === "private" ? "خصوصی" : option === "available" ? "قابل عرضه" : option === "coming-soon" ? "به‌زودی" : option}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

function Mini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control bg-surface-raised/60 p-2.5">
      <div className="font-ui text-[9px] text-foreground-subtle">
        {label}
      </div>
      <div className="mt-1 truncate font-ui text-[11px] font-semibold">
        {value}
      </div>
    </div>
  );
}

function CatalogStatus({
  service,
}: {
  service: AdminCatalogService;
}) {
  if (
    service.status === "disabled"
  ) {
    return (
      <Badge variant="error">
        غیرفعال
      </Badge>
    );
  }

  if (
    service.status === "draft"
  ) {
    return (
      <Badge variant="warning">
        پیش‌نویس
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      فعال
    </Badge>
  );
}
