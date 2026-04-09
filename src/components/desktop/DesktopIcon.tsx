"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { useDesktopStore } from "@/store/desktopStore";
import { windowId } from "@/lib/utils";
import { getCachedImageSize, preloadImageDimensions } from "@/lib/imageDimensions";
import { PROJECT_IMAGES } from "@/data/assets";
import { DEFAULT_WINDOW_SIZES } from "@/data/projects";
import { useLoadingStore } from "@/store/loadingStore";
import { useGlitchStore } from "@/store/glitchStore";
import type { DesktopIconData } from "@/types";

const SELECTION_TRANSITION = { duration: 0.14, ease: "easeOut" };

interface DesktopIconProps {
  icon: DesktopIconData;
  position: { x: number; y: number };
  /** Pod 1200px — menšie thumb + label (zarovnané s ICON_METRICS v Desktop) */
  compact?: boolean;
}

const LAYOUT = {
  normal: {
    outerW: 88,
    thumb: 72,
    projectH: 54,
    about: 52,
    labelPx: 13,
    labelMax: 88,
    gap: 6,
    thumbRound: 12,
    imgRound: 4,
  },
  compact: {
    outerW: 76,
    thumb: 62,
    projectH: 47,
    about: 45,
    labelPx: 12,
    labelMax: 76,
    gap: 5,
    thumbRound: 10,
    imgRound: 3,
  },
} as const;

