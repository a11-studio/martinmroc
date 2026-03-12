"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { useDesktopStore } from "@/store/desktopStore";
import { windowId } from "@/lib/utils";
import type { DesktopIconData } from "@/types";

interface DesktopIconProps {
  icon: DesktopIconData;
  position: { x: number; y: number };
}

function DesktopIconInner({ icon, position }: DesktopIconProps) {
  const prefersReduced = useReducedMotion();
  const { openWindow } = useWindowStore();
  const { selectIcon, selectedIconId, setIconPosition } = useDesktopStore();
  const isSelected = selectedIconId === icon.id;

  // Framer motion values own the position — avoids transform doubling on drag end
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // Sync if store position changes externally (cleanup, reset)
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
      className="absolute flex flex-col items-center gap-[6px] cursor-default"
      style={{ x, y, left: 0, top: 0, width: 88 }}
      data-icon-id={icon.id}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        didDrag.current = true;
      }}
      onDragEnd={() => {
        // Persist final position from motion values to store
        setIconPosition(icon.id, { x: x.get(), y: y.get() });
        setTimeout(() => {
          didDrag.current = false;
        }, 50);
      }}
      whileTap={prefersReduced ? {} : { scale: 0.98 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${icon.label}`}
    >
      {/* Thumbnail */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 72, height: 72 }}
      >
        {/* Selection ring */}
        {isSelected && (
          <div
            className="absolute inset-[-4px] rounded-xl"
            style={{
              background: "rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1.5px rgba(255,255,255,0.28)",
            }}
          />
        )}

        {isFolder ? (
          <img
            src={icon.thumbnailSrc}
            alt={icon.label}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : isAbout ? (
          <img
            src={icon.thumbnailSrc}
            alt={icon.label}
            className="w-[52px] h-[52px] object-contain pointer-events-none"
            draggable={false}
          />
        ) : isPlay ? (
          <img
            src={icon.thumbnailSrc}
            alt={icon.label}
            className="w-[72px] h-[72px] object-contain pointer-events-none"
            draggable={false}
          />
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

      {/* Label */}
      <span className="icon-label w-full leading-tight text-center px-1 pointer-events-none">
        {icon.label}
      </span>
    </motion.div>
  );
}

export default memo(DesktopIconInner);
