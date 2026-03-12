"use client";

import { useWindowStore } from "@/store/windowStore";
import { PROJECTS } from "@/data/projects";
import { ICON_THUMBNAILS } from "@/data/assets";
import { windowId } from "@/lib/utils";

const FINDER_ITEMS = [
  { id: "cardinal", label: "Cardinal.jpg", thumb: ICON_THUMBNAILS.cardinal },
  { id: "freehold", label: "Freehold.jpg", thumb: ICON_THUMBNAILS.freehold },
  { id: "thirdweb", label: "Thirdweb.jpg", thumb: ICON_THUMBNAILS.thirdweb },
  { id: "realitiez", label: "Realitiez.jpg", thumb: ICON_THUMBNAILS.realitiez },
];

const SIDEBAR_ITEMS = [
  "Favourites",
  "Recent",
  "Projects",
  "Downloads",
];

export default function FinderWindow() {
  const { openWindow } = useWindowStore();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className="w-[180px] shrink-0 flex flex-col py-3 border-r border-black/[0.07] overflow-y-auto"
        style={{ background: "rgba(242,242,247,0.8)" }}
      >
        <p className="px-4 mb-2 text-[11px] font-semibold text-[#3c3c43]/50 uppercase tracking-wider">
          Favourites
        </p>
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item}
            className="flex items-center gap-2 px-4 py-[6px] text-[13px] text-[#1c1c1e]/80 hover:bg-black/[0.05] text-left transition-colors focus-visible:outline-none focus-visible:bg-black/[0.05] rounded-lg mx-1"
          >
            <span className="text-[15px]" aria-hidden="true">
              {item === "Projects" ? "📁" : item === "Recent" ? "🕐" : item === "Downloads" ? "⬇️" : "⭐"}
            </span>
            {item}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-10 flex items-center px-4 border-b border-black/[0.07] shrink-0 gap-3">
          <span className="text-[13px] font-semibold text-[#1c1c1e]/70">
            Portfolio Projects
          </span>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-5">
            {FINDER_ITEMS.map((item) => {
              const project = PROJECTS[item.id];
              return (
                <button
                  key={item.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-[10px] hover:bg-black/[0.05] active:bg-black/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-center group cursor-default"
                  onDoubleClick={() => {
                    openWindow({
                      id: windowId(item.id),
                      type: "project",
                      title: item.label,
                      props: { projectId: item.id },
                    });
                  }}
                  onClick={(e) => {
                    // Single click → open on double-click handled natively by browser
                  }}
                  aria-label={`Open ${item.label}`}
                >
                  <div className="w-16 h-12 rounded-[4px] overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={item.thumb}
                      alt={item.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[12px] text-[#1c1c1e]/80 font-medium leading-tight">
                    {item.label}
                  </span>
                  {project && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-[#3c3c43]/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
