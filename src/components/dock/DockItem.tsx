"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { DEFAULT_WINDOW_SIZES } from "@/data/projects";
import { windowId } from "@/lib/utils";
import type { DockItemData } from "@/types";

/** Delay before Mail shows the red unread-style badge (ms) */
const MAIL_BADGE_DELAY_MS = 10_000;

/** First four dock apps — tooltip explains these are the user’s daily stack */
const MY_STACK_APP_IDS = new Set(["photoshop", "after-effects", "figma", "cursor"]);

/** Dock icon slot: 48×48px desktop, 42×42px when viewport ≤1199px — matches parent button */
const DOCK_ICON_FILL_SIZES = "(max-width: 1199px) 42px, 48px";

function dockTooltipLabel(item: DockItemData): string {
  if (MY_STACK_APP_IDS.has(item.id)) {
    return `My stack - ${item.label}`;
  }
  return item.label;
}

interface DockItemProps {
  item: DockItemData;
}

function DockItemInner({ item }: DockItemProps) {
  const [hovered, setHovered] = useState(false);
  const [mailBadgeVisible, setMailBadgeVisible] = useState(false);
  const openWindow = useWindowStore((s) => s.openWindow);

  useEffect(() => {
    if (item.id !== "mail") return;
    const t = window.setTimeout(() => setMailBadgeVisible(true), MAIL_BADGE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [item.id]);

  const handleTap = () => {
    if (item.id === "mail") {
      setMailBadgeVisible(false);
    }
    if (item.onClick) {
      item.onClick();
      return;
    }
    // Trash opens the same Finder / Projects folder as the desktop icon
    if (item.id === "trash") {
      openWindow({
        id: windowId("projects"),
        type: "finder",
        title: "Projects",
        props: { finderInitialFolder: "trash" },
        size: DEFAULT_WINDOW_SIZES.finder,
      });
      return;
    }
    if (item.id === "spotify") {
      openWindow({
        id: windowId("spotify"),
        type: "spotify",
        title: "Spotify",
        size: DEFAULT_WINDOW_SIZES.spotify,
      });
      return;
    }
  };

  const renderIcon = () => {
    const rounded = "rounded-[12.46px]";

    if (item.render === "composite" && item.compositeSrc) {
      return (
        <div className={`relative size-full overflow-hidden ${rounded} max-[1199px]:rounded-[11px]`}>
          <Image
            src={item.compositeSrc.bg}
            alt=""
            fill
            sizes={DOCK_ICON_FILL_SIZES}
            className="object-contain object-center pointer-events-none"
            draggable={false}
          />
          <Image
            src={item.compositeSrc.text}
            alt={item.label}
            fill
            sizes={DOCK_ICON_FILL_SIZES}
            className="object-contain object-center pointer-events-none"
            style={{ padding: "25.43% 17.33% 28.42% 22.5%" }}
            draggable={false}
          />
        </div>
      );
    }

    if (item.render === "cursor" && item.iconSrc) {
      return (
        <div
          className={`relative size-full ${rounded} max-[1199px]:rounded-[11px] overflow-hidden`}
          style={{
            background:
              "linear-gradient(148.81deg, rgb(37,37,37) 26.4%, rgb(22,22,22) 81.1%, rgba(0,0,0,0.54) 92.5%)",
            boxShadow: "0 0.641px 1.282px rgba(0,0,0,0.28)",
            border: "1.223px solid rgba(239,239,239,0.76)",
          }}
        >
          <div className={`absolute inset-[1%] bg-[rgba(217,217,217,0.14)] ${rounded}`} />
          <Image
            src={item.iconSrc}
            alt={item.label}
            width={33}
            height={37}
            className="absolute left-[15.6%] top-[14%] h-[37px] w-[33px] max-[1199px]:h-[32px] max-[1199px]:w-[29px] object-contain object-center pointer-events-none"
            draggable={false}
          />
        </div>
      );
    }

    if (item.iconSrc) {
      return (
        <div className={`relative size-full overflow-hidden ${rounded} max-[1199px]:rounded-[11px]`}>
          <Image
            src={item.iconSrc}
            alt={item.label}
            fill
            sizes={DOCK_ICON_FILL_SIZES}
            className="object-contain object-center pointer-events-none"
            draggable={false}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute bottom-[calc(100%+10px)] max-[1199px]:bottom-[calc(100%+8px)] pointer-events-none overflow-visible"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="dock-tooltip whitespace-nowrap">{dockTooltipLabel(item)}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-12 w-12 shrink-0 max-[1199px]:h-[42px] max-[1199px]:w-[42px]">
        <motion.button
          className="relative flex h-12 w-12 flex-none max-[1199px]:h-[42px] max-[1199px]:w-[42px] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-[12.46px] max-[1199px]:rounded-[11px] outline-none overflow-hidden"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onTap={handleTap}
          aria-label={
            item.id === "mail" && mailBadgeVisible
              ? `${item.label}, 1 unread notification`
              : item.label
          }
        >
          {renderIcon()}
        </motion.button>

        {/* macOS-style red badge — Mail, after delay */}
        {item.id === "mail" && (
          <AnimatePresence>
            {mailBadgeVisible && (
              <motion.span
                className="pointer-events-none absolute -right-1 -top-1 z-10 flex h-[22px] min-w-[22px] max-[1199px]:h-[19px] max-[1199px]:min-w-[19px] items-center justify-center rounded-full bg-[#FF3B30] px-1.5 max-[1199px]:px-1 text-[12px] max-[1199px]:text-[11px] font-semibold leading-none text-white tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.38)]"
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
  );
}

export default memo(DockItemInner);
