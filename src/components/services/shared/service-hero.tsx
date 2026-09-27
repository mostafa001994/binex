"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type ServiceHeroStat = {
  value: string;
  label: string;
};

export function ServiceHero({
  badge,
  badgeIcon,
  title,
  highlight,
  description,
  bullets = [],
  stats = [],
  visual,
  className,
}: {
  badge: string;
  badgeIcon?: ReactNode;
  title: string;
  highlight?: string;
  description: string;
  bullets?: string[];
  stats?: ServiceHeroStat[];
  visual?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8 lg:pb-28 lg:pt-40",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 opacity-40 [background-image:linear-gradient(rgb(var(--service-accent-rgb)/.04)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--service-accent-rgb)/.04)_1px,transparent_1px)] [background-size:52px_52px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 -z-10 size-[600px] rounded-full bg-service-accent/10 blur-[100px]"
      />

      <div className="mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[1fr_.92fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center lg:text-right"
        >
          <div className="font-ui mb-5 inline-flex items-center gap-2 rounded-full border border-service-accent/25 bg-service-accent/10 px-3.5 py-1.5 text-xs font-semibold text-service-accent">
            {badgeIcon}
            {badge}
          </div>

          <h1 className="font-display text-[clamp(2.5rem,9vw,3.8rem)] font-black leading-[1.35] text-marketing-text sm:text-[clamp(3rem,7vw,4.6rem)]">
            {title}
            {highlight && (
              <>
                <br />
                <span className="bg-gradient-to-l from-service-accent-secondary to-service-accent bg-clip-text text-transparent">
                  {highlight}
                </span>
              </>
            )}
          </h1>

          <p className="font-ui mx-auto mt-6 max-w-[660px] text-sm leading-[2.1] text-marketing-text-muted sm:text-[15px] lg:mx-0 lg:text-base">
            {description}
          </p>

          {bullets.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-[620px] flex-wrap justify-center gap-2 lg:mx-0 lg:justify-start">
              {bullets.map((item) => (
                <span
                  key={item}
                  className="font-ui inline-flex items-center gap-1.5 rounded-full border border-marketing-border bg-white/[0.035] px-3 py-1.5 text-[11px] text-marketing-text"
                >
                  <Check size={12} className="text-service-accent" />
                  {item}
                </span>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="mx-auto mt-10 flex flex-wrap justify-center gap-6 lg:mx-0 lg:justify-start">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-max px-2 text-center">
                  <div className="font-display text-lg font-bold text-marketing-text sm:text-xl">
                    {stat.value}
                  </div>
                  <div className="font-ui mt-1 text-[10px] text-marketing-text-subtle sm:text-[11px]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {visual && <div className="min-w-0">{visual}</div>}
      </div>
    </section>
  );
}
