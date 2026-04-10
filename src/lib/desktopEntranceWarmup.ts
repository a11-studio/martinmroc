import { DOCK_ICONS, ICON_THUMBNAILS } from "@/data/assets";

const ENTRANCE_URLS: string[] = [
  ...new Set([
    ...Object.values(DOCK_ICONS),
    ...Object.values(ICON_THUMBNAILS),
  ]),
];

function decodeOne(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Ensures dock + desktop thumb bitmaps are decoded and gives the compositor
 * two frames before entrance motion (reduces jank after the boot overlay).
 */
async function runWarmup(): Promise<void> {
  await Promise.all(ENTRANCE_URLS.map(decodeOne));
  await new Promise<void>((r) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => r());
    });
  });
}

let cached: Promise<void> | null = null;

export function warmupDesktopEntrance(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  cached ??= runWarmup();
  return cached;
}
