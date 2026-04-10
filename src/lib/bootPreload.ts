import {
  DOCK_ICONS,
  ICON_THUMBNAILS,
  PROJECT_IMAGES,
  VIDEO,
  WALLPAPER,
} from "@/data/assets";

/**
 * Images & media warmed during the macOS-style boot screen (min. duration in UI).
 * Deduped; failures do not block completion.
 */
export const BOOT_PRELOAD_URLS: string[] = [
  WALLPAPER.background,
  WALLPAPER.mobile,
  ...Object.values(ICON_THUMBNAILS),
  ...Object.values(PROJECT_IMAGES),
  ...Object.values(DOCK_ICONS),
  VIDEO.poster,
  "/images/boot-face.svg",
  "/images/Martin%20OS.svg",
  "/images/crash-face.svg",
];

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls)];
}

export function getBootPreloadUrls(): string[] {
  return uniqueUrls(BOOT_PRELOAD_URLS);
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}
