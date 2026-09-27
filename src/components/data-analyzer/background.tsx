"use client";

import { motion } from "framer-motion";

const particles = [
  { size: 4, left: "8%", top: "18%", duration: 5, delay: 0 },
  { size: 3, left: "18%", top: "72%", duration: 6, delay: 1 },
  { size: 6, left: "29%", top: "34%", duration: 7, delay: 0.5 },
  { size: 3, left: "38%", top: "82%", duration: 5.5, delay: 1.5 },
  { size: 5, left: "47%", top: "22%", duration: 6.5, delay: 0.8 },
  { size: 3, left: "56%", top: "64%", duration: 5, delay: 2 },
  { size: 6, left: "65%", top: "30%", duration: 7, delay: 0.3 },
  { size: 4, left: "74%", top: "78%", duration: 6, delay: 1.2 },
  { size: 3, left: "83%", top: "18%", duration: 5.5, delay: 0.7 },
  { size: 5, left: "91%", top: "55%", duration: 7, delay: 1.8 },
];

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-marketing-background" />
      <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-[20%] size-[420px] -translate-x-1/2 rounded-full bg-service-accent/10 blur-[120px]" />
      <motion.div animate={{ x: [-20, 20, -20], y: [10, -15, 10], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[10%] top-[35%] size-[300px] rounded-full bg-service-accent-secondary/10 blur-[100px]" />
      {particles.map((particle, index) => <motion.span key={index} className="absolute rounded-full bg-service-accent-secondary/30" style={{ width: particle.size, height: particle.size, left: particle.left, top: particle.top }} animate={{ y: [0, -18, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.25, 1] }} transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }} />)}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
