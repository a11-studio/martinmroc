"use client";

import { useRef, useState } from "react";
import { VIDEO } from "@/data/assets";

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-[#0a0a0a]">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={VIDEO.play}
        poster={VIDEO.poster}
        preload="metadata"
        playsInline
        controls
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => setIsLoaded(true)}
        aria-label="Portfolio video"
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
          <img
            src={VIDEO.poster}
            alt="Video poster"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
            <span className="text-white/60 text-[13px]">Loading…</span>
          </div>
        </div>
      )}
    </div>
  );
}
