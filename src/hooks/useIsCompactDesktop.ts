"use client";

import { useState, useEffect } from "react";

/** Viewport širší ako tento limit = „plná“ veľkosť ikon/docku. */
export const COMPACT_DESKTOP_MAX_WIDTH_PX = 1199;

/**
 * true keď `window.innerWidth <= 1199` (t.j. pod „1200px“ breakpointom z dizajnu).
 */
export function useIsCompactDesktop() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${COMPACT_DESKTOP_MAX_WIDTH_PX}px)`);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}
