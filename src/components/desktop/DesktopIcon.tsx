"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { useDesktopStore } from "@/store/desktopStore";
import { windowId } from "@/lib/utils";
import type { DesktopIconData } from "@/types";

const SELECTION_TRANSITION = { duration: 0.14, ease: "easeOut" };

interface DesktopIconProps {
  icon: DesktopIconData;
  position: { x: number; y: number };
}

function DesktopIconInner({ icon, position }: DesktopIconProps) {
  const prefersReduced = useReducedMotion();
  const { openWindow } = useWindowStore();
  const { selectIcon, selectedIconId, setIconPosition } = useDesktopStore();
  const isSelected = selectedIconId === icon.id;

  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDrag = useRef(false);

  const handleOpenWindow = useCallback(() => {
    openWindow({
      id: windowId(icon.id),
      type: icon.type,
      title: icon.label,
      props: icon.props,
    });
  }, [icon, openWindow]);

  const handleClick = useCallback(() => {
    if (didDrag.current) return;
    selectIcon(icon.id);

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      handleOpenWindow();
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
    }, 280);
  }, [icon.id, selectIcon, handleOpenWindow]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpenWindow();
      }
    },
    [handleOpenWindow]
  );

  const isFolder = icon.type === "finder";
  const isAbout = icon.type === "about";
  const isPlay = icon.id === "play";

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-[6px] cursor-default desktop-icon"
      style={{ x, y, left: 0, top: 0, width: 88 }}
      data-icon-id={icon.id}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { didDrag.current = true; }}
      onDragEnd={() => {
        setIconPosition(icon.id, { x: x.get(), y: y.get() });
        setTimeout(() => { didDrag.current = false; }, 50);
      }}
      whileTap={prefersReduced ? {} : { scale: 0.98 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${icon.label}`}
      aria-selected={isSelected}
    >
      {/* Thumbnail container — selection highlight wraps this */}
      <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
        <motion.div
          className="absolute inset-0 rounded-[12px] pointer-events-none"
          initial={false}
          animate={{
            background: isSelected ? "rgba(255,255,255,0.08)" : "transparent",
            boxShadow: isSelected
              ? "inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 0 12px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.12)"
              : "none",
          }}
          transition={SELECTION_TRANSITION}
        />

        {isFolder ? (
          <img src={icon.thumbnailSrc} alt={icon.label} className="w-full h-full object-contain pointer-events-none" draggable={false} />
        ) : isAbout ? (
          <img src={icon.thumbnailSrc} alt={icon.label} className="w-[52px] h-[52px] object-contain pointer-events-none" draggable={false} />
        ) : isPlay ? (
          <img src={icon.thumbnailSrc} alt={icon.label} className="w-[72px] h-[72px] object-contain pointer-events-none" draggable={false} />
        ) : (
          <img
            src={icon.thumbnailSrc}
            alt={icon.label}
            className="w-[72px] h-[54px] object-cover rounded-[4px] pointer-events-none"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            draggable={false}
          />
        )}
      </div>

      {/* Label — blue pill when selected, fits content (macOS Finder style) */}
      <motion.span
        className="inline-block text-center pointer-events-none px-[8px] py-[3px] rounded-lg max-w-[88px] truncate"
        style={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.2,
          textShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
        initial={false}
        animate={{
          backgroundColor: isSelected ? "#0A84FF" : "transparent",
          color: "white",
        }}
        transition={SELECTION_TRANSITION}
      >
        {icon.label}
      </motion.span>
    </motion.div>
  );
}

export default memo(DesktopIconInner);
