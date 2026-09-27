"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function HomeScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.35,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: "100% 50%" }}
      className="fixed left-0 right-0 top-0 z-[90] h-[2px] bg-gradient-to-l from-primary via-accent to-primary"
    />
  );
}
