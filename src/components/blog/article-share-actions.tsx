"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ArticleShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="border-marketing-border hover:border-primary rounded-control inline-flex h-10 items-center gap-2 border px-3 text-xs font-semibold transition"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? "کپی شد" : "اشتراک‌گذاری"}
    </button>
  );
}
