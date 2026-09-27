"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "sm:max-w-[520px]",
  md: "sm:max-w-[700px]",
  lg: "sm:max-w-[900px]",
  xl: "sm:max-w-[1120px]",
};

export function Modal({ open, onClose, title, description, children, footer, size = "lg" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: ModalSize; }) {
  const titleId = useId(); const descriptionId = useId(); const dialogRef = useRef<HTMLDivElement>(null); const previousFocus = useRef<HTMLElement | null>(null); const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(()=>{
    if(!open) return;
    previousFocus.current=document.activeElement as HTMLElement;
    const previousOverflow=document.body.style.overflow; document.body.style.overflow="hidden";
    const dialog=dialogRef.current; const focusables=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')??[]).filter((el)=>!el.hasAttribute('disabled'));
    window.setTimeout(()=>focusables()[0]?.focus(),0);
    function onKey(event:KeyboardEvent){ if(event.key==='Escape'){onCloseRef.current();return;} if(event.key!=='Tab')return; const items=focusables(); if(!items.length)return; const first=items[0], last=items[items.length-1]; if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();} else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();} }
    document.addEventListener('keydown',onKey);
    return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;previousFocus.current?.focus();};
  },[open]);
  if(!open)return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"><button type="button" aria-label="بستن پنجره" onClick={onClose} className="absolute inset-0 bg-[rgba(1,7,17,.72)] backdrop-blur-[5px]"/><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description?descriptionId:undefined} className={`relative z-10 flex max-h-[min(94dvh,860px)] w-full flex-col rounded-t-panel border border-border bg-surface shadow-binix-lg sm:rounded-panel ${sizeClasses[size]}`}><div className="shrink-0 border-b border-border-subtle bg-surface px-4 py-4 sm:px-6"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 id={titleId} data-display-title="true" className="text-xl font-bold text-foreground">{title}</h2>{description&&<p id={descriptionId} className="mt-1.5 font-ui text-sm leading-6 text-foreground-muted">{description}</p>}</div><button type="button" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-control text-foreground-muted transition hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" aria-label="بستن"><X size={18}/></button></div></div><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">{children}</div>{footer&&<div className="sticky bottom-0 shrink-0 border-t border-border-subtle bg-surface/95 px-4 py-3 backdrop-blur-xl sm:px-6"><div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">{footer}</div></div>}</div></div>;
}

export function ModalSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-card border border-border-subtle bg-surface-raised/40 p-4 sm:p-5"><div className="mb-4"><h3 className="font-ui text-sm font-bold text-foreground">{title}</h3>{description ? <p className="mt-1 font-ui text-xs leading-6 text-foreground-muted">{description}</p> : null}</div>{children}</section>;
}
