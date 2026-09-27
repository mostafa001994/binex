"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export default function HomeParallaxOrbs() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const yOne = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yTwo = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 18]);

  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      <motion.div
        style={{ y: yOne, rotate }}
        className="absolute right-[8%] top-[26%] size-2 rounded-full bg-accent/50 shadow-[0_0_18px_rgba(0,213,232,.5)]"
      />
      <motion.div
        style={{ y: yTwo }}
        className="absolute left-[12%] top-[62%] size-1.5 rounded-full bg-primary/50 shadow-[0_0_16px_rgba(7,139,255,.45)]"
      />
      <motion.div
        style={{ y: yOne }}
        className="absolute left-[26%] top-[18%] size-1 rounded-full bg-marketing-text/30"
      />
    </div>
  );
}
