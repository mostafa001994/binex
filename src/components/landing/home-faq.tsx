"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { FaqContentItem } from "@/lib/managed-faq-pages";

export default function HomeFaq({ items }: { items: FaqContentItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section dir="rtl" className="bg-marketing-background px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[900px]">
        <SectionHeading badge="پرسش‌های متداول" title="قبل از شروع چه چیزهایی را باید بدانید؟" className="mb-10" />
        <div className="space-y-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="overflow-hidden rounded-card border border-marketing-border bg-marketing-surface/55">
                <button type="button" onClick={() => setOpenIndex(open ? null : index)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right">
                  <span className="font-display text-sm font-bold text-marketing-text">{item.question}</span>
                  <ChevronDown size={17} className={`shrink-0 text-accent transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? <p className="font-ui border-t border-marketing-border px-5 py-4 text-[12px] leading-7 text-marketing-text-muted">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
