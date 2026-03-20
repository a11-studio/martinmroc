"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { ICON_THUMBNAILS, WALLPAPER } from "@/data/assets";
import { windowId } from "@/lib/utils";
import MobileDock from "./MobileDock";
import MobileSheet from "./MobileSheet";

const MOBILE_ICONS = [
  {
    id: "me",
    label: "Me.jpg",
    type: "me" as const,
    thumb: ICON_THUMBNAILS.me,
    variant: "photo" as const,
  },
  {
    id: "about",
    label: "About",
    type: "about" as const,
    thumb: ICON_THUMBNAILS.about,
    variant: "small" as const,
  },
  {
    id: "play",
    label: "Play.mp4",
    type: "video" as const,
    thumb: ICON_THUMBNAILS.play,
    variant: "app" as const,
  },
  {
    id: "projects",
    label: "Projects",
    type: "finder" as const,
    thumb: ICON_THUMBNAILS.folder,
    variant: "folder" as const,
  },
];

const ICON_POSITIONS = [
  { left: "14%", top: "34%" },
  { left: "58%", top: "28%" },
  { left: "34%", top: "56%" },
  { left: "72%", top: "44%" },
];

export default function MobileLayout() {
  const { openWindow } = useWindowStore();

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#7093E4" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile-specific wallpaper — full cover */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={WALLPAPER.mobile}
          alt=""
          fill
          className="object-cover pointer-events-none"
          draggable={false}
          unoptimized
          priority
        />
      </div>

      {/* Desktop icons — scattered, same feel as Figma */}
      <div className="absolute inset-0 bottom-28">
        {MOBILE_ICONS.map((icon, i) => {
          const pos = ICON_POSITIONS[i];
          return (
            <motion.button
              key={icon.id}
              className="absolute flex flex-col items-center gap-[6px] focus-visible:outline-none"
              style={{ left: pos.left, top: pos.top }}
              whileTap={{ scale: 0.94 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 340, damping: 28 }}
              onClick={() =>
                openWindow(
                  icon.type === "finder"
                    ? {
                        id: windowId("projects"),
                        type: "finder",
                        title: "Projects",
                        props: { finderInitialFolder: "all" },
                      }
                    : {
                        id: windowId(icon.id),
                        type: icon.type,
                        title: icon.label,
                      }
                )
              }
              aria-label={`Open ${icon.label}`}
            >
              {/* Icon image */}
              {icon.variant === "photo" ? (
                <div
                  className="rounded-[4px] overflow-hidden"
                  style={{ width: 52, height: 52, boxShadow: "0 2px 8px rgba(0,0,0,0.28)" }}
                >
                  <Image
                    src={icon.thumb}
                    alt={icon.label}
                    width={52}
                    height={52}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : icon.variant === "folder" ? (
                <div style={{ width: 44, height: 44 }}>
                  <Image
                    src={icon.thumb}
                    alt={icon.label}
                    width={44}
                    height={44}
                    className="object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : icon.variant === "small" ? (
                <div style={{ width: 44, height: 44 }}>
                  <Image
                    src={icon.thumb}
                    alt={icon.label}
                    width={44}
                    height={44}
                    className="object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <div style={{ width: 52, height: 52 }}>
                  <Image
                    src={icon.thumb}
                    alt={icon.label}
                    width={52}
                    height={52}
                    className="object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Label */}
              <span
                className="text-white text-center leading-tight"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  width: 80,
                  textShadow: "0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(0,0,0,0.2)",
                }}
              >
                {icon.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Dock */}
      <MobileDock />

      {/* Bottom sheet for opened windows */}
      <MobileSheet />
    </motion.div>
  );
}
