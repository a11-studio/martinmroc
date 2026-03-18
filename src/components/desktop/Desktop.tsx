"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import { DESKTOP_ICONS } from "@/data/projects";
import { PROJECT_IMAGES } from "@/data/assets";
import { preloadImageDimensions } from "@/lib/imageDimensions";
import Wallpaper from "./Wallpaper";
import DesktopIcon from "./DesktopIcon";
import Dock from "@/components/dock/Dock";
import ContextMenu from "@/components/context-menu/ContextMenu";
import WindowManager from "@/components/windows/WindowManager";

const ICON_W = 88;
const ICON_H = 96;

/** Fallback position when store is empty (bfcache restore, tab return) */
function getDefaultPosition(icon: (typeof DESKTOP_ICONS)[0]) {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: (icon.defaultPosition.x / 100) * window.innerWidth,
    y: (icon.defaultPosition.y / 100) * window.innerHeight,
  };
}

/** Find icon ID to navigate to based on arrow key and current position */
function findNextIcon(
  direction: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
  positions: Record<string, { x: number; y: number }>,
  currentId: string | null
): string | null {
  const icons = DESKTOP_ICONS.map((icon) => ({
    id: icon.id,
    cx: (positions[icon.id]?.x ?? 0) + ICON_W / 2,
    cy: (positions[icon.id]?.y ?? 0) + ICON_H / 2,
  }));

  if (icons.length === 0) return null;

  let current = currentId
    ? icons.find((i) => i.id === currentId)
    : null;

  if (!current) {
    // Nothing selected: pick top-left by default
    const sorted = [...icons].sort((a, b) => {
      const rowA = Math.round(a.cy / 120);
      const rowB = Math.round(b.cy / 120);
      if (rowA !== rowB) return rowA - rowB;
      return a.cx - b.cx;
    });
    return sorted[0]?.id ?? null;
  }

  const candidates = icons.filter((i) => i.id !== current.id);

  if (direction === "ArrowRight") {
    const toRight = candidates.filter((i) => i.cx > current!.cx);
    if (toRight.length === 0) return null;
    return toRight.sort((a, b) => {
      const dyA = Math.abs(a.cy - current!.cy);
      const dyB = Math.abs(b.cy - current!.cy);
      if (dyA !== dyB) return dyA - dyB;
      return a.cx - b.cx;
    })[0]?.id ?? null;
  }
  if (direction === "ArrowLeft") {
    const toLeft = candidates.filter((i) => i.cx < current!.cx);
    if (toLeft.length === 0) return null;
    return toLeft.sort((a, b) => {
      const dyA = Math.abs(a.cy - current!.cy);
      const dyB = Math.abs(b.cy - current!.cy);
      if (dyA !== dyB) return dyA - dyB;
      return b.cx - a.cx;
    })[0]?.id ?? null;
  }
  if (direction === "ArrowDown") {
    const below = candidates.filter((i) => i.cy > current!.cy);
    if (below.length === 0) return null;
    return below.sort((a, b) => {
      const dxA = Math.abs(a.cx - current!.cx);
      const dxB = Math.abs(b.cx - current!.cx);
      if (dxA !== dxB) return dxA - dxB;
      return a.cy - b.cy;
    })[0]?.id ?? null;
  }
  if (direction === "ArrowUp") {
    const above = candidates.filter((i) => i.cy < current!.cy);
    if (above.length === 0) return null;
    return above.sort((a, b) => {
      const dxA = Math.abs(a.cx - current!.cx);
      const dxB = Math.abs(b.cx - current!.cx);
      if (dxA !== dxB) return dxA - dxB;
      return b.cy - a.cy;
    })[0]?.id ?? null;
  }
  return null;
}

export default function Desktop() {
  const desktopRef = useRef<HTMLDivElement>(null);
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

      // Don't steal keys when inside a window, context menu, or input/textarea
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('[role="menu"]') || target.closest("input, textarea, [contenteditable]")) return;

      // Only handle when focus is on desktop (not inside a window)
      if (!desktopRef.current?.contains(target) || target.closest('[role="dialog"]')) return;

      e.preventDefault();

      const positions = { ...useDesktopStore.getState().iconPositions };
      DESKTOP_ICONS.forEach((icon) => {
        if (!positions[icon.id]) {
          positions[icon.id] = getDefaultPosition(icon);
        }
      });

      const nextId = findNextIcon(key, positions, selectedIconId);
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
        {DESKTOP_ICONS.map((icon) => {
          const position = iconPositions[icon.id] ?? getDefaultPosition(icon);
          return (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              position={position}
            />
          );
        })}
      </div>

      {/* Layer 3 — Windows */}
      <WindowManager />

      {/* Layer 4 — Dock */}
      <Dock />

      {/* Layer 5 — Context menu (portalled above everything) */}
      <ContextMenu />
    </div>
  );
}
