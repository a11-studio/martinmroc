"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CursorLoader from "./loading/CursorLoader";
import Desktop from "./desktop/Desktop";
import MobileLayout from "./mobile/MobileLayout";

export default function RootScene() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="w-full h-full">
      {/* Desktop mounts underneath during loading */}
      {isMobile ? (
        <MobileLayout key="mobile" />
      ) : (
        <Desktop key="desktop" />
      )}

      {/* Cursor-adjacent loader overlay */}
      <AnimatePresence>
        {isLoading && <CursorLoader key="loader" />}
      </AnimatePresence>
    </div>
  );
}
