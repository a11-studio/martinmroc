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
  { id: "close", color: "#FF5F57", symbol: "✕" },
  { id: "minimize", color: "#FEBC2E", symbol: "−" },
  { id: "maximize", color: "#28C840", symbol: "+" },
];

export default function Window({ window: win, children }: WindowProps) {
  const prefersReduced = useReducedMotion();
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow } =
    useWindowStore();

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleFocus = useCallback(() => {
    focusWindow(win.id);
  }, [win.id, focusWindow]);

  const springConfig = {
    type: "spring" as const,
    stiffness: 340,
    damping: 32,
    mass: 1,
  };

  const isFinderWindow = win.type === "finder";
  const isFS = win.isMaximized ?? false;

  // Viewport dimensions for the CSS-based fullscreen expand
  const vpW = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 800;

  return (
    <motion.div
      key={win.id}
      // CSS-based fullscreen: always absolute inside the desktop canvas (w-full h-full).
      // When maximized, animate to top:0/left:0/vpW×vpH which fills the viewport.
      // No position:fixed needed — avoids the 1-frame top:28px flash.
      className="absolute overflow-hidden select-none"
      style={{
        zIndex: isFS ? 9000 : win.zIndex,
        pointerEvents: win.isMinimized ? "none" : "auto",
      }}
      initial={
        prefersReduced
          ? { opacity: 0, left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, borderRadius: 26 }
          : { opacity: 0, scale: 0.88, y: 16, left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, borderRadius: 26 }
      }
      animate={
        win.isMinimized
          ? prefersReduced
            ? { opacity: 0, left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, borderRadius: 26 }
            : { opacity: 0, scale: 0.5, y: 60, left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, borderRadius: 26 }
          : isFS
          ? { opacity: 1, scale: 1, y: 0, left: 0, top: 0, width: vpW, height: vpH, borderRadius: 0 }
          : { opacity: 1, scale: 1, y: 0, left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height, borderRadius: 26 }
      }
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 16 }}
      transition={springConfig}
      onPointerDown={(e) => {
        handleFocus();
        if (isFS) return; // no dragging in fullscreen
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("input")) return;
        if (!target.closest(".window-drag-area")) return;

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
      role="dialog"
      aria-label={win.title}
      aria-modal="true"
    >
      {isFinderWindow ? (
        <div className="w-full h-full">{children}</div>
      ) : (
        <div className="w-full h-full flex flex-col bg-white">
          <div
            className="window-drag-area flex items-center gap-2 px-[14px] h-[38px] shrink-0"
            style={{
              cursor: isFS ? "default" : "default",
              background: "rgba(246,246,246,0.95)",
              borderRadius: isFS ? "0" : "26px 26px 0 0",
            }}
          >
            <div className="flex items-center gap-[9px]" role="group" aria-label="Window controls">
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
            <span className="flex-1 text-center text-[13px] font-semibold text-[rgba(0,0,0,0.8)] leading-none truncate pr-[54px]">
              {win.title}
            </span>
          </div>

          <div
            className="flex-1 overflow-auto min-h-0"
            style={{ borderRadius: isFS ? "0" : "0 0 26px 26px" }}
          >
            {children}
          </div>
        </div>
      )}
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
      className="group relative rounded-full transition-opacity focus-visible:ring-2 focus-visible:ring-white outline-none"
      style={{ width: 14, height: 14, background: color, flexShrink: 0 }}
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
