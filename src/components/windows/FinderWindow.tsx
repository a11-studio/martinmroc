"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { findNextSpatialId, type ArrowDirection } from "@/lib/spatialNavigation";
import { useWindowStore } from "@/store/windowStore";
import { useLoadingStore } from "@/store/loadingStore";
import { ICON_THUMBNAILS, PROJECT_IMAGES } from "@/data/assets";
import { getCachedImageSize, preloadImageDimensions } from "@/lib/imageDimensions";
import { windowId } from "@/lib/utils";

const FINDER_ITEMS = [
  { id: "cardinal", label: "Cardinal.jpg", thumb: ICON_THUMBNAILS.cardinal },
  { id: "freehold", label: "Freehold.jpg", thumb: ICON_THUMBNAILS.freehold },
  { id: "thirdweb", label: "Thirdweb.jpg", thumb: ICON_THUMBNAILS.thirdweb },
  { id: "realitiez", label: "Realitiez.jpg", thumb: ICON_THUMBNAILS.realitiez },
];

const SIDEBAR_FOLDERS = [
  { id: "all", label: "All Projects" },
  { id: "cardinal", label: "Cardinal" },
  { id: "freehold", label: "Freehold" },
  { id: "thirdweb", label: "Thirdweb" },
  { id: "realitiez", label: "Realitiez" },
] as const;

type SidebarFolderId = (typeof SIDEBAR_FOLDERS)[number]["id"] | "trash";

const SIDEBAR_ORDER: SidebarFolderId[] = [
  ...SIDEBAR_FOLDERS.map((f) => f.id),
  "trash",
];

interface FinderWindowProps {
  winId: string;
  finderInitialFolder?: "all" | "trash";
}

const SELECTION_TRANSITION = { duration: 0.14, ease: "easeOut" as const };

