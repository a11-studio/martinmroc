"use client";

import { motion } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-[#799cea] flex flex-col items-center justify-center z-[9999]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      onAnimationComplete={() => {}}
    >
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        {/* Cursor-inspired blinking indicator */}
        <div className="flex items-center gap-[3px]">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-[3px] h-[14px] bg-white rounded-full"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Dismiss trigger — auto-fires after a short delay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </motion.div>
  );
}
