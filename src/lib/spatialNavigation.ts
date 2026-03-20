/**
 * Pick the next item when pressing Arrow keys — same logic as desktop icon grid.
 * Items must provide screen-space center coordinates (cx, cy).
 */

export type ArrowDirection = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";

export function findNextSpatialId<T extends string>(
  direction: ArrowDirection,
  items: { id: T; cx: number; cy: number }[],
  currentId: T | null,
  /** Row bucket size for “first item” when nothing selected (desktop uses ~120) */
  rowBucket = 100
): T | null {
  if (items.length === 0) return null;

  let current = currentId ? items.find((i) => i.id === currentId) ?? null : null;

  if (!current) {
    const sorted = [...items].sort((a, b) => {
      const rowA = Math.round(a.cy / rowBucket);
      const rowB = Math.round(b.cy / rowBucket);
      if (rowA !== rowB) return rowA - rowB;
      return a.cx - b.cx;
    });
    return sorted[0]?.id ?? null;
  }

  const candidates = items.filter((i) => i.id !== current.id);

  if (direction === "ArrowRight") {
    const toRight = candidates.filter((i) => i.cx > current.cx);
    if (toRight.length === 0) return null;
    return toRight.sort((a, b) => {
      const dyA = Math.abs(a.cy - current.cy);
      const dyB = Math.abs(b.cy - current.cy);
      if (dyA !== dyB) return dyA - dyB;
      return a.cx - b.cx;
    })[0]?.id ?? null;
  }
  if (direction === "ArrowLeft") {
    const toLeft = candidates.filter((i) => i.cx < current.cx);
    if (toLeft.length === 0) return null;
    return toLeft.sort((a, b) => {
      const dyA = Math.abs(a.cy - current.cy);
      const dyB = Math.abs(b.cy - current.cy);
      if (dyA !== dyB) return dyA - dyB;
      return b.cx - a.cx;
    })[0]?.id ?? null;
  }
  if (direction === "ArrowDown") {
    const below = candidates.filter((i) => i.cy > current.cy);
    if (below.length === 0) return null;
    return below.sort((a, b) => {
      const dxA = Math.abs(a.cx - current.cx);
      const dxB = Math.abs(b.cx - current.cx);
      if (dxA !== dxB) return dxA - dxB;
      return a.cy - b.cy;
    })[0]?.id ?? null;
  }
  if (direction === "ArrowUp") {
    const above = candidates.filter((i) => i.cy < current.cy);
    if (above.length === 0) return null;
    return above.sort((a, b) => {
      const dxA = Math.abs(a.cx - current.cx);
      const dxB = Math.abs(b.cx - current.cx);
      if (dxA !== dxB) return dxA - dxB;
      return b.cy - a.cy;
    })[0]?.id ?? null;
  }
  return null;
}
