"use client";

/** macOS-style boot splash — layout from Figma (Testing / Main Frame). */
// https://www.figma.com/design/M00pv4FlMaoNByvuKdpADU/Testing?node-id=496-9486

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  getBootPreloadUrls,
  preloadImage,
} from "@/lib/bootPreload";

const MIN_BOOT_MS = 3000;

/** Title wordmark — file name has a space; URL-encoded for fetch/img src. */
export const MARTIN_OS_TITLE_SRC = "/images/Martin%20OS.svg";

/** Shown while the RootScene chunk loads (Next dynamic `loading`). */
export function MacBootChunkFallback() {
  return (
    <div
      className="fixed inset-0 z-[2147483646] flex flex-col items-center justify-center bg-white"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-2.5 w-[min(220px,72vw)] rounded-full bg-[#e9e9e9]" />
    </div>
  );
}

type Props = {
  onReadyToDismiss: () => void;
};

export default function MacBootLoader({ onReadyToDismiss }: Props) {
  const [progress, setProgress] = useState(0);
  const dismissed = useRef(false);

  useEffect(() => {
    const urls = getBootPreloadUrls();
    const total = urls.length || 1;
    const start = performance.now();
    let loaded = 0;
    let raf = 0;
    let dismissTimer: number | undefined;
    let cancelled = false;

    const bumpLoaded = () => {
      loaded += 1;
    };

    void Promise.all(
      urls.map((src) => preloadImage(src).then(bumpLoaded)),
    );

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const timeRatio = Math.min(1, elapsed / MIN_BOOT_MS);
      const assetRatio = Math.min(1, loaded / total);
      const blended = Math.min(
        99,
        timeRatio * 38 + assetRatio * 62,
      );
      setProgress((p) => Math.max(p, blended));

      const timeOk = elapsed >= MIN_BOOT_MS;
      if (loaded >= total && timeOk && !dismissed.current) {
        setProgress(100);
        dismissTimer = window.setTimeout(() => {
          if (!cancelled && !dismissed.current) {
            dismissed.current = true;
            onReadyToDismiss();
          }
        }, 280);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, [onReadyToDismiss]);

  const fillPct = Math.min(100, Math.max(0, progress));

  return (
    <motion.div
      className="fixed inset-0 z-[2147483646] flex flex-col items-center justify-center bg-white px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fillPct)}
      aria-label="Starting up"
    >
      <div className="flex w-full max-w-[260px] flex-col items-center gap-5 sm:max-w-[280px] sm:gap-6">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="relative w-[min(112px,30vw)] shrink-0">
            <img
              src="/images/boot-face.svg"
              alt=""
              className="block h-auto w-full"
              width={248}
              height={271}
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <img
            src={MARTIN_OS_TITLE_SRC}
            alt="Martin OS"
            className="h-auto w-[min(200px,54vw)] max-w-full"
            width={283}
            height={54}
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <div className="relative h-2.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#e9e9e9] sm:max-w-[240px]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#53b9e6] via-[#789aeb] via-[61%] to-[#ba9af9] transition-[width] duration-150 ease-out"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="text-center text-xs text-black/50 sm:text-sm">
            Starting up...
          </p>
        </div>
      </div>
    </motion.div>
  );
}
