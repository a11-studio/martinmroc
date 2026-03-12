"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DockItemData } from "@/types";

interface DockItemProps {
  item: DockItemData;
}

function DockItemInner({ item }: DockItemProps) {
  const [hovered, setHovered] = useState(false);

  const handleTap = () => {
    if (item.onClick) item.onClick();
  };

  const renderIcon = () => {
    const rounded = "rounded-[12.46px]";
    const imgBase = "absolute inset-0 w-full h-full object-contain object-center pointer-events-none";

    if (item.render === "composite" && item.compositeSrc) {
      return (
        <div className={`relative size-full overflow-hidden ${rounded}`}>
          <img src={item.compositeSrc.bg} alt="" className={imgBase} draggable={false} />
          <img
            src={item.compositeSrc.text}
            alt={item.label}
            className={imgBase}
            style={{ padding: "25.43% 17.33% 28.42% 22.5%" }}
            draggable={false}
          />
        </div>
      );
    }

    if (item.render === "cursor" && item.iconSrc) {
      return (
        <div
          className={`relative size-full ${rounded} overflow-hidden`}
          style={{
            background:
              "linear-gradient(148.81deg, rgb(37,37,37) 26.4%, rgb(22,22,22) 81.1%, rgba(0,0,0,0.54) 92.5%)",
            boxShadow: "0 0.641px 1.282px rgba(0,0,0,0.28)",
            border: "1.223px solid rgba(239,239,239,0.76)",
          }}
        >
          <div className={`absolute inset-[1%] bg-[rgba(217,217,217,0.14)] ${rounded}`} />
          <img
            src={item.iconSrc}
            alt={item.label}
            className="absolute w-[69%] h-[77%] left-[15.6%] top-[14%] object-contain object-center pointer-events-none"
            draggable={false}
          />
        </div>
      );
    }

    // single (Figma, Mail, WhatsApp, Trash)
    if (item.iconSrc) {
      return (
        <div className={`relative size-full overflow-hidden ${rounded}`}>
          <img src={item.iconSrc} alt={item.label} className={imgBase} draggable={false} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute bottom-[calc(100%+10px)] pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div
              className="px-[10px] py-[5px] rounded-[7px] whitespace-nowrap"
              style={{
                background: "rgba(30,30,32,0.82)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              }}
            >
              <span className="text-white text-[12px] font-medium leading-none">
                {item.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon — fixed 48×48, flex-none prevents stretch */}
      <motion.button
        className="relative flex-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-[12.46px] outline-none overflow-hidden"
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onTap={handleTap}
        aria-label={item.label}
      >
        {renderIcon()}
      </motion.button>
    </div>
  );
}

export default memo(DockItemInner);
