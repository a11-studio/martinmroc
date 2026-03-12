"use client";

import { PROJECT_IMAGES } from "@/data/assets";

export default function MeWindow() {
  return (
    <div className="flex flex-col h-full">
      {/* Portrait */}
      <div className="relative flex-shrink-0 h-[60%] bg-gray-100 overflow-hidden">
        <img
          src={PROJECT_IMAGES.me}
          alt="Portrait"
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
      </div>

      {/* Note */}
      <div className="flex-1 flex flex-col justify-center gap-3 px-6 py-5">
        <p className="text-[15px] text-[#1c1c1e] font-medium leading-snug">
          Hey, I&apos;m a designer.
        </p>
        <p className="text-[14px] text-[#3c3c43]/75 leading-relaxed">
          I work at the intersection of identity, interface, and motion.
          I care about the details that make things feel right.
        </p>
        <p className="text-[13px] text-[#3c3c43]/50 leading-relaxed">
          This portfolio is built the way I think about design —
          as an experience, not a document.
        </p>
      </div>
    </div>
  );
}
