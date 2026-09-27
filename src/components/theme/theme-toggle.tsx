"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains("dark");
    setIsDark(current);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("binix-theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="تغییر پوسته" className="opacity-0" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "فعال کردن حالت روشن" : "فعال کردن حالت تیره"}
      title={isDark ? "حالت روشن" : "حالت تیره"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
