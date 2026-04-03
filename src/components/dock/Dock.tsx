"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DockItem from "./DockItem";
import DockMinimizedTile from "./DockMinimizedTile";
import { DOCK_ITEMS, DOCK_TRASH } from "@/data/projects";
import { useWindowStore } from "@/store/windowStore";
import { useGlitchStore, GLITCH_TIMELINE } from "@/store/glitchStore";

export default function Dock() {
  const isAnyMaximized = useWindowStore((s) => s.windows.some((w) => w.isMaximized));
  const windows = useWindowStore((s) => s.windows);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const dockPhase = useGlitchStore((s) => s.dockPhase);
  const prefersReduced = useReducedMotion();

  const minimizedWindows = useMemo(
    () =>
      [...windows]
        .filter((w) => w.isMinimized)
        .sort((a, b) => a.zIndex - b.zIndex),
    [windows]
  );

  const dockGlitch = dockPhase !== "alive";

  const dockAnimate = useMemo(() => {
    if (dockPhase === "failing") {
      return {
        y: 132,
        opacity: 0,
        scale: 0.86,
        filter: "brightness(0.25) blur(2px)",
      };
    }
    if (dockPhase === "dead") {
      return {
        y: 160,
        opacity: 0,
        scale: 0.82,
        filter: "brightness(0)",
      };
    }
    if (isAnyMaximized) return { y: 100, opacity: 0, scale: 1, filter: "none" };
    return { y: 0, opacity: 1, scale: 1, filter: "none" };
  }, [dockPhase, isAnyMaximized]);

  const dockTransition = useMemo(() => {
    if (dockPhase === "failing") {
      return {
        duration: prefersReduced ? 0.46 : GLITCH_TIMELINE.dockDeathMs / 1000,
        ease: [0.22, 0.94, 0.36, 1] as const,
      };
    }
    if (dockPhase === "dead") {
      return { duration: 0.2 };
    }
    return { type: "spring" as const, stiffness: 380, damping: 38, mass: 1 };
  }, [dockPhase, prefersReduced]);

  return (
    // Static wrapper keeps centering — motion.div handles y + opacity only
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-end">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={dockAnimate}
        transition={dockTransition}
        style={{
          pointerEvents:
            isAnyMaximized || dockGlitch ? "none" : "auto",
        }}
        role="toolbar"
        aria-label="Dock"
      >
        <div className="glass-dock relative flex items-center justify-center gap-[13.065px] px-[11.613px] py-[14.516px] rounded-[21.8px] max-[1199px]:gap-[10px] max-[1199px]:px-[9.5px] max-[1199px]:py-[12px] max-[1199px]:rounded-[19px]">
          {DOCK_ITEMS.map((item) => (
            <DockItem key={item.id} item={item} />
          ))}

          <div
            className="h-12 max-[1199px]:h-[42px] w-[1.45px] mx-[5px] max-[1199px]:mx-1 self-center shrink-0"
            style={{ background: "rgba(60,60,67,0.29)" }}
            role="separator"
            aria-hidden="true"
          />

          {/* Minimized windows — priamo vedľa koša (bez ďalšieho oddeľovača) */}
          {minimizedWindows.map((win) => (
            <DockMinimizedTile key={win.id} window={win} onRestore={() => restoreWindow(win.id)} />
          ))}

          <DockItem item={DOCK_TRASH} />
        </div>
      </motion.div>
    </div>
  );
}
