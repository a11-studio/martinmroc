"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useDesktopStore } from "@/store/desktopStore";
import { useWindowStore } from "@/store/windowStore";
import { sortByPosition, computeCleanupGrid, CLEANUP_SPRING } from "@/lib/cleanup";
import { animate } from "framer-motion";

interface MenuItem {
  id: string;
  label: string;
  action: () => void;
  destructive?: boolean;
  dividerAfter?: boolean;
  disabled?: boolean;
}

export default function ContextMenu() {
  const prefersReduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    contextMenu,
    closeContextMenu,
    iconPositions,
    hasModifiedPositions,
    resetIconPositions,
    sortIconsByName,
    setIconPosition,
    getCleanupPositions,
  } = useDesktopStore();

  const { windows } = useWindowStore();

  const handleCleanup = useCallback(() => {
    const currentPositions = iconPositions;
    const ids = sortByPosition(Object.keys(currentPositions), currentPositions);
    const targetPositions = computeCleanupGrid(ids);

    // Animate each icon to its new position
    ids.forEach((id) => {
      const el = document.querySelector<HTMLElement>(
        `[data-icon-id="${id}"]`
      );
      if (!el) {
        // Fallback: just update store
        setIconPosition(id, targetPositions[id]);
        return;
      }
      if (prefersReduced) {
        setIconPosition(id, targetPositions[id]);
        return;
      }
      animate(
        el,
        { x: targetPositions[id].x, y: targetPositions[id].y },
        CLEANUP_SPRING
      ).then(() => {
        setIconPosition(id, targetPositions[id]);
      });
    });

    closeContextMenu();
  }, [iconPositions, prefersReduced, setIconPosition, closeContextMenu, getCleanupPositions]);

  const handleReset = useCallback(() => {
    resetIconPositions();
    closeContextMenu();
  }, [resetIconPositions, closeContextMenu]);

  const handleSort = useCallback(() => {
    sortIconsByName();
    closeContextMenu();
  }, [sortIconsByName, closeContextMenu]);

  const menuItems: MenuItem[] = [
    {
      id: "cleanup",
      label: "Clean Up Icons",
      action: handleCleanup,
      dividerAfter: true,
    },
    {
      id: "sort",
      label: "Sort by Name",
      action: handleSort,
    },
    {
      id: "reset",
      label: "Reset Positions",
      action: handleReset,
      dividerAfter: true,
      disabled: !hasModifiedPositions,
    },
    {
      id: "cancel",
      label: "Cancel",
      action: closeContextMenu,
    },
  ];

  // Close on outside click or Escape
  useEffect(() => {
    if (!contextMenu.visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [contextMenu.visible, closeContextMenu]);

  return (
    <AnimatePresence>
      {contextMenu.visible && (
        <motion.div
          ref={menuRef}
          className="fixed z-[9000] min-w-[160px] rounded-[13px] overflow-hidden px-1.5 py-[5px] flex flex-col gap-0.5 glass-context-menu"
          style={{
            left: contextMenu.position.x,
            top: contextMenu.position.y,
          }}
          initial={
            prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -6 }
          }
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }
          }
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          role="menu"
          aria-label="Desktop context menu"
        >
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                className={`glass-context-menu-item w-full text-left px-2.5 min-h-[24px] flex items-center rounded-[8px] transition-colors duration-75 outline-none ${item.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                onClick={item.disabled ? undefined : item.action}
                role="menuitem"
                disabled={item.disabled}
                aria-disabled={item.disabled}
              >
                {item.label}
              </button>
              {item.dividerAfter && (
                <div className="my-1 h-px bg-[rgba(0,0,0,0.08)]" />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
