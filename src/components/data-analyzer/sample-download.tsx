"use client";

import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
} from "lucide-react";

import type { ExcelFileType } from "@/constants/excel-files";

type SampleDownloadProps = {
  file: ExcelFileType;
};

export default function SampleDownload({
  file,
}: SampleDownloadProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className=" rounded-2xl border  border-white/10  bg-white/[0.025] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Icon */}

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border  border-emerald-400/10  bg-emerald-500/1">
          <FileSpreadsheet
            size={22}
            className="text-emerald-400"
          />
        </div>

        {/* Information */}

        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            فایل نمونه {file.title}
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            ابتدا فایل نمونه را دانلود کنید و
            اطلاعات خود را طبق ساختار آن وارد کنید.
          </p>
        </div>

        {/* Download */}

        <a
          href={file.downloadUrl}
          download={file.fileName}
          className=" inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border  border-service-accent/20  bg-service-accent/10 px-5 py-3 text-sm font-semibold  text-service-accent  transition-al  hover:border-service-accent/30  hover:bg-service-accent/20  hover:text-service-accent-secondary">
          <Download size={17} />

          <span>
            دانلود فایل نمونه
          </span>
        </a>
      </div>

      {/* File name */}

      <div
        className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-zinc-300">
        <FileSpreadsheet size={14} />

        <span className="truncate">
          {file.fileName}
        </span>
      </div>
    </motion.div>
  );
}