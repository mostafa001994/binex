"use client";

import { FileSpreadsheet, UploadCloud, X } from "lucide-react";
import type { ChangeEvent, DragEvent } from "react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const DEFAULT_MAX_MB = 15;

interface UploadZoneProps {
  accept?: string;
  onFileSelect?: (file: File) => void;
  onClear?: () => void;
  className?: string;
  maxSizeMb?: number;
  selectedFile?: File | null;
}

export function UploadZone({
  accept = ".xlsx,.xls,.csv",
  onFileSelect,
  onClear,
  className,
  maxSizeMb = DEFAULT_MAX_MB,
  selectedFile,
}: UploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function validate(file: File) {
    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || !["xlsx", "xls", "csv"].includes(extension)) return "فرمت فایل پشتیبانی نمی‌شود. فایل XLSX، XLS یا CSV انتخاب کنید.";
    if (file.size > maxSizeMb * 1024 * 1024) return `حجم فایل باید کمتر از ${maxSizeMb.toLocaleString("fa-IR")} مگابایت باشد.`;
    return "";
  }

  function acceptFile(file?: File) {
    if (!file) return;
    const message = validate(file);
    setError(message);
    if (!message) onFileSelect?.(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className={className}>
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={handleDrop}
        className={cn(
          "group relative flex min-h-56 flex-col items-center justify-center rounded-panel border border-dashed p-6 text-center transition duration-200",
          dragging ? "border-primary bg-primary/[0.06]" : "border-border-strong bg-surface-muted/50 hover:border-primary/50 hover:bg-surface-muted",
        )}
      >
        <input ref={inputRef} id={inputId} type="file" accept={accept} onChange={handleChange} className="sr-only" />

        {selectedFile ? (
          <>
            <div className="flex size-12 items-center justify-center rounded-control border border-success/20 bg-success/10 text-success"><FileSpreadsheet size={22} aria-hidden="true" /></div>
            <h3 data-display-title="true" className="mt-4 max-w-full truncate text-lg font-bold text-foreground">{selectedFile.name}</h3>
            <p className="mt-2 font-ui text-xs text-foreground-subtle">{(selectedFile.size / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 2 })} مگابایت</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="font-ui rounded-control border border-border bg-surface px-3 py-2 text-xs text-foreground transition hover:bg-surface-hover">انتخاب فایل دیگر</button>
              {onClear && <button type="button" onClick={onClear} className="font-ui inline-flex items-center gap-1.5 rounded-control px-3 py-2 text-xs text-error transition hover:bg-error/10"><X size={14} />حذف فایل</button>}
            </div>
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-control border border-accent/20 bg-accent/10 text-accent shadow-glow-sm"><UploadCloud size={22} aria-hidden="true" /></div>
            <h3 data-display-title="true" className="mt-4 text-lg font-bold text-foreground">فایل خود را بارگذاری کنید</h3>
            <p className="mt-2 max-w-md font-ui text-sm leading-6 text-foreground-muted">فایل را بکشید و اینجا رها کنید یا از دستگاه انتخاب کنید.</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="font-ui mt-4 rounded-control bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primary-hover">انتخاب فایل</button>
            <p className="mt-3 font-ui text-xs text-foreground-subtle">XLSX، XLS یا CSV · حداکثر {maxSizeMb.toLocaleString("fa-IR")} مگابایت</p>
          </>
        )}
      </div>
      {error && <p role="alert" className="mt-2 font-ui text-xs text-error">{error}</p>}
    </div>
  );
}
