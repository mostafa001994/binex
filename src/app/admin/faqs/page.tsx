"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CircleHelp,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminSession } from "@/components/admin/admin-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {
  getAdminFaqSettingsApi,
  updateAdminFaqPageApi,
  type AdminFaqItem,
  type AdminFaqPage,
  type AdminFaqSettings,
} from "@/lib/api-client/admin";

function newFaqItem(): AdminFaqItem {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
    sortOrder: 0,
    isActive: true,
  };
}

export default function AdminFaqsPage() {
  const { user } = useAdminSession();
  const canWrite = hasAdminPermission(user.permissions, "admin.content.write");
  const [settings, setSettings] = useState<AdminFaqSettings | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [items, setItems] = useState<AdminFaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSignature, setSavedSignature] = useState("[]");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminFaqItem | null>(null);

  const selectedPage = useMemo(
    () => settings?.pages.find((page) => page.path === selectedPath) ?? null,
    [selectedPath, settings],
  );
  const activeCount = items.filter((item) => item.isActive).length;
  const dirty = JSON.stringify(items) !== savedSignature;
  useUnsavedChanges(dirty);

  const load = useCallback(async (preferredPath?: string) => {
    setLoading(true);
    try {
      const result = await getAdminFaqSettingsApi();
      const path =
        preferredPath && result.pages.some((page) => page.path === preferredPath)
          ? preferredPath
          : result.pages[0]?.path || "";
      const page = result.pages.find((item) => item.path === path);
      setSettings(result);
      setSelectedPath(path);
      setItems(page?.items ?? []);
      setSavedSignature(JSON.stringify(page?.items ?? []));
    } catch (error) {
      toast.error("دریافت سوالات متداول انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function selectPage(page: AdminFaqPage) {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده کنار گذاشته شود؟")) return;
    setSelectedPath(page.path);
    setItems(page.items);
    setSavedSignature(JSON.stringify(page.items));
  }

  function updateItem(id: string, patch: Partial<AdminFaqItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, sortOrder) => ({ ...item, sortOrder }));
    });
  }

  function moveTo(index: number, target: number) {
    if (index === target || index < 0 || target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next.map((item, sortOrder) => ({ ...item, sortOrder }));
    });
  }

  async function save() {
    if (!selectedPath) return;
    const incompleteIndex = items.findIndex(
      (item) => !item.question.trim() || !item.answer.trim(),
    );
    if (incompleteIndex >= 0) {
      toast.error("عنوان سوال و متن پاسخ را برای همه موارد کامل کنید.");
      window.setTimeout(() => {
        const field = document.querySelector<HTMLElement>(
          `[data-faq-index="${incompleteIndex}"] ${!items[incompleteIndex].question.trim() ? "input" : "textarea"}`,
        );
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        field?.focus();
      }, 20);
      return;
    }
    const seen = new Map<string, number>();
    const duplicateIndex = items.findIndex((item, index) => {
      const normalized = item.question.trim().toLocaleLowerCase("fa-IR");
      if (seen.has(normalized)) return true;
      seen.set(normalized, index);
      return false;
    });
    if (duplicateIndex >= 0) {
      toast.error("سوال تکراری را حذف یا ویرایش کنید.");
      window.setTimeout(() => {
        const field = document.querySelector<HTMLElement>(
          `[data-faq-index="${duplicateIndex}"] input`,
        );
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        field?.focus();
      }, 20);
      return;
    }
    setSaving(true);
    try {
      if (!selectedPage) return;
      await updateAdminFaqPageApi({
        pagePath: selectedPath,
        version: selectedPage.version,
        items,
      });
      await load(selectedPath);
      toast.success("سوالات متداول ذخیره شد");
    } catch (error) {
      toast.error("ذخیره سوالات متداول انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-admin-form-root className="space-y-6">
      <AdminPageHeader
        title="مدیریت سوالات متداول"
        description="سوال‌های هر صفحه را ویرایش، مرتب و منتشر کنید. فقط موارد فعال در سایت و Schema گوگل نمایش داده می‌شوند."
        actions={
          <Button
            loading={saving}
            disabled={!selectedPath || loading || !canWrite || !dirty}
            onClick={() => void save()}
          >
            <Save size={15} /> ذخیره تغییرات
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit p-3">
          <div className="mb-2 flex items-center gap-2 px-2 py-1 text-sm font-bold">
            <CircleHelp size={16} className="text-primary" /> صفحات دارای FAQ
          </div>
          {loading ? (
            <p className="text-foreground-muted p-4 text-sm">در حال دریافت...</p>
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
                  <Badge variant="info">
                    {page.items.filter((item) => item.isActive).length.toLocaleString("fa-IR")}
                    /{page.items.length.toLocaleString("fa-IR")}
                  </Badge>
                </span>
                <span dir="ltr" className="text-foreground-subtle mt-1 block text-xs">
                  {page.path}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {selectedPage ? (
          <div className="space-y-4">
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <div>
                <h2 className="font-bold">{selectedPage.label}</h2>
                <p dir="ltr" className="text-foreground-subtle mt-1 text-xs">
                  {selectedPage.path}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={activeCount ? "success" : "warning"}>
                  {activeCount.toLocaleString("fa-IR")} فعال
                </Badge>
                <Badge variant={items.length >= 30 ? "warning" : "default"}>
                  {items.length.toLocaleString("fa-IR")}/۳۰ سوال
                </Badge>
                <a
                  href={selectedPage.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-control border-border bg-surface-muted inline-flex h-10 items-center justify-center gap-2 border px-3 text-sm font-semibold"
                >
                  <ExternalLink size={14} /> مشاهده صفحه
                </a>
                <Button
                  variant="secondary"
                  disabled={!canWrite || items.length >= 30}
                  onClick={() =>
                    setItems((current) => [
                      ...current,
                      { ...newFaqItem(), sortOrder: current.length },
                    ])
                  }
                >
                  <Plus size={15} /> افزودن سوال
                </Button>
              </div>
            </Card>

            {items.length === 0 ? (
              <Card className="border-dashed p-10 text-center">
                <CircleHelp className="text-foreground-subtle mx-auto" size={34} />
                <h3 className="mt-3 font-bold">این صفحه سوالی ندارد</h3>
                <p className="text-foreground-muted mt-2 text-sm">
                  با افزودن اولین سوال، بخش FAQ دوباره در صفحه نمایش داده می‌شود.
                </p>
              </Card>
            ) : null}

            {items.map((item, index) => (
              <Card
                key={item.id}
                data-faq-index={index}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedIndex != null) moveTo(draggedIndex, index);
                  setDraggedIndex(null);
                }}
                className={`p-4 sm:p-5 ${item.isActive ? "" : "opacity-70"} ${draggedIndex === index ? "border-primary opacity-50" : ""}`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      draggable={canWrite}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className="text-foreground-subtle cursor-grab"
                      title="برای جابه‌جایی بکشید"
                    >
                      <GripVertical size={18} aria-hidden="true" />
                    </span>
                    <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-bold">
                      {(index + 1).toLocaleString("fa-IR")}
                    </span>
                    <button
                      type="button"
                      disabled={!canWrite}
                      onClick={() => updateItem(item.id, { isActive: !item.isActive })}
                      className="border-border bg-surface-muted rounded-control inline-flex h-9 items-center gap-2 border px-3 text-xs font-semibold"
                    >
                      {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      {item.isActive ? "فعال" : "پنهان"}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!canWrite || index === 0}
                      title="انتقال به بالا"
                      aria-label="انتقال سوال به بالا"
                      onClick={() => moveItem(index, -1)}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!canWrite || index === items.length - 1}
                      title="انتقال به پایین"
                      aria-label="انتقال سوال به پایین"
                      onClick={() => moveItem(index, 1)}
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-error"
                      disabled={!canWrite}
                      title="حذف سوال"
                      aria-label="حذف سوال"
                      onClick={() => setRemoveTarget(item)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="text-foreground-muted text-xs font-semibold">
                    <span className="flex items-center justify-between gap-2">
                      سوال
                      <span className="text-foreground-subtle">
                        {item.question.length.toLocaleString("fa-IR")}/۳۰۰
                      </span>
                    </span>
                    <input
                      required
                      data-field-label={`عنوان سوال ${index + 1}`}
                      value={item.question}
                      disabled={!canWrite}
                      maxLength={300}
                      onChange={(event) =>
                        updateItem(item.id, { question: event.target.value })
                      }
                      className="rounded-control border-border bg-background mt-2 h-11 w-full border px-3 text-sm"
                      placeholder="سوالی که کاربر می‌پرسد"
                    />
                  </label>
                  <label className="text-foreground-muted text-xs font-semibold">
                    <span className="flex items-center justify-between gap-2">
                      پاسخ
                      <span className="text-foreground-subtle">
                        {item.answer.length.toLocaleString("fa-IR")}/۲۰۰۰
                      </span>
                    </span>
                    <textarea
                      required
                      data-field-label={`متن پاسخ ${index + 1}`}
                      value={item.answer}
                      disabled={!canWrite}
                      maxLength={2000}
                      rows={4}
                      onChange={(event) =>
                        updateItem(item.id, { answer: event.target.value })
                      }
                      className="rounded-control border-border bg-background mt-2 w-full border p-3 text-sm leading-7"
                      placeholder="پاسخ کامل، روشن و قابل فهم"
                    />
                  </label>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) {
            setItems((current) =>
              current.filter((candidate) => candidate.id !== removeTarget.id),
            );
          }
          setRemoveTarget(null);
        }}
        title="حذف سوال"
        description={`سوال «${removeTarget?.question || "بدون عنوان"}» از این صفحه حذف شود؟`}
        consequences={["حذف پس از زدن دکمه ذخیره تغییرات در سایت اعمال می‌شود."]}
        confirmLabel="حذف سوال"
      />
    </div>
  );
}
