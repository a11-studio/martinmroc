"use client";

import { DOCK_ITEMS, DOCK_TRASH } from "@/data/projects";

export default function MobileDock() {
  const allItems = [...DOCK_ITEMS, DOCK_TRASH];

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center"
      role="toolbar"
      aria-label="Dock"
    >
      <div
        className="glass-dock flex items-center gap-3 px-4 py-3 overflow-x-auto"
        style={{ borderRadius: "18px", maxWidth: "100%" }}
      >
        {allItems.map((item, i) => {
          const isSeparator = item.id === "trash" && i === allItems.length - 1;
          return (
            <div key={item.id} className="flex items-center gap-3">
              {isSeparator && (
                <div className="h-8 w-px bg-[rgba(60,60,67,0.29)] shrink-0" aria-hidden="true" />
              )}
              <button
                className="shrink-0 rounded-[12.46px] overflow-hidden active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-white outline-none"
                style={{ width: 48, height: 48 }}
                onClick={item.onClick}
                aria-label={item.label}
              >
                <img src={item.iconSrc} alt={item.label} className="w-full h-full object-contain" draggable={false} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
