import { create } from "zustand";
import type { ContextMenuState } from "@/types";
import { DESKTOP_ICONS } from "@/data/projects";

type Position = { x: number; y: number };

interface DesktopStore {
  iconPositions: Record<string, Position>;
  selectedIconId: string | null;
  contextMenu: ContextMenuState;

  setIconPosition: (id: string, pos: Position) => void;
  selectIcon: (id: string | null) => void;
  openContextMenu: (pos: Position) => void;
  closeContextMenu: () => void;
  resetIconPositions: () => void;
  sortIconsByName: () => void;
  getCleanupPositions: () => Record<string, Position>;
}

/** Convert default % positions to absolute px on first access */
const buildDefaultPositions = (): Record<string, Position> => {
  if (typeof window === "undefined") {
    return Object.fromEntries(
      DESKTOP_ICONS.map((icon) => [icon.id, { x: 0, y: 0 }])
    );
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Object.fromEntries(
    DESKTOP_ICONS.map((icon) => [
      icon.id,
      {
        x: (icon.defaultPosition.x / 100) * vw,
        y: (icon.defaultPosition.y / 100) * vh,
      },
    ])
  );
};

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  // Initialise lazily — components will hydrate this on mount
  iconPositions: {},
  selectedIconId: null,
  contextMenu: { visible: false, position: { x: 0, y: 0 } },

  setIconPosition: (id, pos) => {
    set((state) => ({
      iconPositions: { ...state.iconPositions, [id]: pos },
    }));
  },

  selectIcon: (id) => {
    set({ selectedIconId: id });
  },

  openContextMenu: (pos) => {
    // Clamp so menu doesn't overflow viewport
    const MENU_W = 200;
    const MENU_H = 160;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
    set({
      contextMenu: {
        visible: true,
        position: {
          x: Math.min(pos.x, vw - MENU_W - 8),
          y: Math.min(pos.y, vh - MENU_H - 8),
        },
      },
    });
  },

  closeContextMenu: () => {
    set((state) => ({
      contextMenu: { ...state.contextMenu, visible: false },
    }));
  },

  resetIconPositions: () => {
    set({ iconPositions: buildDefaultPositions() });
  },

  sortIconsByName: () => {
    const sorted = [...DESKTOP_ICONS].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    const positions = buildCleanupGrid(sorted.map((i) => i.id));
    set({ iconPositions: positions });
  },

  getCleanupPositions: () => {
    const { iconPositions } = get();
    const ids = Object.keys(iconPositions);
    // Sort by current x position, then y
    const sorted = ids.sort((a, b) => {
      const pa = iconPositions[a];
      const pb = iconPositions[b];
      const rowA = Math.round(pa.y / 120);
      const rowB = Math.round(pb.y / 120);
      if (rowA !== rowB) return rowA - rowB;
      return pa.x - pb.x;
    });
    return buildCleanupGrid(sorted);
  },
}));

/**
 * Produces a tidy 4-column grid starting below the menu bar.
 * Cell size: 100×120px, starting at x=48, y=80
 */
function buildCleanupGrid(ids: string[]): Record<string, Position> {
  const COLS = 4;
  const CELL_W = 100;
  const CELL_H = 120;
  const START_X = 48;
  const START_Y = 80;

  return Object.fromEntries(
    ids.map((id, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return [
        id,
        {
          x: START_X + col * CELL_W,
          y: START_Y + row * CELL_H,
        },
      ];
    })
  );
}
