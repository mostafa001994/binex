"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Badge() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-service-accent/20 bg-service-accent/10 px-5 py-2 backdrop-blur-xl"
    >
      <Sparkles
        size={16}
        className="text-service-accent"
      />

      <span
        className="bg-gradient-to-r from-service-accent to-service-accent-secondary bg-clip-text text-sm font-semibold text-transparent"
      >
        تحلیل هوشمند فایل‌های اکسل با هوش مصنوعی
      </span>
    </motion.div>
  );
}