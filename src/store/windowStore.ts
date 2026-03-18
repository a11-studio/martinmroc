import { create } from "zustand";
import type { WindowInstance, WindowType } from "@/types";
import { DEFAULT_WINDOW_SIZES } from "@/data/projects";

interface WindowStore {
  windows: WindowInstance[];
  maxZIndex: number;

  openWindow: (config: {
    id: string;
    type: WindowType;
    title: string;
    props?: WindowInstance["props"];
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, position: { x: number; y: number }) => void;
  resizeWindow: (id: string, size: { width: number; height: number }) => void;
  toggleMaximize: (id: string) => void;
}

const getDefaultCenter = (
  size: { width: number; height: number },
  offset: number = 0
) => {
  if (typeof window === "undefined") return { x: 100 + offset, y: 80 + offset };
  return {
    x: Math.max(40, (window.innerWidth - size.width) / 2 + offset),
    y: Math.max(40, (window.innerHeight - size.height) / 2 + offset),
  };
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  maxZIndex: 10,

  openWindow: ({ id, type, title, props, position, size }) => {
    const { windows, maxZIndex } = get();

    // If already open, focus it instead of duplicating
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      set({
        maxZIndex: maxZIndex + 1,
        windows: windows.map((w) =>
          w.id === id
            ? { ...w, zIndex: maxZIndex + 1, isMinimized: false }
            : w
        ),
      });
      return;
    }

    const defaultSize = size ?? DEFAULT_WINDOW_SIZES[type] ?? { width: 640, height: 480 };
    const openCount = windows.length;
    const offset = (openCount % 6) * 22;
    const defaultPos = position ?? getDefaultCenter(defaultSize, offset);
    const newZ = maxZIndex + 1;

    const newWindow: WindowInstance = {
      id,
      type,
      title,
      position: defaultPos,
      size: defaultSize,
      zIndex: newZ,
      isMinimized: false,
      props,
    };

    set({
      windows: [...windows, newWindow],
      maxZIndex: newZ,
    });
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },

  focusWindow: (id) => {
    const { windows, maxZIndex } = get();
    const target = windows.find((w) => w.id === id);
    if (!target || target.zIndex === maxZIndex) return;

    const newZ = maxZIndex + 1;
    set({
      maxZIndex: newZ,
      windows: windows.map((w) =>
        w.id === id ? { ...w, zIndex: newZ } : w
      ),
    });
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
    }));
  },

  restoreWindow: (id) => {
    const { windows, maxZIndex } = get();
    const newZ = maxZIndex + 1;
    set({
      maxZIndex: newZ,
      windows: windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: newZ } : w
      ),
    });
  },

  moveWindow: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    }));
  },

  resizeWindow: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size } : w
      ),
    }));
  },

  toggleMaximize: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;
        const isCurrentlyMaximized = w.isMaximized ?? false;
        if (isCurrentlyMaximized) {
          const restoreSize = w.sizeBeforeMaximize ?? DEFAULT_WINDOW_SIZES[w.type] ?? { width: 640, height: 480 };
          return {
            ...w,
            isMaximized: false,
            sizeBeforeMaximize: undefined,
            size: restoreSize,
            position: getDefaultCenter(restoreSize),
          };
        }
        const vpW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const vpH = typeof window !== "undefined" ? window.innerHeight - 28 : 720;
        return {
          ...w,
          isMaximized: true,
          sizeBeforeMaximize: { width: w.size.width, height: w.size.height },
          size: { width: vpW, height: vpH },
          position: { x: 0, y: 28 },
        };
      }),
    }));
  },
}));
