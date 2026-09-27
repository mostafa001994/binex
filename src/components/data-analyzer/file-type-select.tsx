"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Check,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import type { excelFiles } from "@/constants/excel-files";

type ExcelFile =
  (typeof excelFiles)[number];

type FileTypeSelectProps = {
  files: readonly ExcelFile[];

  value: ExcelFile | null;

  onChange: (file: ExcelFile) => void;
};

export default function FileTypeSelect({
  files,
  value,
  onChange,
}: FileTypeSelectProps) {
  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * Close when clicking outside
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * Close with Escape
   */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  function handleSelect(
    file: ExcelFile
  ) {
    onChange(file);
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Trigger */}

      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className={cn(
          "group flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-right transition-all duration-300",
          open
            ? "border-service-accent/40 bg-service-accent/[0.08] shadow-[0_0_30px_rgba(56,189,248,.08)]"
            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
        )}
      >
        {/* Icon */}

        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all",
            value
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
              : "border-service-accent/20 bg-service-accent/10 text-service-accent"
          )}
        >
          <FileSpreadsheet
            size={22}
          />
        </div>

        {/* Selected value */}

        <div className="min-w-0 flex-1">
          {value ? (
            <>
              <p className="truncate text-sm font-semibold text-white">
                {value.title}
              </p>

              <p className="mt-1 truncate text-xs text-zinc-500">
                {value.fileName}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-300">
                انتخاب نوع فایل
              </p>

              <p className="mt-1 text-xs text-zinc-300">
                نوع فایل موردنظر خود را انتخاب کنید
              </p>
            </>
          )}
        </div>

        {/* Arrow */}

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="shrink-0 text-zinc-500"
        >
          <ChevronDown
            size={20}
          />
        </motion.div>
      </button>

      {/* Dropdown */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-2xl border  border-white/10  bg-marketing-surface/95 p-2 shadow-[0_25px_80px_rgba(0,0,0,.6)] backdrop-blur-3xl"
          >
            <div className="mb-1 px-3 py-2">
              <p className="text-[11px] font-medium text-zinc-300">
                نوع فایل
              </p>
            </div>

            <div className="space-y-1">
              {files.map((file) => {
                const selected =
                  value?.id === file.id;

                return (
                  <motion.button
                    key={file.id}
                    type="button"
                    whileTap={{
                      scale: 0.99,
                    }}
                    onClick={() =>
                      handleSelect(file)
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-all duration-200",
                      selected
                        ? "bg-service-accent/10"
                        : "hover:bg-white/[0.05]"
                    )}
                  >
                    {/* File Icon */}

                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                        selected
                          ? "border-service-accent/20 bg-service-accent/10 text-service-accent"
                          : "border-white/10 bg-white/[0.03] text-zinc-500"
                      )}
                    >
                      <FileSpreadsheet
                        size={19}
                      />
                    </div>

                    {/* Info */}

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          selected
                            ? "text-service-accent"
                            : "text-zinc-300"
                        )}
                      >
                        {file.title}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-zinc-300">
                        {file.fileName}
                      </p>
                    </div>

                    {/* Selected */}

                    {selected && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                        <Check
                          size={14}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}