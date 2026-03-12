"use client";

import DockItem from "./DockItem";
import { DOCK_ITEMS, DOCK_TRASH } from "@/data/projects";

export default function Dock() {
  return (
    <div
      className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end z-40"
      role="toolbar"
      aria-label="Dock"
    >
      <div
        className="glass-dock relative flex items-center justify-center gap-[13.065px] px-[11.613px] py-[14.516px]"
        style={{ borderRadius: "21.8px" }}
      >
        {/* App icons */}
        {DOCK_ITEMS.map((item) => (
          <DockItem key={item.id} item={item} />
        ))}

        {/* Divider */}
        <div
          className="h-12 w-[1.45px] mx-[5px] self-center shrink-0"
          style={{ background: "rgba(60,60,67,0.29)" }}
          role="separator"
          aria-hidden="true"
        />

        {/* Trash */}
        <DockItem item={DOCK_TRASH} />
      </div>
    </div>
  );
}
