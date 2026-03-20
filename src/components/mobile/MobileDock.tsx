"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DOCK_ICONS } from "@/data/assets";
import { MAILTO_COLLABORATION_HREF } from "@/lib/mailto";
import { getWhatsAppChatHref } from "@/lib/whatsapp";
import { useWindowStore } from "@/store/windowStore";
import { DEFAULT_WINDOW_SIZES } from "@/data/projects";
import { windowId } from "@/lib/utils";

type DockAction = "tooltip" | "link" | "spotify";

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
  { id: "mail",     label: "Mail",     src: DOCK_ICONS.mail,     action: "link",    href: MAILTO_COLLABORATION_HREF },
  { id: "whatsapp", label: "WhatsApp", src: DOCK_ICONS.whatsapp, action: "link",    href: getWhatsAppChatHref() },
  { id: "spotify",  label: "Spotify",  src: DOCK_ICONS.spotify,  action: "spotify" },
];

const MAIL_BADGE_DELAY_MS = 10_000;

/** Match desktop: first “stack” apps that show a tooltip on mobile (Figma, Cursor) */
const MY_STACK_TOOLTIP_IDS = new Set(["figma", "cursor"]);

function mobileDockTooltipText(
  item: (typeof MOBILE_DOCK_ITEMS)[0],
  tooltip: string | undefined
): string | undefined {
  if (!tooltip) return tooltip;
  if (MY_STACK_TOOLTIP_IDS.has(item.id)) {
    return `My stack - ${tooltip}`;
  }
  return tooltip;
}

export default function MobileDock() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [mailBadgeVisible, setMailBadgeVisible] = useState(false);
  const openWindow = useWindowStore((s) => s.openWindow);

  useEffect(() => {
    const t = window.setTimeout(() => setMailBadgeVisible(true), MAIL_BADGE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const openProjectsFinder = () => {
    openWindow({
      id: windowId("projects"),
      type: "finder",
      title: "Projects",
      props: { finderInitialFolder: "trash" },
      size: DEFAULT_WINDOW_SIZES.finder,
    });
  };

  const handleClick = (item: typeof MOBILE_DOCK_ITEMS[0]) => {
    if (item.id === "mail") {
      setMailBadgeVisible(false);
    }
    if (item.action === "spotify") {
      openWindow({
        id: windowId("spotify"),
        type: "spotify",
        title: "Spotify",
        size: DEFAULT_WINDOW_SIZES.spotify,
      });
      return;
    }
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
                    className="absolute bottom-[52px] left-1/2 -translate-x-1/2 pointer-events-none overflow-visible"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="dock-tooltip whitespace-nowrap">
                      {mobileDockTooltipText(item, item.tooltip)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
                <button
                  className="rounded-[10px] overflow-hidden active:scale-90 transition-transform focus-visible:ring-2 focus-visible:ring-white outline-none"
                  style={{ width: 40, height: 40 }}
                  onClick={() => handleClick(item)}
                  aria-label={
                    item.id === "mail" && mailBadgeVisible
                      ? `${item.label}, 1 unread notification`
                      : item.label
                  }
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
                {item.id === "mail" && (
                  <AnimatePresence>
                    {mailBadgeVisible && (
                      <motion.span
                        className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[11px] font-semibold leading-none text-white tabular-nums shadow-[0_2px_7px_rgba(0,0,0,0.38)]"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 520, damping: 24 }}
                      >
                        1
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          ))}

          {/* Separator */}
          <div
            className="h-12 w-[1.45px] mx-1 self-center shrink-0"
            style={{ background: "rgba(60,60,67,0.29)" }}
            role="separator"
            aria-hidden="true"
          />

          {/* Trash — same as desktop: opens Projects folder */}
          <button
            type="button"
            className="shrink-0 rounded-[10px] overflow-hidden active:scale-90 transition-transform focus-visible:ring-2 focus-visible:ring-white outline-none"
            style={{ width: 40, height: 40 }}
            aria-label="Trash"
            onClick={openProjectsFinder}
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
