/**
 * Preload image dimensions so we can open image windows with correct size from the start.
 * Avoids resize jump when the image loads.
 */

const TITLE_BAR_H = 38;
const MIN_SIZE = { w: 280, h: 200 };
const VPORT_PADDING = 48;
const MAX_W = 560;

const cache = new Map<string, { width: number; height: number }>();

function computeWindowSize(nw: number, nh: number): { width: number; height: number } {
  const maxW = typeof window !== "undefined"
    ? Math.min(MAX_W, window.innerWidth - VPORT_PADDING * 2)
    : MAX_W;
  const maxContentH = typeof window !== "undefined"
    ? window.innerHeight - TITLE_BAR_H - VPORT_PADDING * 2
    : 500;

  const aspect = nh / nw;
  let w = maxW;
  let contentH = w * aspect;

  if (contentH > maxContentH) {
    contentH = maxContentH;
    w = contentH / aspect;
  }

  w = Math.max(Math.min(w, maxW), MIN_SIZE.w);
  const h = Math.max(Math.round(TITLE_BAR_H + contentH), MIN_SIZE.h);

  return { width: Math.round(w), height: h };
}

export function getCachedImageSize(projectId: string): { width: number; height: number } | null {
  return cache.get(projectId) ?? null;
}

export function preloadImageDimensions(
  projectId: string,
  src: string
): Promise<{ width: number; height: number }> {
  if (cache.has(projectId)) {
    return Promise.resolve(cache.get(projectId)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = computeWindowSize(img.naturalWidth, img.naturalHeight);
      cache.set(projectId, size);
      resolve(size);
    };
    img.onerror = () => {
      const fallback = { width: 480, height: 360 };
      cache.set(projectId, fallback);
      resolve(fallback);
    };
    img.src = src;
  });
}

export function setCachedImageSize(
  projectId: string,
  nw: number,
  nh: number
): { width: number; height: number } {
  const size = computeWindowSize(nw, nh);
  cache.set(projectId, size);
  return size;
}
