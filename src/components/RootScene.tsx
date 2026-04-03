"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CursorLoader from "./loading/CursorLoader";
import Desktop from "./desktop/Desktop";
import MobileLayout from "./mobile/MobileLayout";
import GlitchOverlay from "./effects/GlitchOverlay";
import { useLoadingStore } from "@/store/loadingStore";

export default function RootScene() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const loadingCount = useLoadingStore((s) => s.count);

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoad(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showLoader = isInitialLoad || loadingCount > 0;

  return (
    <div className="w-full h-full">
      {isMobile ? (
        <MobileLayout key="mobile" />
      ) : (
        <Desktop key="desktop" />
      )}

      <AnimatePresence>
        {showLoader && <CursorLoader key="loader" />}
      </AnimatePresence>

      <GlitchOverlay />
    </div>
  );
}
