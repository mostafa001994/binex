"use client";

import { AnimatePresence, motion } from "framer-motion";

import UploadEmpty from "./upload-empty";
import UploadPreview from "./upload-preview";

type UploadCardProps = {
  file: File | null;
  onSelectFile: (file: File) => void;
  onAnalyze: () => void;
  onRemove: () => void;
};

export default function UploadCard({
  file,
  onSelectFile,
  onAnalyze,
  onRemove,
}: UploadCardProps) {
  return (
    <div className="relative isolate w-full">
      {/* Glow */}
      <motion.div
        animate={{
          opacity: [0.06, 0.1, 0.06],
          scale: [1, 1.03, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className="pointer-events-none  absolute  bottom-[-10px]  left-1/2  -z-10  h-10  w-[45%]  -translate-x-1/2  rounded-full  bg-service-accent-secondary/10  blur-[35px]" />

      <AnimatePresence mode="wait" initial={false}>
        {!file ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            <UploadEmpty onUpload={onSelectFile} />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            <UploadPreview
              file={file}
              onAnalyze={onAnalyze}
              onRemove={onRemove}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}