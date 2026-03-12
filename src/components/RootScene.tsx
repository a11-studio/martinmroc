"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./loading/LoadingScreen";
import Desktop from "./desktop/Desktop";
import MobileLayout from "./mobile/MobileLayout";

export default function RootScene() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" onComplete={() => setLoading(false)} />
        ) : isMobile ? (
          <MobileLayout key="mobile" />
        ) : (
          <Desktop key="desktop" />
        )}
      </AnimatePresence>
    </div>
  );
}
