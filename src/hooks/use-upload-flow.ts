"use client";

import { useEffect, useState } from "react";

import { loadingSteps } from "@/constants/loading-steps";
import type { ExcelFileType } from "@/constants/excel-files";
import type { HeroStep } from "@/types/hero";

export function useUploadFlow() {
  const [step, setStep] =
    useState<HeroStep>("upload");

  const [file, setFile] =
    useState<File | null>(null);

  const [selectedExcelType, setSelectedExcelType] =
    useState<ExcelFileType | null>(null);

  const [loadingIndex, setLoadingIndex] =
    useState(0);

  const loadingText =
    loadingSteps[loadingIndex];

  const progress = Math.round(
    ((loadingIndex + 1) /
      loadingSteps.length) *
      100
  );

  useEffect(() => {
    if (step !== "loading") return;

    setLoadingIndex(0);

    const interval = setInterval(() => {
      setLoadingIndex((prev) => {
        if (
          prev >=
          loadingSteps.length - 1
        ) {
          clearInterval(interval);

          setStep("report");

          return prev;
        }

        return prev + 1;
      });
    }, 1600);

    return () =>
      clearInterval(interval);
  }, [step]);

  function selectExcelType(
    type: ExcelFileType
  ) {
    setSelectedExcelType(type);

    // با تغییر نوع فایل،
    // فایل قبلی دیگر معتبر نیست.
    setFile(null);
  }

  function selectFile(
    selectedFile: File
  ) {
    setFile(selectedFile);
  }

  function startAnalyze() {
    if (!file) return;

    if (!selectedExcelType) return;

    setLoadingIndex(0);

    setStep("loading");
  }

  function removeFile() {
    setFile(null);

    setLoadingIndex(0);

    setStep("upload");
  }

  function resetFlow() {
    setFile(null);

    setSelectedExcelType(null);

    setLoadingIndex(0);

    setStep("upload");
  }

  return {
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
  };
}