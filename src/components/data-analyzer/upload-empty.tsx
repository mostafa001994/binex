"use client";

import { FileSpreadsheet, Upload } from "lucide-react";

type UploadEmptyProps = {
  onUpload: (file: File) => void;
};

export default function UploadEmpty({
  onUpload,
}: UploadEmptyProps) {
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onUpload(file);
    event.target.value = "";
  };

  return (
    <label
      htmlFor="excel-upload"
      className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-4 text-left transition-all duration-300 hover:border-white/30 hover:bg-white/[0.05]">
      <input
        id="excel-upload"
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] transition-transform duration-300 group-hover:scale-105"
      >
        <FileSpreadsheet
          size={22}
          strokeWidth={1.5}
          className="text-service-accent-secondary"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 flex justify-center items-center flex-col">
        <div className="flex items-center gap-2">
          <Upload
            size={14}
            strokeWidth={1.8}
            className="shrink-0 text-white/50"
          />

          <span className="text-sm font-medium text-white">
            آپلود فایل اکسل نهایی
          </span>
        </div>

        <p className="mt-1 text-xs text-white/60">
          Drag & drop or click to browse
        </p>
      </div>

      {/* File types */}
      <span
        className="hidden shrink-0 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-white/60 sm:block"
      >
        XLSX · XLS · CSV
      </span>
    </label>
  );
}