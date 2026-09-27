"use client";

import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  consequences = [],
  confirmLabel = "تأیید عملیات",
  cancelLabel = "انصراف",
  loading = false,
  tone = "danger",
  children,
  confirmDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  consequences?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: "danger" | "warning";
  children?: ReactNode;
  confirmDisabled?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant={tone === "danger" ? "danger" : "primary"} loading={loading} disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="secondary" disabled={loading} onClick={onClose}>{cancelLabel}</Button>
        </>
      }
    >
      {children}
      <div className={`rounded-control border p-4 font-ui text-sm ${tone === "danger" ? "border-error/25 bg-error/[0.05] text-error" : "border-warning/25 bg-warning/[0.05] text-warning"}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <div className="font-semibold">پیش از ادامه، اثر این عملیات را بررسی کنید.</div>
            {consequences.length ? <ul className="mt-2 list-disc space-y-1 pr-4 text-xs leading-6">{consequences.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}
