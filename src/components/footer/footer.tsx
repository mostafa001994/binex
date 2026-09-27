"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePublicServices } from "@/hooks/use-public-services";

const quickLinks = [
  {
    label: "سرویس‌ها",
    href: "/#products",
  },
  {
    label: "نحوه همکاری",
    href: "/#how-it-works",
  },
  {
    label: "برآورد زمان",
    href: "/#roi",
  },
  {
    label: "ورود به Binix",
    href: "/login",
  },
];

export default function Footer() {
  const { services } =
    usePublicServices();

  return (
    <footer
      dir="rtl"
      className="relative overflow-hidden border-t border-marketing-border bg-marketing-background"
    >
      <div className="pointer-events-none absolute -right-32 top-10 size-[420px] rounded-full bg-primary/10 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-40 left-10 size-[380px] rounded-full bg-accent/[0.06] blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <Image
                src="/img/Binix-Logo.png"
                alt="BINIX"
                width={60}
                height={60}
                className="h-11 w-auto object-contain"
              />
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-marketing-text">
                  BINIX
                </span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
              </div>
            </Link>

            <p className="font-ui mt-5 max-w-[360px] text-sm leading-8 text-marketing-text-muted">
              Binix سرویس‌های هوشمند موردنیاز کسب‌وکار را راه‌اندازی می‌کند و مدیریت آن‌ها را از یک پنل در اختیار شما قرار می‌دهد.
            </p>
          </div>

          <FooterGroup
            title="دسترسی سریع"
            links={quickLinks}
          />

          <FooterGroup
            title="سرویس‌های Binix"
            links={(services || []).map(
              (service) => ({
                label:
                  service.name,
                href:
                  service.marketingHref,
              }),
            )}
          />

          <div>
            <h3 className="font-display text-lg font-bold text-marketing-text">
              از کدام بخش کسب‌وکارت شروع کنیم؟
            </h3>
            <p className="font-ui mt-4 text-[13px] leading-7 text-marketing-text-muted">
              از یک مسئله واقعی شروع کنید تا سرویس مناسب کسب‌وکارتان بررسی شود.
            </p>
            <motion.a
              href="/#consultation"
              whileHover={{ y: -2 }}
              whileTap={{
                scale: 0.98,
              }}
              className="font-ui mt-6 inline-flex items-center rounded-control bg-marketing-text px-5 py-3 text-[13px] font-bold text-marketing-background transition hover:opacity-90"
            >
              درخواست مشاوره رایگان
            </motion.a>
          </div>
        </div>

        <div className="my-10 h-px bg-marketing-border" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-right">
          <p className="font-ui text-xs text-marketing-text-subtle">
            ©{" "}
            {new Date().getFullYear()}{" "}
            BINIX — تمامی حقوق محفوظ است.
          </p>
          <span className="font-ui text-xs text-marketing-text-subtle">
            مدیریت سرویس و پشتیبانی از طریق پنل Binix
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}) {
  return (
    <div>
      <h3 className="font-display text-base font-bold text-marketing-text">
        {title}
      </h3>
      <div className="mt-5 flex flex-col gap-3.5">
        {links.map((item) => (
          <a
            key={`${item.href}-${item.label}`}
            href={item.href}
            className="font-ui w-fit text-[13px] text-marketing-text-muted transition hover:-translate-x-[3px] hover:text-accent"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
