"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

type GlassAuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  secondaryHref?: string;
  secondaryLabel?: string;
  visualTitle: ReactNode;
  visualDescription: string;
  visualIcon?: ReactNode;
};

export function GlassAuthShell({
  eyebrow,
  title,
  description,
  children,
  secondaryHref = "/",
  secondaryLabel = "بازگشت به سایت",
  visualTitle,
  visualDescription,
  visualIcon,
}: GlassAuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#020817] text-white"
    >
      <AuthBackground reduceMotion={Boolean(reduceMotion)} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1240px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="relative flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-[0_0_30px_rgba(7,139,255,.10)]">
              <Sparkles size={17} className="text-primary" />
              <span className="absolute -left-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#020817] bg-emerald-400" />
            </div>

            <div>
              <div className="font-display text-base font-black tracking-wide">
                BINIX
              </div>
              <div className="font-ui text-[8px] text-white/30">
                AI Business Platform
              </div>
            </div>
          </Link>

          <Link
            href={secondaryHref}
            className="font-ui inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[9.5px] text-white/42 backdrop-blur-xl transition hover:border-primary/20 hover:bg-white/[0.045] hover:text-white/75"
          >
            {secondaryLabel}
            <ArrowLeft size={12} />
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[940px]"
          >
            <div className="pointer-events-none absolute -inset-8 rounded-[44px] bg-primary/[0.055] blur-[70px]" />

            <div className="relative grid overflow-hidden rounded-[28px] border border-primary/[0.13] bg-white/[0.035] shadow-[0_30px_90px_rgba(0,0,0,.34)] backdrop-blur-[34px] lg:grid-cols-[.88fr_1.12fr]">
              <aside className="relative hidden min-h-[500px] overflow-hidden border-l border-white/[0.055] bg-gradient-to-b from-primary/[0.045] to-transparent p-9 lg:flex lg:flex-col lg:justify-between">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,213,232,.08),transparent_30%),radial-gradient(circle_at_18%_82%,rgba(7,139,255,.08),transparent_32%)]" />

                <div className="relative">
                  <div className="font-ui text-[9px] font-semibold tracking-[.14em] text-accent">
                    BINIX
                  </div>

                  <h2 className="font-display mt-4 text-[28px] font-black leading-[1.75] text-white">
                    {visualTitle}
                  </h2>

                  <p className="font-ui mt-3 max-w-[340px] text-[10.5px] leading-7 text-white/38">
                    {visualDescription}
                  </p>
                </div>

                <div className="relative my-8 flex flex-1 items-center justify-center">
                  <div className="relative flex size-[210px] items-center justify-center">
                    <motion.div
                      animate={reduceMotion ? undefined : { rotate: [0, 360] }}
                      transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-dashed border-primary/15"
                    />
                    <motion.div
                      animate={reduceMotion ? undefined : { rotate: [360, 0] }}
                      transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[35px] rounded-full border border-accent/12"
                    />
                    <motion.div
                      animate={
                        reduceMotion
                          ? undefined
                          : { scale: [1, 1.035, 1], opacity: [0.82, 1, 0.82] }
                      }
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative flex size-[74px] items-center justify-center rounded-[22px] border border-primary/20 bg-primary/[0.10] text-accent shadow-[0_0_38px_rgba(7,139,255,.14)] backdrop-blur-xl"
                    >
                      {visualIcon ?? <Sparkles size={26} />}
                    </motion.div>
                  </div>
                </div>

                <div className="relative flex items-center gap-2 font-ui text-[9px] text-white/28">
                  <ShieldCheck size={12} className="text-primary" />
                  ورود امن، ساده و بدون رمز ثابت
                </div>
              </aside>

              <section className="relative flex items-center p-6 sm:p-8 lg:p-10">
                <div className="w-full">
                  <div className="mb-7">
                    <div className="font-ui inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-[9.5px] font-semibold text-primary">
                      <ShieldCheck size={12} />
                      {eyebrow}
                    </div>
                    <h1 className="font-display mt-4 text-[28px] font-black leading-[1.55] text-white sm:text-[32px]">
                      {title}
                    </h1>
                    <div className="font-ui mt-2 max-w-[430px] text-[11px] leading-6 text-white/40">
                      {description}
                    </div>
                  </div>
                  {children}
                </div>
              </section>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function AuthBackground({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(7,139,255,.14),transparent_34%),linear-gradient(180deg,#03101F_0%,#020817_52%,#020817_100%)]" />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { backgroundPosition: ["0px 0px", "24px 18px", "0px 0px"] }
        }
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[.11] [background-image:radial-gradient(circle,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:20px_20px]"
      />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-4%", "5%", "-4%"],
                y: ["0%", "2%", "0%"],
                opacity: [0.08, 0.14, 0.08],
              }
        }
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[10%] top-[18%] size-[300px] rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["4%", "-5%", "4%"],
                y: ["0%", "-3%", "0%"],
                opacity: [0.05, 0.11, 0.05],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[12%] size-[260px] rounded-full bg-accent/[0.08] blur-[110px]"
      />
    </div>
  );
}