function DesktopIconInner({ icon, position, compact = false }: DesktopIconProps) {
  const L = compact ? LAYOUT.compact : LAYOUT.normal;
  const prefersReduced = useReducedMotion();
  const { openWindow } = useWindowStore();
  const startGlitch = useGlitchStore((s) => s.start);
  const glitchActive = useGlitchStore((s) => s.active);
  const iconDead = useGlitchStore((s) => !!s.deadIcons[icon.id]);
  const iconCorrupting = useGlitchStore((s) => s.corruptingIconId === icon.id);
  const { selectIcon, selectedIconId, setIconPosition } = useDesktopStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const isSelected = selectedIconId === icon.id;

  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDrag = useRef(false);

  const handleOpenWindow = useCallback(async () => {
    if (icon.id === "clickDmg") {
      startGlitch();
      return;
    }

    // Single Finder window for Projects + Trash — switch view via props
    if (icon.type === "finder") {
      openWindow({
        id: windowId("projects"),
        type: "finder",
        title: "Projects",
        props: {
          finderInitialFolder: icon.props?.finderInitialFolder ?? "all",
        },
        size: DEFAULT_WINDOW_SIZES.finder,
      });
      return;
    }

    const isImage = icon.type === "project" || icon.type === "me";
    let size: { width: number; height: number } | undefined;

    if (isImage && icon.id in PROJECT_IMAGES) {
      const cached = getCachedImageSize(icon.id);
      if (cached) {
        size = cached;
      } else {
        startLoading();
        try {
          size = await preloadImageDimensions(icon.id, PROJECT_IMAGES[icon.id as keyof typeof PROJECT_IMAGES]);
        } finally {
          stopLoading();
        }
      }
    }

    openWindow({
      id: windowId(icon.id),
      type: isImage ? "image" : icon.type,
      title: icon.label,
      props: icon.props ?? { projectId: icon.id },
      size,
    });
  }, [icon, openWindow, startLoading, stopLoading, startGlitch]);

  const handleClick = useCallback(() => {
    if (didDrag.current) return;
    if (glitchActive && icon.id !== "clickDmg") return;
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
  }, [icon.id, selectIcon, handleOpenWindow, glitchActive]);

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
  const isMe = icon.id === "me";
  /** Disk / app-style icons — square thumb, no 4:3 crop */
  const isSquareThumb = icon.id === "play" || icon.id === "clickDmg";

  const dragDisabled = glitchActive || iconDead;

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-default desktop-icon"
      style={{ x, y, left: 0, top: 0, pointerEvents: iconDead ? "none" : undefined }}
      data-icon-id={icon.id}
      drag={!dragDisabled}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { didDrag.current = true; }}
      onDragEnd={() => {
        setIconPosition(icon.id, { x: x.get(), y: y.get() });
        setTimeout(() => { didDrag.current = false; }, 50);
      }}
      whileTap={prefersReduced || dragDisabled ? {} : { scale: 0.98 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={iconDead ? -1 : 0}
      role="button"
      aria-label={`Open ${icon.label}`}
      aria-selected={isSelected}
    >
      <motion.div
        className="flex flex-col items-center"
        style={{ width: L.outerW, gap: L.gap }}
        animate={
          iconDead
            ? {
                opacity: 0,
                y: 52,
                scale: 0.78,
                filter: "blur(8px) saturate(0)",
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              }
            : iconCorrupting
              ? {
                  opacity: [1, 0.82, 0.92, 0.78, 0.88, 1],
                  x: [0, -2, 2, -1.5, 1, 0],
                  rotate: [0, -1.5, 1.5, -1, 0],
                  filter: [
                    "hue-rotate(0deg) contrast(1)",
                    "hue-rotate(40deg) contrast(1.12)",
                    "hue-rotate(-20deg) contrast(1.08)",
                    "hue-rotate(0deg) contrast(1)",
                  ],
                  transition: { duration: 0.85, ease: "easeInOut" },
                }
              : { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0, filter: "none" }
        }
      >
      {/* Thumbnail container — selection highlight wraps this */}
      <div className="relative flex items-center justify-center" style={{ width: L.thumb, height: L.thumb }}>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: L.thumbRound }}
          initial={false}
          animate={{
            background: isSelected
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0)",
            boxShadow: isSelected
              ? "inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 0 12px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.12)"
              : "none",
          }}
          transition={SELECTION_TRANSITION}
        />

        {isFolder ? (
          <Image src={icon.thumbnailSrc} alt={icon.label} width={L.thumb} height={L.thumb} className="object-contain pointer-events-none" draggable={false} />
        ) : isAbout ? (
          <Image src={icon.thumbnailSrc} alt={icon.label} width={L.about} height={L.about} className="object-contain pointer-events-none" draggable={false} />
        ) : isSquareThumb ? (
          <Image src={icon.thumbnailSrc} alt={icon.label} width={L.thumb} height={L.thumb} className="object-contain pointer-events-none" draggable={false} />
        ) : isMe ? (
          <div
            className="relative overflow-hidden pointer-events-none"
            style={{
              width: L.thumb,
              height: L.thumb,
              borderRadius: L.imgRound,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <Image
              src={icon.thumbnailSrc}
              alt={icon.label}
              fill
              sizes={`${L.thumb}px`}
              className="object-cover pointer-events-none"
              draggable={false}
              priority
            />
          </div>
        ) : (
          /* Project thumbnails: fixed 4:3 frame, cover crop — consistent for all .jpg icons */
          <div
            className="relative overflow-hidden pointer-events-none"
            style={{
              width: L.thumb,
              height: L.projectH,
              borderRadius: L.imgRound,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <Image
              src={icon.thumbnailSrc}
              alt={icon.label}
              fill
              sizes={`${L.thumb}px`}
              className="object-cover pointer-events-none"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Label — blue pill when selected, fits content (macOS Finder style) */}
      <motion.span
        className="inline-block text-center pointer-events-none px-[8px] py-[3px] rounded-lg truncate"
        style={{
          maxWidth: L.labelMax,
          fontSize: L.labelPx,
          fontWeight: 500,
          lineHeight: 1.2,
          textShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
        initial={false}
        animate={{
          backgroundColor: isSelected
            ? "rgba(10, 132, 255, 1)"
            : "rgba(10, 132, 255, 0)",
          color: "rgba(255,255,255,1)",
        }}
        transition={SELECTION_TRANSITION}
      >
        {icon.label}
      </motion.span>
      </motion.div>
    </motion.div>
  );
}

export default memo(DesktopIconInner);
