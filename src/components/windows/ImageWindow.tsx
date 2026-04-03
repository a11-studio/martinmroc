"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PROJECT_IMAGES, ICON_THUMBNAILS } from "@/data/assets";
import { getCachedImageSize, setCachedImageSize } from "@/lib/imageDimensions";
import { useLoadingStore } from "@/store/loadingStore";

interface ImageWindowProps {
  winId: string;
  projectId?: string;
  src?: string;
}

export default function ImageWindow({ projectId, src: srcProp }: ImageWindowProps) {
  const { startLoading, stopLoading } = useLoadingStore();
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc =
    srcProp ??
    (projectId && projectId in PROJECT_IMAGES
      ? PROJECT_IMAGES[projectId as keyof typeof PROJECT_IMAGES]
      : null);

  const thumbnailSrc =
    projectId && projectId in ICON_THUMBNAILS
      ? ICON_THUMBNAILS[projectId as keyof typeof ICON_THUMBNAILS]
      : null;

  const isBorderless = projectId === "me" || projectId === "realitiez";

  useEffect(() => {
    if (imageSrc) startLoading();
    return () => { if (imageSrc) stopLoading(); };
  }, [imageSrc, startLoading, stopLoading]);

  const handleLoad = useCallback(
    (img: { naturalWidth: number; naturalHeight: number }) => {
      setIsLoaded(true);
      stopLoading();
      if (!projectId || getCachedImageSize(projectId)) return;
      if (img.naturalWidth && img.naturalHeight) {
        setCachedImageSize(projectId, img.naturalWidth, img.naturalHeight);
      }
    },
    [projectId, stopLoading]
  );

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Image not found.
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        isBorderless ? "bg-black" : "bg-black/5"
      }`}
    >
      {thumbnailSrc && (
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${thumbnailSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(24px)",
          }}
        />
      )}

      <motion.div
        className="relative w-full h-full z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          quality={90}
          unoptimized
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-scale-down"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            handleLoad({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
          }}
        />
      </motion.div>
    </div>
  );
}
