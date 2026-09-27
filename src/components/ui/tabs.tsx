"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

interface TabItem { id: string; label: string; content: ReactNode; }
interface TabsProps { items: TabItem[]; value: string; onValueChange: (value: string) => void; }

export function Tabs({ items, value, onValueChange }: TabsProps) {
  const active = items.find((item) => item.id === value) ?? items[0];
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  function keyDown(index: number, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowLeft") next = Math.min(items.length - 1, index + 1);
    if (event.key === "ArrowRight") next = Math.max(0, index - 1);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    onValueChange(items[next].id); refs.current[next]?.focus();
  }
  return <div><div role="tablist" aria-label="زبانه‌ها" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-control border border-border bg-surface-muted p-1">{items.map((item,index)=><button key={item.id} ref={(node)=>{refs.current[index]=node}} id={`tab-${item.id}`} type="button" role="tab" aria-selected={item.id===value} aria-controls={`panel-${item.id}`} tabIndex={item.id===value?0:-1} onClick={()=>onValueChange(item.id)} onKeyDown={(e)=>keyDown(index,e)} className={cn("font-ui shrink-0 rounded-[8px] px-3.5 py-2 text-sm transition",item.id===value?"bg-surface text-foreground shadow-binix-sm":"text-foreground-muted hover:text-foreground")}>{item.label}</button>)}</div>{active&&<div id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}`} tabIndex={0} className="mt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">{active.content}</div>}</div>;
}
