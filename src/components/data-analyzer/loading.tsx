
"use client";

import { motion } from "framer-motion";
import {
  LoaderCircle,
} from "lucide-react";

type LoadingProps = {
  step: string;
  progress: number;
};

export default function Loading({
  step,
  progress,
}: LoadingProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: .95,
        y: 25,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: .45,
      }}
      className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.05] backdrop-blur-3xl p-12 shadow-[0_25px_80px_rgba(0,0,0,.45)]">
      {/* Background Glow */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [.25, .45, .25],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
          }}
          className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-service-accent/20 blur-[120px]"
        />

      </div>

      {/* Shine */}

      <motion.div
        initial={{
          x: "-150%",
        }}
        animate={{
          x: "250%",
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
        className="absolute top-0 left-0 h-full w-28 rotate-12 bg-white/20 blur-xl"
      />

      {/* Floating Particles */}

      {Array.from({
        length: 14,
      }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-sky-300/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40],
            opacity: [0, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-20 flex flex-col items-center gap-8">

        {/* Loader */}

        <div className="relative flex items-center justify-center">

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
            className="absolute h-28 w-28 rounded-full border border-dashed border-sky-500/30"
          />

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "linear",
            }}
            className="absolute h-20 w-20 rounded-full border border-service-accent-secondary/40"
          />

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
          >
            <LoaderCircle
              size={58}
              className="text-service-accent"
            />
          </motion.div>

        </div>

        {/* Title */}

        <motion.div
          animate={{
            opacity: [.6, 1, .6],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold">
            {step}
          </h2>

          <p className="mt-3 text-zinc-400">
            لطفاً چند لحظه منتظر بمانید...
          </p>
        </motion.div>

        {/* Progress */}

        <div className="w-full">

          <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">

            <span>Processing</span>

            <motion.span
              animate={{
                opacity: [.5, 1, .5],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            >
              <span>{progress}%</span>
            </motion.span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/10">

            <motion.div
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.5,
              }}
              className="h-full rounded-full bg-gradient-to-r from-service-accent via-service-accent-secondary to-primary"
            />

          </div>

        </div>

      </div>

    </motion.div>
  );
}