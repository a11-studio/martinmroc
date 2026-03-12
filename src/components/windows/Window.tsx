"use client";

import { useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import type { WindowInstance } from "@/types";

interface WindowProps {
  window: WindowInstance;
  children: React.ReactNode;
}

const TRAFFIC_LIGHTS = [
  { id: "close", color: "#FF5F57", hoverColor: "#FF5F57", symbol: "✕" },
  { id: "minimize", color: "#FEBC2E", hoverColor: "#FEBC2E", symbol: "−" },
  { id: "maximize", color: "#28C840", hoverColor: "#28C840", symbol: "+" },
];

export default function Window({ window: win, children }: WindowProps) {
  const prefersReduced = useReducedMotion();
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow } =
    useWindowStore();

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const isActive = useRef(true); // managed via z-index comparison externally

  const handleFocus = useCallback(() => {
    focusWindow(win.id);
  }, [win.id, focusWindow]);

  const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  };

  return (
    <motion.div
      key={win.id}
      className="absolute rounded-[12px] overflow-hidden window-shadow select-none"
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      }}
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 16 }}
      animate={
        win.isMinimized
          ? prefersReduced
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.5, y: 60 }
          : { opacity: 1, scale: 1, y: 0 }
      }
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 16 }}
      transition={springConfig}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragListener={false}
      onPointerDown={handleFocus}
      role="dialog"
      aria-label={win.title}
      aria-modal="true"
    >
      {/* Window glass body */}
      <div className="glass-window w-full h-full flex flex-col rounded-[12px]">
        {/* Title bar — drag handle */}
        <motion.div
          className="glass-window-header flex items-center gap-2 px-[14px] h-[38px] shrink-0 rounded-t-[12px] border-b border-black/[0.06]"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            isDragging.current = true;
            dragStart.current = {
              x: e.clientX - win.position.x,
              y: e.clientY - win.position.y,
            };
            const handleMove = (mv: PointerEvent) => {
              if (!isDragging.current) return;
              moveWindow(win.id, {
                x: mv.clientX - dragStart.current.x,
                y: mv.clientY - dragStart.current.y,
              });
            };
            const handleUp = () => {
              isDragging.current = false;
              window.removeEventListener("pointermove", handleMove);
              window.removeEventListener("pointerup", handleUp);
            };
            window.addEventListener("pointermove", handleMove);
            window.addEventListener("pointerup", handleUp);
          }}
          style={{ cursor: "default" }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-[6px]" role="group" aria-label="Window controls">
            {TRAFFIC_LIGHTS.map((light) => (
              <TrafficLight
                key={light.id}
                color={light.color}
                symbol={light.symbol}
                aria-label={light.id}
                onClick={() => {
                  if (light.id === "close") closeWindow(win.id);
                  else if (light.id === "minimize") minimizeWindow(win.id);
                  else if (light.id === "maximize") toggleMaximize(win.id);
                }}
              />
            ))}
          </div>

          {/* Title */}
          <span className="flex-1 text-center text-[13px] font-medium text-[#1c1c1e]/80 leading-none truncate pr-[54px]">
            {win.title}
          </span>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0 rounded-b-[12px]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Traffic light button
// ─────────────────────────────────────────────────────────────────

interface TrafficLightProps {
  color: string;
  symbol: string;
  onClick: () => void;
  "aria-label": string;
}

function TrafficLight({ color, symbol, onClick, "aria-label": label }: TrafficLightProps) {
  return (
    <button
      className="group relative w-3 h-3 rounded-full transition-opacity focus-visible:ring-2 focus-visible:ring-white outline-none"
      style={{ background: color }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
    >
      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-black/60 font-bold leading-none">
        {symbol}
      </span>
    </button>
  );
}
