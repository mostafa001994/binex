import type { ReactNode } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const benefits = [
  "ورود یکپارچه برای همه سرویس‌های Binix",
  "رابط فارسی و RTL از ابتدا",
  "فعال‌سازی مستقل هر سرویس",
];

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_72%)] opacity-70" />

      <div className="absolute left-4 top-4 z-10"><ThemeToggle /></div>
      <Link href="/" className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-control px-2 py-1.5 transition hover:bg-surface-hover sm:right-6">
        <Image src="/img/Binix-Logo.png" alt="Binix" width={36} height={36} className="size-8 object-contain" />
        <span data-display-title="true" className="text-sm font-bold">Binix</span>
      </Link>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:py-12">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 flex size-12 items-center justify-center rounded-control bg-primary text-white shadow-glow-sm"><Sparkles size={22} /></div>
            <h1 data-display-title="true" className="text-5xl font-bold leading-tight">Binix<span className="mt-2 block text-primary">مرکز هوشمند کسب‌وکار</span></h1>
            <p className="mt-5 font-ui text-lg leading-9 text-foreground-muted">فروش، رزرو، تحلیل داده و سرویس‌های هوشمند کسب‌وکار از یک حساب واحد مدیریت می‌شوند.</p>
            <div className="mt-7 space-y-3">{benefits.map((item) => <div key={item} className="font-ui flex items-center gap-2 text-sm text-foreground-muted"><CheckCircle2 size={17} className="text-success" />{item}</div>)}</div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-binix-lg sm:p-7 md:p-8">
            <div className="mb-6 lg:hidden"><div data-display-title="true" className="text-2xl font-bold">Binix</div><p className="mt-1 font-ui text-xs text-foreground-subtle">حساب واحد برای سرویس‌های هوشمند شما</p></div>
            <h2 data-display-title="true" className="text-2xl font-bold text-foreground">{title}</h2>
            {description && <p className="mt-2 font-ui text-sm leading-7 text-foreground-muted">{description}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
