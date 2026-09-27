"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function ServiceCTA({
  badge = "شروع با Binix",
  title,
  description,
  buttonText,
  href,
}: {
  badge?: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}) {
  return (
    <section id="service-contact" className="px-4 pb-24 pt-4 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-panel border border-service-accent/20 bg-marketing-surface px-5 py-12 text-center shadow-binix-lg sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[420px] rounded-full bg-service-accent/10 blur-[90px]" />
        <div className="relative z-10">
          <span className="font-ui text-xs font-semibold text-service-accent">{badge}</span>
          <h2 className="font-display mx-auto mt-3 max-w-[700px] text-2xl font-bold leading-[1.7] text-marketing-text sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          <p className="font-ui mx-auto mt-4 max-w-[620px] text-[13px] leading-7 text-marketing-text-muted sm:text-sm">
            {description}
          </p>
          <motion.a
            href={href}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="font-ui mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-service-accent px-6 text-[13px] font-bold text-white shadow-[var(--service-accent-glow)]"
          >
            <MessageCircle size={16} />
            {buttonText}
            <ArrowLeft size={15} />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
