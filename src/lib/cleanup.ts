/**
 * Icon cleanup / grid layout utilities.
 *
 * The cleanup algorithm:
 * 1. Takes current icon positions from desktopStore
 * 2. Sorts icons left-to-right, top-to-bottom
 * 3. Assigns each a cell in a 4-column grid
 * 4. Returns a map of { iconId → new { x, y } }
 *
 * Callers animate icons to these positions using Framer Motion's
 * `animate()` imperative API with a spring transition.
 */

type Position = { x: number; y: number };

interface CleanupConfig {
  cols?: number;
  cellW?: number;
  cellH?: number;
  startX?: number;
  startY?: number;
}

/**
 * Compute tidy grid positions for a list of icon IDs.
 * Icons are placed in row-major order (left-to-right, top-to-bottom).
 */
export function computeCleanupGrid(
  ids: string[],
  config: CleanupConfig = {}
): Record<string, Position> {
  const {
    cols = 4,
    cellW = 100,
    cellH = 120,
    startX = 48,
    startY = 80,
  } = config;

  return Object.fromEntries(
    ids.map((id, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return [id, { x: startX + col * cellW, y: startY + row * cellH }];
    })
  );
}

/**
 * Sort icon IDs by their current position — left-to-right, top-to-bottom.
 * Uses a grid-row heuristic to group icons on the same visual row.
 */
export function sortByPosition(
  ids: string[],
  positions: Record<string, Position>
): string[] {
  return [...ids].sort((a, b) => {
    const pa = positions[a] ?? { x: 0, y: 0 };
    const pb = positions[b] ?? { x: 0, y: 0 };
    const ROW_HEIGHT = 120;
    const rowA = Math.round(pa.y / ROW_HEIGHT);
    const rowB = Math.round(pb.y / ROW_HEIGHT);
    if (rowA !== rowB) return rowA - rowB;
    return pa.x - pb.x;
  });
}

/**
 * Framer Motion spring transition config for icon cleanup animation.
 */
export const CLEANUP_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 28,
  mass: 1,
};
