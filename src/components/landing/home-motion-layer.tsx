"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function HomeMotionLayer() {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);

  const smoothX = useSpring(mouseX, { stiffness: 90, damping: 24, mass: 0.45 });
  const smoothY = useSpring(mouseY, { stiffness: 90, damping: 24, mass: 0.45 });

  useEffect(() => {
    if (reduceMotion) return;

    const handleMove = (event: PointerEvent) => {
      mouseX.set(event.clientX - 180);
      mouseY.set(event.clientY - 180);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [mouseX, mouseY, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2] hidden overflow-hidden lg:block"
    >
      <motion.div
        style={{ x: smoothX, y: smoothY }}
        className="absolute size-[360px] rounded-full bg-accent/[0.035] blur-[95px]"
      />
    </div>
  );
}
