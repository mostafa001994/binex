"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpLeft, Sparkles } from "lucide-react";

export default function HomeFinalCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-marketing-background px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          className="relative overflow-hidden rounded-panel border border-accent/20 bg-[linear-gradient(135deg,rgba(0,213,232,.09),rgba(7,139,255,.045)_45%,rgba(6,17,31,.85))] px-6 py-12 sm:px-10 sm:py-14 lg:px-14"
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.25, 0.5, 0.25], scale: [1, 1.06, 1] }
            }
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-24 -top-24 size-[340px] rounded-full bg-accent/[0.1] blur-[90px]"
          />
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.18, 0.35, 0.18], x: [0, 16, 0] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-28 left-10 size-[300px] rounded-full bg-primary/[0.09] blur-[90px]"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-ui inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-3 py-1.5 text-[11px] font-semibold text-accent"
              >
                <Sparkles size={13} />
                شروع از یک مسئله واقعی
              </motion.div>

              <h2 className="font-display mt-4 max-w-[720px] text-2xl font-bold leading-relaxed text-marketing-text sm:text-3xl">
                لازم نیست همه‌چیز را یک‌جا هوشمند کنید؛ از همان بخشی شروع کنید که بیشترین وقت را می‌گیرد.
              </h2>

              <p className="font-ui mt-3 max-w-[700px] text-[12.5px] leading-7 text-marketing-text-muted">
                مهم‌ترین نیازتان را ثبت کنید تا نقطه مناسب برای شروع و سرویس متناسب با آن بررسی شود.
              </p>
            </div>

            <motion.a
              href="#consultation"
              whileHover={{ y: -2, x: -2 }}
              whileTap={{ scale: 0.98 }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 rgba(255,255,255,0)",
                        "0 0 20px rgba(255,255,255,.08)",
                        "0 0 0 rgba(255,255,255,0)",
                      ],
                    }
              }
              transition={{ duration: 3.2, repeat: Infinity }}
              className="font-ui inline-flex h-12 items-center justify-center gap-2 rounded-control bg-marketing-text px-6 text-xs font-bold text-marketing-background"
            >
              درخواست مشاوره رایگان
              <ArrowUpLeft size={15} />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
