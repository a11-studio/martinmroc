"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PROJECT_IMAGES, ICON_THUMBNAILS } from "@/data/assets";

export default function MeWindow() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Portrait — blur-up */}
      <div className="relative flex-shrink-0 h-[60%] bg-gray-100 overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${ICON_THUMBNAILS.me})`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
            filter: "blur(24px)",
          }}
        />
        <motion.img
          src={PROJECT_IMAGES.me}
          alt="Portrait"
          className="relative w-full h-full object-cover object-top z-10"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 to-transparent z-20 pointer-events-none" />
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