export default function FinderWindow({ winId, finderInitialFolder }: FinderWindowProps) {
  const prefersReduced = useReducedMotion();
  const { openWindow, closeWindow, minimizeWindow, toggleMaximize } = useWindowStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const [selectedFolder, setSelectedFolder] = useState<SidebarFolderId>(
    () => finderInitialFolder ?? "all"
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finderRootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef({
    winId,
    isMobile,
    selectedFolder,
    selectedItemId,
    visibleCount: 0 as number,
  });

  useEffect(() => {
    if (finderInitialFolder === "trash" || finderInitialFolder === "all") {
      setSelectedFolder(finderInitialFolder);
    }
  }, [finderInitialFolder]);

  const visibleItems =
    selectedFolder === "trash"
      ? []
      : selectedFolder === "all"
        ? FINDER_ITEMS
        : FINDER_ITEMS.filter((item) => item.id === selectedFolder);

  navRef.current = {
    winId,
    isMobile,
    selectedFolder,
    selectedItemId,
    visibleCount: visibleItems.length,
  };

  const visibleIdsKey = visibleItems.map((i) => i.id).join("|");

  useEffect(() => {
    if (selectedFolder === "trash") {
      setSelectedItemId(null);
      return;
    }
    setSelectedItemId((prev) => {
      if (!prev) return null;
      const ids = visibleIdsKey.length ? visibleIdsKey.split("|") : [];
      return ids.includes(prev) ? prev : null;
    });
  }, [selectedFolder, visibleIdsKey]);

  // Arrow keys: sidebar (desktop) + spatial grid — same pattern as desktop icons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;

      const { windows } = useWindowStore.getState();
      const top = [...windows]
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

      const { winId: id, isMobile: mobile, selectedFolder: folder, selectedItemId: itemId, visibleCount } =
        navRef.current;

      if (!top || top.type !== "finder" || top.id !== id) return;

      const root = finderRootRef.current;
      if (!root) return;

      // Another window / sheet has focus — don’t drive this Finder
      if (target.closest('[role="dialog"]') && !root.contains(target)) return;

      const actuallyPreferGrid = visibleCount > 0;
      const inSidebar = !mobile && !!target.closest("[data-finder-sidebar]");
      const sidebarNav = !mobile && (inSidebar || !actuallyPreferGrid);

      const focusSidebarEntry = (sid: SidebarFolderId) => {
        requestAnimationFrame(() => {
          root.querySelector<HTMLElement>(`[data-finder-sidebar-id="${sid}"]`)?.focus();
        });
      };

      const focusItem = (itemKey: string) => {
        requestAnimationFrame(() => {
          root.querySelector<HTMLElement>(`[data-finder-item-id="${itemKey}"]`)?.focus();
        });
      };

      if (sidebarNav) {
        if (key !== "ArrowUp" && key !== "ArrowDown") return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const order = SIDEBAR_ORDER;
        const i = order.indexOf(folder);
        if (i < 0) return;
        const delta = key === "ArrowDown" ? 1 : -1;
        const ni = Math.max(0, Math.min(order.length - 1, i + delta));
        if (ni !== i) {
          setSelectedFolder(order[ni]);
          setSelectedItemId(null);
          focusSidebarEntry(order[ni]);
        }
        return;
      }

      if (!actuallyPreferGrid) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      const nodes = root.querySelectorAll<HTMLElement>("[data-finder-item-id]");
      if (!nodes.length) return;

      const items = [...nodes].map((el) => {
        const fid = el.getAttribute("data-finder-item-id")!;
        const r = el.getBoundingClientRect();
        return { id: fid, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });

      const nextId = findNextSpatialId(key as ArrowDirection, items, itemId, 115);
      if (nextId) {
        setSelectedItemId(nextId);
        focusItem(nextId);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [winId]);

  const openImageWindow = useCallback(
    async (item: (typeof FINDER_ITEMS)[0]) => {
      let size: { width: number; height: number } | undefined;
      if (item.id in PROJECT_IMAGES) {
        const cached = getCachedImageSize(item.id);
        if (cached) {
          size = cached;
        } else {
          startLoading();
          try {
            size = await preloadImageDimensions(item.id, PROJECT_IMAGES[item.id as keyof typeof PROJECT_IMAGES]);
          } finally {
            stopLoading();
          }
        }
      }
      openWindow({
        id: windowId(item.id),
        type: "image",
        title: item.label,
        props: { projectId: item.id },
        size,
      });
    },
    [openWindow, startLoading, stopLoading]
  );

  const handleItemClick = useCallback(
    (item: (typeof FINDER_ITEMS)[0]) => {
      if (isMobile) {
        openImageWindow(item);
        return;
      }
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        openImageWindow(item);
        return;
      }
      setSelectedItemId(item.id);
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
      }, 280);
    },
    [isMobile, openImageWindow]
  );

  const selectedLabel =
    selectedFolder === "trash"
      ? "Trash"
      : selectedFolder === "all"
        ? "Projects"
        : SIDEBAR_FOLDERS.find((f) => f.id === selectedFolder)?.label ?? "Projects";

  return (
    <div
      ref={finderRootRef}
      data-finder-window
      className="flex h-full w-full overflow-hidden outline-none"
      style={{ borderRadius: 26 }}
      tabIndex={-1}
    >
      {/* ── Sidebar: hidden on mobile ── */}
      {!isMobile && <div
        className="relative w-[240px] shrink-0 h-full overflow-hidden"
        style={{ borderRadius: "26px 0 0 26px", isolation: "isolate" }}
      >
        {/* Frosted glass base — will-change + translateZ force GPU layer from frame 1 to avoid flicker */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            background: "rgba(245,245,245,0.75)",
            borderRadius: "26px 0 0 26px",
            willChange: "backdrop-filter",
            transform: "translateZ(0)",
          }}
        />
        {/* Right-edge divider */}
        <div
          className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
          style={{ background: "transparent" }}
        />

        {/* Sidebar content */}
        <div className="relative flex flex-col h-full py-[10px] z-10">
          {/* Header row: traffic lights (+ drag area) */}
          <div
            className="window-drag-area flex items-center px-[14px] h-[34px] mb-[4px] shrink-0"
            style={{ cursor: "default" }}
          >
            <TrafficBtn color="#ff736a" label="Close" symbol="✕" onClick={() => closeWindow(winId)} />
            <TrafficBtn color="#febc2e" label="Minimize" symbol="−" onClick={() => minimizeWindow(winId)} />
            <TrafficBtn
              color="#19c332"
              label="Zoom"
              symbol="+"
              onClick={() => toggleMaximize(winId)}
            />
          </div>

          {/* Folder list + trash (arrow-key navigable) */}
          <div data-finder-sidebar className="flex flex-col min-h-0">
          {SIDEBAR_FOLDERS.map((folder) => {
            const isSelected = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                type="button"
                data-finder-sidebar-id={folder.id}
                className="flex items-center gap-[5px] h-[24px] px-[6px] mx-[10px] rounded-[5px] text-left focus-visible:outline-none transition-colors"
                style={{
                  background: isSelected ? "rgba(0,0,0,0.11)" : "transparent",
                }}
                onClick={() => setSelectedFolder(folder.id)}
                onDoubleClick={() => {
                  if (folder.id !== "all") {
                    const item = FINDER_ITEMS.find((i) => i.id === folder.id);
                    if (item) openImageWindow(item);
                  }
                }}
              >
                {/* Folder icon */}
                <svg
                  width="16"
                  height="13"
                  viewBox="0 0 16 13"
                  fill="none"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M1 3C1 2.17 1.67 1.5 2.5 1.5H6L7.5 3.5H13C13.83 3.5 14.5 4.17 14.5 5V10.5C14.5 11.33 13.83 12 13 12H3C2.17 12 1.5 11.33 1.5 10.5V3Z"
                    fill={isSelected ? "#007aff" : "none"}
                    stroke={isSelected ? "#007aff" : "rgba(0,0,0,0.55)"}
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="text-[11px] font-medium truncate"
                  style={{ color: "rgba(0,0,0,0.85)" }}
                >
                  {folder.label}
                </span>
              </button>
            );
          })}

          {/* Trash — same slot as former RECENT */}
          <div className="px-[18px] pt-[14px] pb-[4px] shrink-0">
            <span className="text-[11px] font-bold tracking-wide" style={{ color: "rgba(0,0,0,0.45)" }}>
              TRASH
            </span>
          </div>
          <button
            type="button"
            data-finder-sidebar-id="trash"
            className="flex items-center gap-[5px] h-[24px] px-[6px] mx-[10px] rounded-[5px] text-left focus-visible:outline-none transition-colors"
            style={{
              background: selectedFolder === "trash" ? "rgba(0,0,0,0.11)" : "transparent",
            }}
            onClick={() => setSelectedFolder("trash")}
            aria-current={selectedFolder === "trash" ? "true" : undefined}
          >
            <TrashSidebarIcon selected={selectedFolder === "trash"} />
            <span className="text-[11px] font-medium truncate" style={{ color: "rgba(0,0,0,0.85)" }}>
              Trash
            </span>
          </button>
          </div>
        </div>
      </div>}

      {/* ── Right pane ── */}
      <div
        className="flex-1 flex flex-col min-w-0 bg-white"
        style={{ borderRadius: isMobile ? "26px" : "0 26px 26px 0" }}
      >
        {/* Toolbar — hidden on mobile */}
        {!isMobile && <div
          className="window-drag-area flex items-center gap-[8px] px-[12px] pt-[10px] pb-[10px] shrink-0"
          style={{ cursor: "default" }}
        >
          {/* Back / Forward segmented control */}
          <div
            className="flex items-center shrink-0"
            style={{
              background: "rgba(247,247,247,0.95)",
              borderRadius: 999,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              padding: 4,
            }}
          >
            <button
              className="w-[30px] h-[28px] flex items-center justify-center rounded-full text-[17px] font-medium text-[rgba(26,26,26,0.8)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              aria-label="Back"
            >
              ‹
            </button>
            <div className="w-px h-[18px]" style={{ background: "rgba(255,255,255,0.6)" }} />
            <button
              className="w-[30px] h-[28px] flex items-center justify-center rounded-full text-[17px] font-medium text-[rgba(26,26,26,0.3)] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              aria-label="Forward"
            >
              ›
            </button>
          </div>

          {/* Folder title */}
          <span
            className="text-[15px] font-bold shrink-0"
            style={{ color: "rgba(0,0,0,0.85)" }}
          >
            {selectedLabel}
          </span>

          <div className="flex-1 min-w-0" />
        </div>}

        {/* Content grid */}
        <div
          className="flex-1 overflow-y-auto p-[20px] cursor-default"
          onClick={() => setSelectedItemId(null)}
        >
          {selectedFolder === "trash" ? (
            <div className="flex flex-col items-center justify-center min-h-[120px] pt-[8px]">
              <p className="text-[13px] font-medium" style={{ color: "rgba(0,0,0,0.45)" }}>
                Trash is empty.
              </p>
            </div>
          ) : (
          <div className="flex flex-wrap gap-[20px]">
            {visibleItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <motion.div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  data-finder-item-id={item.id}
                  aria-label={`Open ${item.label}`}
                  aria-selected={isSelected}
                  className="flex flex-col items-center gap-[6px] p-[8px] rounded-[8px] cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  whileTap={prefersReduced ? {} : { scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openImageWindow(item);
                    }
                  }}
                >
                  {/* Thumbnail — 4:3 (72×54), object-cover — same crop as desktop project icons */}
                  <div
                    className="relative flex items-center justify-center rounded-[4px] overflow-hidden"
                    style={{ width: 72, height: 54 }}
                  >
                    <div
                      className="absolute inset-0 rounded-[4px] pointer-events-none"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                    />
                    <Image
                      src={item.thumb}
                      alt={item.label}
                      width={72}
                      height={54}
                      className="relative h-full w-full object-cover pointer-events-none"
                      draggable={false}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-[4px] pointer-events-none"
                      initial={false}
                      animate={{
                        background: isSelected ? "rgba(255,255,255,0.08)" : "transparent",
                        boxShadow: isSelected
                          ? "inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 0 12px rgba(255,255,255,0.06)"
                          : "none",
                      }}
                      transition={SELECTION_TRANSITION}
                    />
                  </div>
                  {/* Label — blue pill when selected (macOS Finder style) */}
                  <motion.span
                    className="inline-block text-center pointer-events-none px-[8px] py-[3px] rounded-lg max-w-[88px] truncate"
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                    initial={false}
                    animate={{
                      backgroundColor: isSelected ? "#0A84FF" : "transparent",
                      color: isSelected ? "white" : "rgba(0,0,0,0.8)",
                    }}
                    transition={SELECTION_TRANSITION}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrashSidebarIcon({ selected }: { selected: boolean }) {
  const stroke = selected ? "#007aff" : "rgba(0,0,0,0.55)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden="true">
      <path
        d="M6 2h4l1 1.5H14v1H2v-1h3L6 2zM4 6v7a2 2 0 002 2h4a2 2 0 002-2V6H4z"
        stroke={stroke}
        strokeWidth="1"
        fill={selected ? "rgba(0,122,255,0.12)" : "none"}
        strokeLinejoin="round"
      />
      <path
        d="M6.5 8.5v4M9.5 8.5v4"
        stroke={selected ? "#007aff" : "rgba(0,0,0,0.4)"}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Traffic light (used in sidebar)
// ─────────────────────────────────────────────────────────────────

function TrafficBtn({
  color,
  label,
  symbol,
  onClick,
}: {
  color: string;
  label: string;
  symbol: string;
  onClick: () => void;
}) {
  return (
    <button
      className="group relative rounded-full transition-opacity focus-visible:ring-2 focus-visible:ring-white/60 outline-none mr-[7px] last:mr-0"
      style={{
        width: 14,
        height: 14,
        background: color,
        flexShrink: 0,
      }}
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
