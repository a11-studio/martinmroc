"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import { DESKTOP_ICONS } from "@/data/projects";
import { PROJECT_IMAGES } from "@/data/assets";
import { findNextSpatialId } from "@/lib/spatialNavigation";
import { preloadImageDimensions } from "@/lib/imageDimensions";
import { useWindowStore } from "@/store/windowStore";
import { COMPACT_DESKTOP_MAX_WIDTH_PX, useIsCompactDesktop } from "@/hooks/useIsCompactDesktop";
import Wallpaper from "./Wallpaper";
import DesktopIcon from "./DesktopIcon";
import Dock from "@/components/dock/Dock";
import ContextMenu from "@/components/context-menu/ContextMenu";
import WindowManager from "@/components/windows/WindowManager";

/** Zarovnané s vizuálnou výškou bloku ikony (thumbnail + medzera + label) — šípky / spatial nav */
const ICON_METRICS = {
  normal: { ICON_W: 88, ICON_H: 96 },
  compact: { ICON_W: 76, ICON_H: 84 },
} as const;

type IconMetrics = (typeof ICON_METRICS)[keyof typeof ICON_METRICS];

/** Fallback position when store is empty (bfcache restore, tab return) */
function getDefaultPosition(icon: (typeof DESKTOP_ICONS)[0]) {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: (icon.defaultPosition.x / 100) * window.innerWidth,
    y: (icon.defaultPosition.y / 100) * window.innerHeight,
  };
}

type DesktopProps = {
  /** When false, dock / icons stay visually hidden (boot splash covers). When true, play entrance motion. */
  entranceGateOpen?: boolean;
};

export default function Desktop({ entranceGateOpen = true }: DesktopProps) {
  const desktopRef = useRef<HTMLDivElement>(null);
  const isCompactDesktop = useIsCompactDesktop();
  const iconMetricsRef = useRef<IconMetrics>(ICON_METRICS.normal);

  useEffect(() => {
    const update = () => {
      iconMetricsRef.current =
        window.innerWidth <= COMPACT_DESKTOP_MAX_WIDTH_PX ? ICON_METRICS.compact : ICON_METRICS.normal;
    };
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia(`(max-width: ${COMPACT_DESKTOP_MAX_WIDTH_PX}px)`);
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  const {
    iconPositions,
    selectedIconId,
    resetIconPositions,
    selectIcon,
    openContextMenu,
    closeContextMenu,
  } = useDesktopStore();

  // Arrow key navigation between desktop icons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key as "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

      const target = e.target as HTMLElement;
      if (target.closest('[role="menu"]') || target.closest("input, textarea, [contenteditable]")) return;

      // Finder window handles its own arrows; leave keys to it when open
      const top = [...useWindowStore.getState().windows]
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      if (top?.type === "finder" || top?.type === "spotify") return;

      // Don't steal keys when inside another dialog
      if (target.closest('[role="dialog"]')) return;

      // Only handle when focus is on desktop (not inside a window)
      if (!desktopRef.current?.contains(target) || target.closest('[role="dialog"]')) return;

      e.preventDefault();

      const positions = { ...useDesktopStore.getState().iconPositions };
      DESKTOP_ICONS.forEach((icon) => {
        if (!positions[icon.id]) {
          positions[icon.id] = getDefaultPosition(icon);
        }
      });

      const { ICON_W, ICON_H } = iconMetricsRef.current;
      const icons = DESKTOP_ICONS.map((icon) => ({
        id: icon.id,
        cx: (positions[icon.id]?.x ?? 0) + ICON_W / 2,
        cy: (positions[icon.id]?.y ?? 0) + ICON_H / 2,
      }));

      const nextId = findNextSpatialId(key, icons, selectedIconId, 120);
      if (nextId) {
        selectIcon(nextId);
        const el = document.querySelector(`[data-icon-id="${nextId}"]`) as HTMLElement | null;
        el?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedIconId, selectIcon]);

  // Preload image dimensions in background (no loader — user doesn't wait for this)
  useEffect(() => {
    (Object.keys(PROJECT_IMAGES) as (keyof typeof PROJECT_IMAGES)[]).forEach((id) => {
      preloadImageDimensions(id, PROJECT_IMAGES[id]);
    });
  }, []);

  // Initialise icon positions on mount + when page becomes visible again (bfcache/tab return)
  useEffect(() => {
    const initIfNeeded = () => {
      const state = useDesktopStore.getState();
      if (Object.keys(state.iconPositions).length === 0) {
        resetIconPositions();
      }
    };
    initIfNeeded();

    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) initIfNeeded(); // restored from bfcache
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") initIfNeeded();
    };

    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [resetIconPositions]);

  const handleDesktopClick = useCallback(
    (e: React.MouseEvent) => {
      // Only clear selection / close menu if clicking the bare desktop
      if ((e.target as HTMLElement).closest("[data-icon-id]")) return;
      selectIcon(null);
      closeContextMenu();
    },
    [selectIcon, closeContextMenu]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // Only show context menu on bare desktop
      if ((e.target as HTMLElement).closest("[data-icon-id]")) return;
      e.preventDefault();
      openContextMenu({ x: e.clientX, y: e.clientY });
    },
    [openContextMenu]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      handleDesktopClick(e);
      if (!(e.target as HTMLElement).closest("[data-icon-id]")) {
        (e.currentTarget as HTMLDivElement).focus();
      }
    },
    [handleDesktopClick]
  );

  return (
    <div
      ref={desktopRef}
      className="relative w-full h-full overflow-hidden desktop-canvas"
      tabIndex={0}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
    >
      {/* Layer 0 — Wallpaper */}
      <Wallpaper />

      {/* Layer 1 — Desktop icons */}
      <div className="absolute inset-0">
        {DESKTOP_ICONS.map((icon, index) => {
          const position = iconPositions[icon.id] ?? getDefaultPosition(icon);
          return (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              position={position}
              compact={isCompactDesktop}
              entranceGateOpen={entranceGateOpen}
              entranceIndex={index}
            />
          );
        })}
      </div>

      {/* Layer 3 — Windows */}
      <WindowManager />

      {/* Layer 4 — Dock */}
      <Dock entranceGateOpen={entranceGateOpen} />

      {/* Layer 5 — Context menu (portalled above everything) */}
      <ContextMenu />
    </div>
  );
}
