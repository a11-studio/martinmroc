"use client";

import { useEffect, useCallback } from "react";
import { useDesktopStore } from "@/store/desktopStore";
import { DESKTOP_ICONS } from "@/data/projects";
import Wallpaper from "./Wallpaper";
import DesktopIcon from "./DesktopIcon";
import Dock from "@/components/dock/Dock";
import ContextMenu from "@/components/context-menu/ContextMenu";
import WindowManager from "@/components/windows/WindowManager";

/** Fallback position when store is empty (bfcache restore, tab return) */
function getDefaultPosition(icon: (typeof DESKTOP_ICONS)[0]) {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: (icon.defaultPosition.x / 100) * window.innerWidth,
    y: (icon.defaultPosition.y / 100) * window.innerHeight,
  };
}

export default function Desktop() {
  const {
    iconPositions,
    resetIconPositions,
    selectIcon,
    openContextMenu,
    closeContextMenu,
  } = useDesktopStore();

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

  return (
    <div
      className="relative w-full h-full overflow-hidden desktop-canvas"
      onClick={handleDesktopClick}
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
