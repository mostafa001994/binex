"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  FileImage,
  ImageOff,
  Pencil,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminSession } from "@/components/admin/admin-gate";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {
  deleteBlogMediaApi,
  getBlogMediaApi,
  getBlogMediaDetailsApi,
  updateBlogMediaApi,
  uploadBlogMediaApi,
  type AdminPagination,
  type BlogMediaDetails,
  type BlogMediaItem,
} from "@/lib/api-client/admin";

const emptyPagination: AdminPagination = {
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 1,
};

const acceptedMediaTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const maxMediaBytes = 5 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes.toLocaleString("fa-IR")} بایت`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} کیلوبایت`;
  return `${(bytes / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت`;
}

export default function AdminMediaPage() {
  const { user } = useAdminSession();
  const canWrite = hasAdminPermission(user.permissions, "admin.content.write");
  const canDelete = hasAdminPermission(user.permissions, "admin.content.publish");
  const [items, setItems] = useState<BlogMediaItem[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>(emptyPagination);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [details, setDetails] = useState<BlogMediaDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogMediaItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFiles(selected: File[]) {
    const valid: File[] = [];
    const invalid: string[] = [];
    for (const file of selected) {
      if (!acceptedMediaTypes.has(file.type)) invalid.push(`${file.name}: فرمت نامعتبر`);
      else if (!file.size || file.size > maxMediaBytes)
        invalid.push(`${file.name}: حجم بیشتر از ۵ مگابایت`);
      else valid.push(file);
    }
    setFiles(valid);
    if (invalid.length)
      toast.error(`${invalid.length.toLocaleString("fa-IR")} فایل انتخاب نشد`, {
        description: invalid.slice(0, 3).join("؛ "),
      });
  }

  const load = useCallback(async (page = 1, query = "") => {
    setLoading(true);
    try {
      const result = await getBlogMediaApi({ page, search: query.trim() });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("دریافت کتابخانه رسانه انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(1, search), 350);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  async function upload() {
    if (!files.length) {
      toast.error("ابتدا یک یا چند تصویر انتخاب کنید");
      return;
    }
    setUploading(true);
    let completed = 0;
    let reused = 0;
    const failed: { file: File; message: string }[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress(`${index + 1}/${files.length}`);
        try {
          const result = await uploadBlogMediaApi(file, files.length === 1 ? altText : "");
          completed += 1;
          if (result.item.deduplicated) reused += 1;
        } catch (error) {
          failed.push({
            file,
            message: error instanceof Error ? error.message : "خطای نامشخص",
          });
        }
      }
      if (completed)
        toast.success(`${completed.toLocaleString("fa-IR")} تصویر پردازش شد`, {
          description: reused
            ? `${reused.toLocaleString("fa-IR")} فایل تکراری بود و نسخه موجود دوباره استفاده شد.`
            : undefined,
        });
      if (failed.length)
        toast.error(`${failed.length.toLocaleString("fa-IR")} تصویر آپلود نشد`, {
          description: failed.slice(0, 3).map((item) => `${item.file.name}: ${item.message}`).join("؛ "),
        });
      setFiles(failed.map((item) => item.file));
      if (!failed.length) {
        setAltText("");
        if (inputRef.current) inputRef.current.value = "";
      }
      await load(1, search);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  }

  async function openDetails(item: BlogMediaItem) {
    setDetailsLoading(true);
    try {
      const result = await getBlogMediaDetailsApi(item.id);
      setDetails(result.item);
    } catch (error) {
      toast.error("دریافت جزئیات تصویر انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setDetailsLoading(false);
    }
  }

  async function saveDetails() {
    if (!details) return;
    setSavingDetails(true);
    try {
      const result = await updateBlogMediaApi(details.id, details);
      setDetails(result.item);
      await load(pagination.page, search);
      toast.success("مشخصات تصویر ذخیره شد");
    } catch (error) {
      toast.error("ذخیره مشخصات تصویر انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSavingDetails(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteBlogMediaApi(target.id);
      if (details?.id === target.id) setDetails(null);
      toast.success("تصویر حذف شد");
      await load(pagination.page, search);
    } catch (error) {
      toast.error("حذف تصویر انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  async function copyUrl(item: BlogMediaItem) {
    const url = new URL(item.url, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1500);
      toast.success("آدرس تصویر کپی شد");
    } catch {
      toast.error("کپی آدرس تصویر انجام نشد");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="کتابخانه رسانه"
        description="تصاویر را بارگذاری، توصیف و مدیریت کنید و محل استفاده هر فایل را ببینید."
        actions={<ButtonLink href="/admin/blog" variant="secondary">بازگشت به وبلاگ</ButtonLink>}
      />

      {canWrite ? (
        <Card data-admin-form-root className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <label className="text-foreground-muted block text-xs font-semibold">
            تصویر جدید
            <span
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                selectFiles(Array.from(event.dataTransfer.files));
              }}
              className={`border-border bg-background rounded-control mt-2 flex min-h-11 items-center gap-3 border border-dashed px-3 ${dragging ? "border-primary bg-primary/5" : ""}`}
            >
              <FileImage className="text-primary shrink-0" size={18} />
              <span className="min-w-0 flex-1 truncate text-xs">
                {files.length
                  ? `${files.length.toLocaleString("fa-IR")} فایل انتخاب شده`
                  : "تصاویر را انتخاب کنید یا اینجا بکشید؛ هر فایل حداکثر ۵ مگابایت"}
              </span>
              <input
                ref={inputRef}
                required
                data-field-label="تصویر جدید"
                multiple
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="max-w-28 text-xs file:hidden"
                onChange={(event) => selectFiles(Array.from(event.target.files ?? []))}
              />
            </span>
          </label>
          <label className="text-foreground-muted block text-xs font-semibold">
            Alt برای آپلود تک‌فایل
            <input
              value={altText}
              maxLength={255}
              disabled={files.length > 1}
              onChange={(event) => setAltText(event.target.value)}
              placeholder={files.length > 1 ? "پس از آپلود جداگانه ویرایش کنید" : "توصیف کوتاه تصویر"}
              className="border-border bg-background rounded-control mt-2 h-11 w-full border px-3 text-sm outline-none"
            />
          </label>
          <Button data-admin-submit="true" loading={uploading} onClick={() => void upload()}>
            <Upload size={15} /> {uploadProgress || "آپلود تصاویر"}
          </Button>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display font-bold">تصاویر ذخیره‌شده</h2>
            <p className="text-foreground-subtle mt-1 text-xs">
              {pagination.total.toLocaleString("fa-IR")} فایل
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search size={15} className="text-foreground-subtle absolute top-3 right-3" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجو در نام، Alt یا توضیح"
              className="border-border bg-background rounded-control h-10 w-full border pr-9 pl-3 text-sm outline-none"
            />
          </label>
        </div>

        {loading ? <p className="text-foreground-muted py-16 text-center text-sm">در حال دریافت تصاویر...</p> : null}
        {!loading && !items.length ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ImageOff className="text-foreground-subtle" size={36} />
            <p className="mt-3 font-semibold">تصویری پیدا نشد</p>
            <p className="text-foreground-muted mt-1 text-xs">تصویر جدید آپلود کنید یا عبارت جست‌وجو را تغییر دهید.</p>
          </div>
        ) : null}
        {!loading && items.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="border-border rounded-card overflow-hidden border">
                <button type="button" className="block w-full" onClick={() => void openDetails(item)}>
                  <img
                    src={item.url}
                    alt={item.isDecorative ? "" : item.altText || item.fileName}
                    loading="lazy"
                    className="bg-surface-muted aspect-video w-full object-cover"
                    style={{ objectPosition: `${item.focalX}% ${item.focalY}%` }}
                  />
                </button>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 truncate text-sm font-semibold" title={item.fileName}>
                      {item.altText || (item.isDecorative ? "تصویر تزئینی" : item.fileName)}
                    </h3>
                    {!item.altText && !item.isDecorative ? (
                      <span className="text-warning shrink-0 text-[10px]">Alt ناقص</span>
                    ) : null}
                  </div>
                  <p className="text-foreground-subtle mt-1 truncate text-[11px]">
                    {item.width && item.height ? `${item.width.toLocaleString("fa-IR")}×${item.height.toLocaleString("fa-IR")} · ` : ""}
                    {formatBytes(item.byteSize)} · {item.mimeType}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => void openDetails(item)}>
                      <Pencil size={13} /> جزئیات
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="کپی آدرس" onClick={() => void copyUrl(item)}>
                      {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                    {canDelete ? (
                      <Button size="icon" variant="ghost" className="text-error" aria-label={`حذف ${item.altText || item.fileName}`} onClick={() => setDeleteTarget(item)}>
                        <Trash2 size={14} />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {pagination.totalPages > 1 ? (
          <div className="border-border mt-5 flex items-center justify-between border-t pt-4 text-xs">
            <Button size="sm" variant="secondary" disabled={pagination.page <= 1 || loading} onClick={() => void load(pagination.page - 1, search)}>صفحه قبل</Button>
            <span>صفحه {pagination.page.toLocaleString("fa-IR")} از {pagination.totalPages.toLocaleString("fa-IR")}</span>
            <Button size="sm" variant="secondary" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => void load(pagination.page + 1, search)}>صفحه بعد</Button>
          </div>
        ) : null}
      </Card>

      <Modal
        open={Boolean(details)}
        onClose={() => setDetails(null)}
        title="جزئیات تصویر"
        description="متن جایگزین، توضیح و نقطه تمرکز تصویر را مدیریت کنید."
        size="lg"
        footer={details && canWrite ? <Button loading={savingDetails} onClick={() => void saveDetails()}>ذخیره مشخصات</Button> : undefined}
      >
        {details ? (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <img
                src={details.url}
                alt={details.isDecorative ? "" : details.altText || details.fileName}
                className="bg-surface-muted max-h-[440px] w-full rounded-lg object-contain"
              />
              <div className="text-foreground-muted mt-3 flex flex-wrap gap-3 text-xs">
                <span>{details.fileName}</span>
                <span>{formatBytes(details.byteSize)}</span>
                <span>{details.width}×{details.height}</span>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-foreground-muted block text-xs font-semibold">
                متن جایگزین (Alt)
                <input
                  required={!details.isDecorative}
                  data-field-label="متن جایگزین تصویر"
                  disabled={!canWrite || details.isDecorative}
                  value={details.altText ?? ""}
                  maxLength={255}
                  onChange={(event) => setDetails({ ...details, altText: event.target.value })}
                  className="border-border bg-background rounded-control mt-2 h-11 w-full border px-3 text-sm"
                />
              </label>
              <label className="border-border rounded-control flex items-center gap-3 border p-3 text-sm">
                <input
                  type="checkbox"
                  disabled={!canWrite}
                  checked={details.isDecorative}
                  onChange={(event) => setDetails({ ...details, isDecorative: event.target.checked })}
                />
                تصویر صرفاً تزئینی است
              </label>
              <label className="text-foreground-muted block text-xs font-semibold">
                توضیح تصویر
                <textarea
                  disabled={!canWrite}
                  value={details.caption ?? ""}
                  maxLength={500}
                  rows={3}
                  onChange={(event) => setDetails({ ...details, caption: event.target.value })}
                  className="border-border bg-background rounded-control mt-2 w-full border p-3 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["focalX", "focalY"] as const).map((axis) => (
                  <label key={axis} className="text-foreground-muted block text-xs font-semibold">
                    تمرکز {axis === "focalX" ? "افقی" : "عمودی"}
                    <input
                      type="number"
                      required
                      data-field-label={`تمرکز ${axis === "focalX" ? "افقی" : "عمودی"}`}
                      min={0}
                      max={100}
                      step={1}
                      disabled={!canWrite}
                      value={details[axis]}
                      onChange={(event) => setDetails({ ...details, [axis]: Number(event.target.value) })}
                      className="border-border bg-background rounded-control mt-2 h-11 w-full border px-3 text-sm"
                    />
                  </label>
                ))}
              </div>
              <Card className="bg-surface-hover p-4 text-xs">
                <div className="font-bold">محل استفاده</div>
                <div className="text-foreground-muted mt-2 grid grid-cols-2 gap-2 text-center">
                  <span>{details.usage.posts.toLocaleString("fa-IR")} مقاله</span>
                  <span>{details.usage.revisions.toLocaleString("fa-IR")} نسخه</span>
                  <span>{details.usage.seoPages.toLocaleString("fa-IR")} صفحه SEO</span>
                  <span>{details.usage.servicePages.toLocaleString("fa-IR")} صفحه سرویس</span>
                </div>
              </Card>
            </div>
          </div>
        ) : detailsLoading ? <p>در حال دریافت...</p> : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
        title="حذف تصویر"
        description={`تصویر «${deleteTarget?.altText || deleteTarget?.fileName || ""}» حذف شود؟`}
        consequences={["اگر تصویر در مقاله، نسخه قبلی، SEO یا صفحه سرویس استفاده شده باشد، سرور حذف را متوقف می‌کند.", "حذف فایل بدون استفاده برگشت‌پذیر نیست."]}
        confirmLabel="حذف تصویر"
      />
    </div>
  );
}
