"use client";

import { motion } from "framer-motion";
import DockItem from "./DockItem";
import { DOCK_ITEMS, DOCK_TRASH } from "@/data/projects";
import { useWindowStore } from "@/store/windowStore";

export default function Dock() {
  const isAnyMaximized = useWindowStore((s) => s.windows.some((w) => w.isMaximized));

  return (
    // Static wrapper keeps centering — motion.div handles y + opacity only
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-end">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={isAnyMaximized ? { y: 100, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 38, mass: 1 }}
        style={{ pointerEvents: isAnyMaximized ? "none" : "auto" }}
        role="toolbar"
        aria-label="Dock"
      >
        <div
          className="glass-dock relative flex items-center justify-center gap-[13.065px] px-[11.613px] py-[14.516px]"
          style={{ borderRadius: "21.8px" }}
        >
          {DOCK_ITEMS.map((item) => (
            <DockItem key={item.id} item={item} />
          ))}

          <div
            className="h-12 w-[1.45px] mx-[5px] self-center shrink-0"
            style={{ background: "rgba(60,60,67,0.29)" }}
            role="separator"
            aria-hidden="true"
          />

          <DockItem item={DOCK_TRASH} />
        </div>
      </motion.div>
    </div>
  );
}
