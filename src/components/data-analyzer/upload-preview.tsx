"use client";

import { FileSpreadsheet, Play, X } from "lucide-react";

type UploadPreviewProps = {
  file: File;
  onAnalyze: () => void;
  onRemove: () => void;
};

export default function UploadPreview({
  file,
  onAnalyze,
  onRemove,
}: UploadPreviewProps) {
  const fileSize = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div
      className="
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        px-5
        py-3
      "
    >
      {/* File Icon */}
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/[0.06]
        "
      >
        <FileSpreadsheet
          size={22}
          strokeWidth={1.5}
          className="text-service-accent-secondary"
        />
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {file.name}
        </p>

        <p className="mt-0.5 text-[11px] text-white/35">
          {fileSize} MB
        </p>
      </div>

      {/* Analyze */}
      <button
        type="button"
        onClick={onAnalyze}
        className="
          flex
          h-9
          shrink-0
          items-center
          gap-2
          rounded-lg
          bg-white
          px-3.5
          text-xs
          font-medium
          text-black
          transition-all
          hover:bg-white/90
          cursor-pointer
        "
      >
        <Play size={13} fill="currentColor" />
        Analyze
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove file"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
      >
        <X size={15} />
      </button>
    </div>
  );
}