"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import CursorLoader from "./loading/CursorLoader";
import MacBootLoader from "./loading/MacBootLoader";
import Desktop from "./desktop/Desktop";
import MobileLayout from "./mobile/MobileLayout";
import GlitchOverlay from "./effects/GlitchOverlay";
import { useLoadingStore } from "@/store/loadingStore";
import { warmupDesktopEntrance } from "@/lib/desktopEntranceWarmup";

export default function RootScene() {
  const [bootVisible, setBootVisible] = useState(true);
  /** After boot overlay exit + decode/rAF warmup — then dock / icons animate in */
  const [desktopEntranceReady, setDesktopEntranceReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const loadingCount = useLoadingStore((s) => s.count);

  const dismissBoot = useCallback(() => {
    void warmupDesktopEntrance();
    setBootVisible(false);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showCursorLoader = !bootVisible && loadingCount > 0;

  return (
    <div className="w-full h-full">
      {isMobile ? (
        <MobileLayout key="mobile" />
      ) : (
        <Desktop key="desktop" entranceGateOpen={desktopEntranceReady} />
      )}

      <AnimatePresence
        onExitComplete={() => {
          void warmupDesktopEntrance().then(() => setDesktopEntranceReady(true));
        }}
      >
        {bootVisible && (
          <MacBootLoader key="mac-boot" onReadyToDismiss={dismissBoot} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCursorLoader && <CursorLoader key="loader" />}
      </AnimatePresence>

      <GlitchOverlay />
    </div>
  );
}
