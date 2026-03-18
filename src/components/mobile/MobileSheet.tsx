"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import ProjectWindow from "@/components/windows/ProjectWindow";
import AboutWindow from "@/components/windows/AboutWindow";
import VideoPlayer from "@/components/windows/VideoPlayer";
import MeWindow from "@/components/windows/MeWindow";
import ImageWindow from "@/components/windows/ImageWindow";
import FinderWindow from "@/components/windows/FinderWindow";

export default function MobileSheet() {
  const { windows, closeWindow } = useWindowStore();
  const topWindow = windows.filter((w) => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];

  return (
    <AnimatePresence>
      {topWindow && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-[800]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeWindow(topWindow.id)}
          />

          {/* Sheet */}
          <motion.div
            key={topWindow.id}
            className="fixed bottom-0 left-0 right-0 z-[900] rounded-t-[20px] overflow-hidden"
            style={{ height: "88vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
          >
            <div className="glass-window h-full flex flex-col">
              {/* Handle + header */}
              <div className={`flex flex-col items-center pt-3 pb-2 shrink-0 ${topWindow.type !== "finder" ? "border-b border-black/[0.06]" : ""}`}>
                <div className="w-10 h-1 rounded-full bg-black/20 mb-3" />
                <div className="flex items-center justify-between w-full px-5">
                  <span className="text-[15px] font-semibold text-[#1c1c1e]">
                    {topWindow.title}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[14px] text-[#1c1c1e]/60 hover:bg-black/[0.1] transition-colors"
                    onClick={() => closeWindow(topWindow.id)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto min-h-0">
                {topWindow.type === "project" && (
                  <ProjectWindow projectId={topWindow.props?.projectId} />
                )}
                {topWindow.type === "about" && <AboutWindow />}
                {topWindow.type === "video" && <VideoPlayer />}
                {topWindow.type === "me" && <ImageWindow winId={topWindow.id} projectId="me" />}
                {topWindow.type === "image" && <ImageWindow winId={topWindow.id} projectId={topWindow.props?.projectId} />}
                {topWindow.type === "finder" && <FinderWindow winId={topWindow.id} />}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
