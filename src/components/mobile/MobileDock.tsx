"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DOCK_ICONS } from "@/data/assets";

type DockAction = "tooltip" | "link";

const MOBILE_DOCK_ITEMS: {
  id: string;
  label: string;
  src: string;
  action: DockAction;
  tooltip?: string;
  href?: string;
}[] = [
  { id: "figma",    label: "Figma",    src: DOCK_ICONS.figma,    action: "tooltip", tooltip: "Figma" },
  { id: "cursor",   label: "Cursor",   src: DOCK_ICONS.cursor,   action: "tooltip", tooltip: "Cursor" },
  { id: "mail",     label: "Mail",     src: DOCK_ICONS.mail,     action: "link",    href: "mailto:hello@example.com" },
  { id: "whatsapp", label: "WhatsApp", src: DOCK_ICONS.whatsapp, action: "link",    href: "https://wa.me/" },
  { id: "spotify",  label: "Spotify",  src: DOCK_ICONS.spotify,  action: "link",    href: "https://open.spotify.com" },
];

export default function MobileDock() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleClick = (item: typeof MOBILE_DOCK_ITEMS[0]) => {
    if (item.action === "link" && item.href) {
      window.open(item.href, "_blank");
    } else if (item.action === "tooltip") {
      setActiveTooltip(activeTooltip === item.id ? null : item.id);
      setTimeout(() => setActiveTooltip(null), 1800);
    }
  };

  return (
    <div className="absolute bottom-[35px] left-1/2 -translate-x-1/2 z-40">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 38, mass: 1 }}
        role="toolbar"
        aria-label="Dock"
      >
        <div
          className="glass-dock flex items-center gap-[10px] px-2.5 py-[11px]"
          style={{ borderRadius: "21.8px" }}
        >
          {MOBILE_DOCK_ITEMS.map((item) => (
            <div key={item.id} className="relative flex flex-col items-center">
              {/* Tooltip */}
              <AnimatePresence>
                {activeTooltip === item.id && (
                  <motion.div
                    className="absolute bottom-[52px] whitespace-nowrap px-2.5 py-1 rounded-[7px] text-[12px] font-medium text-white pointer-events-none"
                    style={{ background: "rgba(30,30,32,0.82)", left: "50%", x: "-50%" }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.tooltip}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-[5px]"
                      style={{
                        width: 0, height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: "5px solid rgba(30,30,32,0.82)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                className="shrink-0 rounded-[10px] overflow-hidden active:scale-90 transition-transform focus-visible:ring-2 focus-visible:ring-white outline-none"
                style={{ width: 40, height: 40 }}
                onClick={() => handleClick(item)}
                aria-label={item.label}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  width={40}
                  height={40}
                  className="object-contain"
                  draggable={false}
                />
              </button>
            </div>
          ))}

          {/* Separator */}
          <div
            className="h-12 w-[1.45px] mx-1 self-center shrink-0"
            style={{ background: "rgba(60,60,67,0.29)" }}
            role="separator"
            aria-hidden="true"
          />

          {/* Trash */}
          <button
            className="shrink-0 rounded-[10px] overflow-hidden active:scale-90 transition-transform focus-visible:ring-2 focus-visible:ring-white outline-none"
            style={{ width: 40, height: 40 }}
            aria-label="Trash"
          >
            <Image
              src={DOCK_ICONS.trash}
              alt="Trash"
              width={40}
              height={40}
              className="object-contain"
              draggable={false}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
