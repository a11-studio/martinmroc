"use client";

import { WALLPAPER } from "@/data/assets";

export default function Wallpaper() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={WALLPAPER.background}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
