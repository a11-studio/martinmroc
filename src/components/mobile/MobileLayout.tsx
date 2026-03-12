"use client";

import { motion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { DESKTOP_ICONS } from "@/data/projects";
import { windowId } from "@/lib/utils";
import { WALLPAPER } from "@/data/assets";
import MobileDock from "./MobileDock";
import MobileSheet from "./MobileSheet";

export default function MobileLayout() {
  const { openWindow } = useWindowStore();

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden bg-[#799cea]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Wallpaper */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={WALLPAPER.background}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Icon grid */}
      <div className="absolute inset-0 top-0 bottom-28 overflow-y-auto px-4 pt-8 pb-4 z-10">
        <div className="grid grid-cols-2 gap-4">
          {DESKTOP_ICONS.map((icon) => (
            <button
              key={icon.id}
              className="relative flex flex-col rounded-[16px] overflow-hidden active:scale-95 transition-transform text-left focus-visible:ring-2 focus-visible:ring-white outline-none"
              style={{
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onClick={() => {
                openWindow({
                  id: windowId(icon.id),
                  type: icon.type,
                  title: icon.label,
                  props: icon.props,
                });
              }}
              aria-label={`Open ${icon.label}`}
            >
              {/* Thumbnail */}
              <div className="w-full aspect-[4/3] overflow-hidden">
                <img
                  src={icon.thumbnailSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Label */}
              <div className="px-3 py-2">
                <span className="text-[13px] font-medium text-white leading-tight">
                  {icon.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile dock */}
      <MobileDock />

      {/* Bottom sheet windows */}
      <MobileSheet />
    </motion.div>
  );
}
