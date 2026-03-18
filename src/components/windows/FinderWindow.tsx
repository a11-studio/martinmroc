"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { ICON_THUMBNAILS } from "@/data/assets";
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
];

interface FinderWindowProps {
  winId: string;
}

const SELECTION_TRANSITION = { duration: 0.14, ease: "easeOut" as const };

export default function FinderWindow({ winId }: FinderWindowProps) {
  const prefersReduced = useReducedMotion();
  const { openWindow, closeWindow, minimizeWindow, toggleMaximize } = useWindowStore();
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleItems =
    selectedFolder === "all"
      ? FINDER_ITEMS
      : FINDER_ITEMS.filter((item) => item.id === selectedFolder);

  const handleItemClick = useCallback(
    (item: (typeof FINDER_ITEMS)[0]) => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        openWindow({
          id: windowId(item.id),
          type: "project",
          title: item.label,
          props: { projectId: item.id },
        });
        return;
      }
      setSelectedItemId(item.id);
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
      }, 280);
    },
    [openWindow]
  );

  const selectedLabel =
    selectedFolder === "all"
      ? "Projects"
      : SIDEBAR_FOLDERS.find((f) => f.id === selectedFolder)?.label ?? "Projects";

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ borderRadius: 26 }}>
      {/* ── Sidebar: liquid glass (isolation prevents blend from right-pane clicks) ── */}
      <div
        className="relative w-[240px] shrink-0 h-full overflow-hidden"
        style={{ borderRadius: "26px 0 0 26px", isolation: "isolate" }}
      >
        {/* Frosted glass base — no blend modes to avoid light layer on click */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            background: "rgba(245,245,245,0.75)",
            borderRadius: "26px 0 0 26px",
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

          {/* Folder list */}
          {SIDEBAR_FOLDERS.map((folder) => {
            const isSelected = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                className="flex items-center gap-[5px] h-[24px] px-[6px] mx-[10px] rounded-[5px] text-left focus-visible:outline-none transition-colors"
                style={{
                  background: isSelected ? "rgba(0,0,0,0.11)" : "transparent",
                }}
                onClick={() => setSelectedFolder(folder.id)}
                onDoubleClick={() => {
                  if (folder.id !== "all") {
                    openWindow({
                      id: windowId(folder.id),
                      type: "project",
                      title: folder.label + ".jpg",
                      props: { projectId: folder.id },
                    });
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

          {/* Section header */}
          <div className="px-[18px] pt-[14px] pb-[4px] shrink-0">
            <span className="text-[11px] font-bold tracking-wide" style={{ color: "rgba(0,0,0,0.45)" }}>
              RECENT
            </span>
          </div>
        </div>
      </div>

      {/* ── Right pane ── */}
      <div
        className="flex-1 flex flex-col min-w-0 bg-white"
        style={{ borderRadius: "0 26px 26px 0" }}
      >
        {/* Toolbar — also a drag area */}
        <div
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
        </div>

        {/* Content grid */}
        <div
          className="flex-1 overflow-y-auto p-[20px] cursor-default"
          onClick={() => setSelectedItemId(null)}
        >
          <div className="flex flex-wrap gap-[20px]">
            {visibleItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <motion.div
                  key={item.id}
                  role="button"
                  tabIndex={0}
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
                      openWindow({
                        id: windowId(item.id),
                        type: "project",
                        title: item.label,
                        props: { projectId: item.id },
                      });
                    }
                  }}
                >
                  {/* Thumbnail — same format as desktop: 72×54, object-contain, no crop */}
                  <div className="relative flex items-center justify-center rounded-[4px]" style={{ width: 72, height: 54 }}>
                    <div
                      className="absolute inset-0 rounded-[4px] pointer-events-none"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
                    />
                    <Image
                      src={item.thumb}
                      alt={item.label}
                      width={72}
                      height={54}
                      className="relative object-contain pointer-events-none rounded-[4px]"
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
        </div>
      </div>
    </div>
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
