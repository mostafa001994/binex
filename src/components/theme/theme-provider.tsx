"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() { const stored=localStorage.getItem("binix-theme"); const dark=stored?stored==="dark":media.matches; document.documentElement.classList.toggle("dark",dark); }
    apply(); media.addEventListener("change",apply); return()=>media.removeEventListener("change",apply);
  }, []);
  return children;
}
