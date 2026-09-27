"use client";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    Check,
    Download,
    FileSpreadsheet,
} from "lucide-react";

import { useState } from "react";

import { excelFiles } from "@/constants/excel-files";
import { useUploadFlow } from "@/hooks/use-upload-flow";

import FileTypeSelect from "./file-type-select";
import UploadCard from "./upload-card";
import Loading from "./loading";
import Report from "./report";

export default function UploadFlow() {
    const {
        step,
        file,
        selectedExcelType,
        loadingText,
        progress,

        selectExcelType,
        selectFile,
        startAnalyze,
        removeFile,
        resetFlow,
    } = useUploadFlow();

    const [sampleDownloaded, setSampleDownloaded] =
        useState(false);


    function handleSelectExcelType(
        selectedFile: (typeof excelFiles)[number]
    ) {
        setSampleDownloaded(false);
        removeFile();
        selectExcelType(selectedFile);
    }


    function handleSampleDownload() {
        setSampleDownloaded(true);
    }

    /*
     * Loading
     */

    if (step === "loading") {
        return (
            <Loading
                step={loadingText}
                progress={progress}
            />
        );
    }

    /*
     * Report
     */

    if (step === "report") {
        return (
            <Report
                onReset={resetFlow}
            />
        );
    }

    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
            }}
            className="
        relative
        rounded-[28px]
        border
        border-white/10
        bg-white/[0.035]
        p-4
        shadow-[0_20px_70px_rgba(0,0,0,.4)]
        backdrop-blur-3xl
        sm:rounded-[32px]
        sm:p-5
        lg:p-6
      "
        >
            {/* Ambient Glow */}

            <div
                className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-48
          w-[70%]
          -translate-x-1/2
          rounded-full
          bg-service-accent/[0.07]
          blur-[100px]
        "
            />

            <div className="relative z-10">

                {/* Header */}

                <div className="mb-5 text-center">

                    <div
                        className="
              mx-auto
              mb-2.5
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-service-accent/20
              bg-service-accent/10
            "
                    >
                        <FileSpreadsheet
                            size={19}
                            className="text-service-accent"
                        />
                    </div>

                    <h2 className="text-lg font-bold sm:text-xl">
                        شروع تحلیل فایل
                    </h2>

                    <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
                        فایل موردنظر خود را انتخاب و برای تحلیل آماده کنید.
                    </p>

                </div>

                {/* Main Grid */}

                <div className="grid gap-4 lg:grid-cols-2">

                    {/* -------------------------------- */}
                    {/* File Type */}
                    {/* -------------------------------- */}

                    <Section>

                        <SectionHeader
                            icon={
                                <FileSpreadsheet
                                    size={15}
                                />
                            }
                            title="نوع فایل"
                            description="نوع اطلاعاتی که می‌خواهید تحلیل کنید."
                        />

                        <div className="mt-3">

                            <FileTypeSelect
                                files={excelFiles}
                                value={selectedExcelType}
                                onChange={handleSelectExcelType}
                            />

                        </div>

                    </Section>

                    {/* -------------------------------- */}
                    {/* Sample File */}
                    {/* -------------------------------- */}

                    <Section>

                        <SectionHeader
                            icon={
                                <Download
                                    size={15}
                                />
                            }
                            title="فایل نمونه"
                            description="نمونه را دانلود و اطلاعات خود را وارد کنید."
                        />

                        {selectedExcelType ? (
                            <div
                                className="
                  mt-3
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  p-3
                "
                            >

                                <div className="flex items-center gap-2.5">

                                    <div
                                        className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-500/10
                      text-emerald-400
                    "
                                    >
                                        <FileSpreadsheet
                                            size={17}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-xs font-semibold">
                                            {selectedExcelType.title}
                                        </p>

                                        <p className="mt-0.5 truncate text-[10px] text-zinc-300">
                                            {selectedExcelType.fileName}
                                        </p>

                                    </div>

                                    {sampleDownloaded && (
                                        <div
                                            className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-500/10
                        text-emerald-400
                      "
                                        >
                                            <Check size={13} />
                                        </div>
                                    )}

                                </div>

                                <a
                                    href={
                                        selectedExcelType.downloadUrl
                                    }
                                    download={
                                        selectedExcelType.fileName
                                    }
                                    onClick={
                                        handleSampleDownload
                                    }
                                    className="
                    group
                    mt-2.5
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-service-accent/20
                    bg-service-accent/10
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-service-accent
                    transition-all
                    duration-200
                    hover:border-service-accent/40
                    hover:bg-service-accent/15
                  "
                                >

                                    <Download
                                        size={15}
                                        className="
                      transition-transform
                      duration-200
                      group-hover:translate-y-0.5
                    "
                                    />

                                    {sampleDownloaded
                                        ? "دانلود مجدد فایل نمونه"
                                        : "دانلود فایل نمونه"}

                                </a>

                            </div>
                        ) : (
                            <div
                                className="mt-3 flex min-h-[91px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-4 text-center text-xs text-zinc-300"
                            >
                                ابتدا نوع فایل را انتخاب کنید
                            </div>
                        )}

                        <AnimatePresence>
                            {sampleDownloaded && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        y: -4,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400"
                                >
                                    <Check size={12} />

                                    فایل نمونه آماده شد. اطلاعات خود را
                                    وارد کنید و سپس آپلود کنید.
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </Section>

                </div>

                {/* -------------------------------- */}
                {/* Upload */}
                {/* -------------------------------- */}

                <AnimatePresence>
                    {selectedExcelType &&
                        sampleDownloaded && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    height: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    height: "auto",
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                    y: 8,
                                }}
                                transition={{
                                    duration: 0.3,
                                }}
                                className="overflow-hidden"
                            >

                                <div className="mt-4">

                                    <Section>

                                        <SectionHeader
                                            icon={
                                                <FileSpreadsheet
                                                    size={15}
                                                />
                                            }
                                            title="فایل تکمیل‌شده"
                                            description="فایل Excel تکمیل‌شده را برای تحلیل بارگذاری کنید."
                                        />

                                        <div className="mt-3">

                                            <UploadCard
                                                file={file}
                                                onSelectFile={
                                                    selectFile
                                                }
                                                onAnalyze={
                                                    startAnalyze
                                                }
                                                onRemove={
                                                    removeFile
                                                }
                                            />

                                        </div>

                                    </Section>

                                </div>

                            </motion.div>
                        )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
}

/*
|--------------------------------------------------------------------------
| Section
|--------------------------------------------------------------------------
*/

function Section({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            {children}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Section Header
|--------------------------------------------------------------------------
*/

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-2.5">

            <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-service-accent/10 text-service-accent">
                {icon}
            </div>

            <div className="min-w-0">

                <h3 className="text-xs font-semibold sm:text-sm">
                    {title}
                </h3>

                <p className="mt-0.5 truncate text-[10px] text-zinc-300 sm:text-xs">
                    {description}
                </p>

            </div>

        </div>
    );
}