"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function MouseGlow() {
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);

  const x = useSpring(mouseX, {
    stiffness: 120,
    damping: 30,
  });

  const y = useSpring(mouseY, {
    stiffness: 120,
    damping: 30,
  });

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      mouseX.set(event.clientX - 250);
      mouseY.set(event.clientY - 250);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () =>
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        x,
        y,
      }}
      className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full bg-service-accent/20 blur-[140px]"
    />
  );
}