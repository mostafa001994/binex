"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileImage, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  getBlogMediaApi,
  uploadBlogMediaApi,
  type AdminPagination,
  type BlogMediaItem,
} from "@/lib/api-client/admin";

const emptyPagination: AdminPagination = {
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 1,
};

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  selectedUrl,
  title = "انتخاب از کتابخانه رسانه",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: BlogMediaItem) => void;
  selectedUrl?: string;
  title?: string;
}) {
  const [items, setItems] = useState<BlogMediaItem[]>([]);
  const [pagination, setPagination] =
    useState<AdminPagination>(emptyPagination);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (open) void load(1, "");
  }, [open, load]);

  async function upload() {
    if (!file) {
      toast.error("ابتدا یک تصویر انتخاب کنید");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadBlogMediaApi(file, altText);
      setFile(null);
      setAltText("");
      if (fileRef.current) fileRef.current.value = "";
      await load(1, search);
      onSelect(result.item);
      onClose();
      toast.success("تصویر آپلود و انتخاب شد");
    } catch (error) {
      toast.error("آپلود تصویر انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="تصویر موجود را انتخاب کنید یا فایل جدیدی به کتابخانه اضافه کنید."
      size="xl"
    >
      <div className="space-y-5">
        <div className="border-border bg-surface-raised rounded-card grid gap-3 border p-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <label className="text-foreground-muted text-xs font-semibold">
            فایل جدید
            <span className="border-border bg-background rounded-control mt-2 flex h-11 items-center gap-2 border px-3">
              <FileImage size={16} className="text-primary" />
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="min-w-0 flex-1 text-xs file:hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <span className="truncate text-xs">
                {file?.name || "انتخاب تصویر"}
              </span>
            </span>
          </label>
          <label className="text-foreground-muted text-xs font-semibold">
            Alt تصویر
            <input
              value={altText}
              maxLength={255}
              onChange={(event) => setAltText(event.target.value)}
              className="border-border bg-background rounded-control mt-2 h-11 w-full border px-3"
              placeholder="توصیف کوتاه تصویر"
            />
          </label>
          <Button loading={uploading} onClick={() => void upload()}>
            <Upload size={15} /> آپلود و انتخاب
          </Button>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void load(1, search);
          }}
        >
          <label className="relative flex-1">
            <Search
              className="text-foreground-subtle absolute top-3 right-3"
              size={15}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجو در نام، Alt یا توضیح تصویر"
              className="border-border bg-background rounded-control h-10 w-full border pr-9 pl-3 text-sm"
            />
          </label>
          <Button type="submit" variant="secondary" loading={loading}>
            جست‌وجو
          </Button>
        </form>

        {!loading && !items.length ? (
          <p className="text-foreground-muted py-10 text-center text-sm">
            تصویری پیدا نشد.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              className={`rounded-card overflow-hidden border text-right transition ${selectedUrl === item.url ? "border-primary ring-primary/20 ring-2" : "border-border hover:border-primary/60"}`}
            >
              <img
                src={item.url}
                alt={item.altText || item.fileName}
                loading="lazy"
                className="bg-surface-muted aspect-video w-full object-cover"
              />
              <span className="block truncate p-2 text-xs font-semibold">
                {item.altText || item.fileName}
              </span>
            </button>
          ))}
        </div>

        {pagination.totalPages > 1 ? (
          <div className="border-border flex items-center justify-between border-t pt-4 text-xs">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page <= 1 || loading}
              onClick={() => void load(pagination.page - 1, search)}
            >
              صفحه قبل
            </Button>
            <span>
              صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
              {pagination.totalPages.toLocaleString("fa-IR")}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => void load(pagination.page + 1, search)}
            >
              صفحه بعد
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>,
    document.body,
  );
}
