"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface SelectOption { label: string; value: string; }
interface SelectProps { id?: string; value?: string; onValueChange?: (value: string) => void; options: SelectOption[]; placeholder?: string; disabled?: boolean; className?: string; "aria-describedby"?: string; }

export function Select({ id, value, onValueChange, options, placeholder = "انتخاب کنید", disabled, className, "aria-describedby": describedBy }: SelectProps) {
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listId = `${buttonId}-listbox`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((item) => item.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((item) => item.value === value);

  useEffect(() => {
    function close(event: MouseEvent) { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);

  function choose(index: number) { const option = options[index]; if (!option) return; onValueChange?.(option.value); setOpen(false); setActiveIndex(index); }
  function keyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); setOpen(true); }
    if (event.key === "ArrowDown") setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    if (event.key === "ArrowUp") setActiveIndex((i) => Math.max(0, i - 1));
    if (event.key === "Home") setActiveIndex(0);
    if (event.key === "End") setActiveIndex(options.length - 1);
    if ((event.key === "Enter" || event.key === " ") && open) { event.preventDefault(); choose(activeIndex); }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button id={buttonId} type="button" role="combobox" aria-controls={listId} aria-haspopup="listbox" aria-expanded={open} aria-activedescendant={open ? `${buttonId}-option-${activeIndex}` : undefined} aria-describedby={describedBy} disabled={disabled} onClick={() => setOpen((v) => !v)} onKeyDown={keyDown} className={cn("font-ui flex h-11 w-full items-center justify-between rounded-control border border-border bg-surface px-3.5 text-sm transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20", disabled && "cursor-not-allowed opacity-50")}>
        <span className={selected ? "text-foreground" : "text-foreground-subtle"}>{selected?.label ?? placeholder}</span><ChevronDown size={17} className={cn("transition", open && "rotate-180")} />
      </button>
      {open && !disabled && <div id={listId} role="listbox" aria-labelledby={buttonId} className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-card border border-border bg-surface p-1.5 shadow-binix-md">{options.map((option, index) => <button id={`${buttonId}-option-${index}`} key={option.value} role="option" aria-selected={option.value === value} type="button" onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(index)} className={cn("font-ui flex w-full rounded-control px-3 py-2.5 text-right text-sm transition", index === activeIndex && "bg-surface-hover", option.value === value ? "text-primary" : "text-foreground")}>{option.label}</button>)}</div>}
    </div>
  );
}
