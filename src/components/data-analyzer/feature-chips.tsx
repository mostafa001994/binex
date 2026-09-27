"use client";

import { motion } from "framer-motion";
import {
  Brain,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    label: "تحلیل سریع",
  },
  {
    icon: ShieldCheck,
    label: "بارگذاری امن",
  },
  {
    icon: Brain,
    label: "هوش مصنوعی",
  },
];

export default function FeatureChips() {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;

        return (
          <motion.div
            key={feature.label}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.15,
            }}
            whileHover={{
              scale: 1.05,
            }}
            className="glass flex items-center gap-2 rounded-full px-5 py-3"
          >
            <Icon
              size={18}
              className="text-service-accent"
            />

            <span className="text-sm">
              {feature.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}