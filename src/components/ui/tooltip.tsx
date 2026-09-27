"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className="font-ui pointer-events-none absolute bottom-[calc(100%+8px)] right-1/2 z-50 translate-x-1/2 whitespace-nowrap rounded-[8px] border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-foreground shadow-binix-md"
        >
          {content}
        </span>
      )}
    </span>
  );
}
