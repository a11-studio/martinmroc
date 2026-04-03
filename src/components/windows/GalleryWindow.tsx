"use client";

import { GALLERY_PROJECTS } from "@/data/assets";

interface GalleryWindowProps {
  projectId?: string;
}

export default function GalleryWindow({ projectId }: GalleryWindowProps) {
  const images = projectId ? (GALLERY_PROJECTS[projectId] ?? []) : [];

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No images found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full bg-[#f2f2f2]">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={`${projectId} image ${i + 1}`}
          className="w-full h-auto rounded-xl"
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
        />
      ))}
    </div>
  );
}
