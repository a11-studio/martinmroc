"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DOCK_ICONS, ICON_THUMBNAILS } from "@/data/assets";
import type { WindowInstance } from "@/types";

/** Same asset mapping as desktop — visuals mirror DesktopIcon at dock scale */
function thumbSrcForWindow(w: WindowInstance): string {
  switch (w.type) {
    case "finder":
      return ICON_THUMBNAILS.folder;
    case "about":
      return ICON_THUMBNAILS.about;
    case "video":
      return ICON_THUMBNAILS.play;
    case "spotify":
      return DOCK_ICONS.spotify;
    case "me":
      return ICON_THUMBNAILS.me;
    case "image":
    case "project": {
      const pid = w.props?.projectId;
      if (pid && pid in ICON_THUMBNAILS) {
        return ICON_THUMBNAILS[pid as keyof typeof ICON_THUMBNAILS];
      }
      return ICON_THUMBNAILS.folder;
    }
    default:
      return ICON_THUMBNAILS.folder;
  }
}

const THUMB_SHADOW = "0 2px 8px rgba(0,0,0,0.25)";

interface DockMinimizedTileProps {
  window: WindowInstance;
  onRestore: () => void;
}

/** Renders the same proportions as DesktopIcon for each window type — no extra dock “frame” */
function MinimizedThumb({ win }: { win: WindowInstance }) {
  const src = thumbSrcForWindow(win);
  const unopt = src.endsWith(".svg");

  const isFinder = win.type === "finder";
  const isAbout = win.type === "about";
  const isPlay = win.type === "video";
  const isSpotify = win.type === "spotify";
  const isMe =
    win.type === "me" || (win.type === "image" && win.props?.projectId === "me");

  if (isFinder) {
    return (
      <div className="flex h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] items-center justify-center pointer-events-none">
        <Image
          src={src}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] object-contain pointer-events-none"
          draggable={false}
          unoptimized={unopt}
        />
      </div>
    );
  }

  if (isAbout) {
    return (
      <div className="flex h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] items-center justify-center pointer-events-none">
        <Image
          src={src}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 max-[1199px]:h-[38px] max-[1199px]:w-[38px] object-contain pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  if (isPlay) {
    return (
      <div className="flex h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] items-center justify-center pointer-events-none">
        <Image
          src={src}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] object-contain pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  if (isSpotify) {
    return (
      <div className="flex h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] items-center justify-center pointer-events-none">
        <Image
          src={src}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] object-contain pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  if (isMe) {
    return (
      <div
        className="relative h-12 w-12 max-[1199px]:h-[42px] max-[1199px]:w-[42px] shrink-0 overflow-hidden rounded-[4px] pointer-events-none"
        style={{ boxShadow: THUMB_SHADOW }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 1199px) 42px, 48px"
          className="object-cover pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  /* Project / image .jpg — 4:3 trim like desktop (dock scale) */
  return (
    <div
      className="shrink-0 overflow-hidden rounded-[4px] pointer-events-none w-12 h-9 max-[1199px]:w-[42px] max-[1199px]:h-[31px]"
      style={{ boxShadow: THUMB_SHADOW }}
    >
      <Image
        src={src}
        alt=""
        width={48}
        height={36}
        className="h-full w-full object-cover pointer-events-none"
        draggable={false}
        unoptimized={unopt}
      />
    </div>
  );
}

function DockMinimizedTileInner({ window: win, onRestore }: DockMinimizedTileProps) {
  const [hovered, setHovered] = useState(false);
  const label = win.title || "Window";

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute bottom-[calc(100%+10px)] pointer-events-none z-10 overflow-visible"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="dock-tooltip dock-tooltip--wide truncate">{label}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="relative flex min-h-12 min-w-12 max-[1199px]:min-h-[42px] max-[1199px]:min-w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onRestore}
        aria-label={`Restore ${label}`}
      >
        <MinimizedThumb win={win} />
      </motion.button>
    </div>
  );
}

export default memo(DockMinimizedTileInner);
