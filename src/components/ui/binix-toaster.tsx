"use client";

import { Toaster } from "sonner";

export function BinixToaster() {
  return (
    <Toaster
      position="bottom-left"
      dir="rtl"
      duration={4200}
      closeButton
      gap={10}
      offset={20}
      mobileOffset={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "binix-toast group relative flex w-[min(340px,calc(100vw-32px))] items-start gap-3 overflow-hidden rounded-card border border-border bg-surface/95 px-3.5 py-3.5 font-ui text-foreground shadow-binix-lg backdrop-blur-xl",
          content: "min-w-0 flex-1 text-right",
          title: "text-[12.5px] font-bold leading-6 text-foreground",
          description:
            "mt-0.5 text-[10.5px] font-normal leading-5 text-foreground-muted",
          icon:
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control border border-border bg-surface-raised",
          success:
            "border-success/20 before:absolute before:inset-y-3 before:right-0 before:w-0.5 before:rounded-full before:bg-success",
          error:
            "border-error/25 before:absolute before:inset-y-3 before:right-0 before:w-0.5 before:rounded-full before:bg-error",
          warning:
            "border-warning/25 before:absolute before:inset-y-3 before:right-0 before:w-0.5 before:rounded-full before:bg-warning",
          info:
            "border-primary/20 before:absolute before:inset-y-3 before:right-0 before:w-0.5 before:rounded-full before:bg-primary",
          closeButton:
            "!absolute !-left-1.5 !-top-1.5 !right-auto !flex !size-6 !items-center !justify-center !rounded-control !border !border-border !bg-surface-raised !text-foreground-muted !shadow-card",
          actionButton:
            "rounded-control bg-primary px-3 py-2 text-[10px] font-semibold text-white",
          cancelButton:
            "rounded-control border border-border bg-surface-raised px-3 py-2 text-[10px] text-foreground-muted",
        },
      }}
    />
  );
}
