"use client";

import Image from "next/image";
import { WALLPAPER } from "@/data/assets";

export default function Wallpaper() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src={WALLPAPER.background}
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized
        className="object-cover object-[center_25%] pointer-events-none"
        draggable={false}
      />
    </div>
  );
}
