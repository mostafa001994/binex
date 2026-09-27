"use client";

import { useEffect } from "react";

function send(slug: string, event: "view" | "cta_click") {
  const privacyNavigator = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  if (
    privacyNavigator.doNotTrack === "1" ||
    privacyNavigator.globalPrivacyControl === true
  )
    return;
  void fetch("/api/blog/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, event }),
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
}

export function BlogAnalyticsView({ slug }: { slug: string }) {
  useEffect(() => {
    send(slug, "view");
  }, [slug]);
  return null;
}

export function BlogCta({
  slug,
  title,
  description,
  label,
  href,
}: {
  slug: string;
  title: string;
  description?: string | null;
  label: string;
  href: string;
}) {
  return (
    <aside className="rounded-panel border-primary/30 bg-primary/5 mt-10 border p-6 text-center sm:p-8">
      <h2 className="font-display text-2xl font-black">{title}</h2>
      {description ? (
        <p className="text-marketing-text-muted mx-auto mt-3 max-w-2xl leading-8">
          {description}
        </p>
      ) : null}
      <a
        href={href}
        onClick={() => send(slug, "cta_click")}
        className="rounded-control bg-primary hover:bg-primary-hover mt-6 inline-flex h-11 items-center justify-center px-6 text-sm font-bold text-white transition"
      >
        {label}
      </a>
    </aside>
  );
}
