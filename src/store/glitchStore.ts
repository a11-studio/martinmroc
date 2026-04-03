import { create } from "zustand";

/**
 * Desktop icons fail in this order (patient zero = Click.dmg).
 * IDs must match `DESKTOP_ICONS` in `data/projects.ts`.
 */
export const GLITCH_ICON_FAILURE_ORDER = [
  "clickDmg",
  "cardinal",
  "freehold",
  "thirdweb",
  "realitiez",
  "me",
  "projects",
  "about",
  "play",
] as const;

/** Overlay intensity / narrative phase (drives visuals + window instability). */
export type GlitchOverlayStage = 0 | 1 | 2 | 3 | 4;

/**
 * Cinematic timing — tweak here.
 * Infection → first icon slow fall (~2s) → burst cascade → dock → Reboot.
 */
export const GLITCH_TIMELINE = {
  /** Overlay stage 1 — “spread” (still no icon deaths) */
  infectMs: 650,
  /** When windows / overlay ramp to heavier glitch */
  escalateStage2Ms: 1250,
  escalateStage3Ms: 2100,
  /** First desktop icon marked dead at this time (ms from sequence start) */
  firstIconDeadMs: 2000,
  /** Longer corrupt phase for the first icon only */
  iconCorruptFirstMs: 520,
  /** After first icon dies, gap before burst wave */
  afterFirstDeadGapMs: 90,
  /** Corrupt-start stagger between 2nd, 3rd, … icons (tight cascade) */
  iconBurstStaggerMs: 120,
  /** Shorter corrupt-then-die for icons after the first */
  iconCorruptBurstMs: 220,
  /** After last icon dies, pause before dock fails */
  beforeDockMs: 300,
  /** Dock slide / fade duration */
  dockDeathMs: 950,
  /** Hold near-black before Reboot UI */
  afterDockDeadMs: 500,
} as const;

export function getIconCorruptStartMs(index: number): number {
  const T = GLITCH_TIMELINE;
  if (index === 0) return T.firstIconDeadMs - T.iconCorruptFirstMs;
  return (
    T.firstIconDeadMs + T.afterFirstDeadGapMs + (index - 1) * T.iconBurstStaggerMs
  );
}

export function getIconCorruptDurationMs(index: number): number {
  return index === 0
    ? GLITCH_TIMELINE.iconCorruptFirstMs
    : GLITCH_TIMELINE.iconCorruptBurstMs;
}

export function getIconDeadAtMs(index: number): number {
  return getIconCorruptStartMs(index) + getIconCorruptDurationMs(index);
}

export function computeGlitchSequenceEndMs(): number {
  const n = GLITCH_ICON_FAILURE_ORDER.length;
  const lastDead = getIconDeadAtMs(n - 1);
  return (
    lastDead +
    GLITCH_TIMELINE.beforeDockMs +
    GLITCH_TIMELINE.dockDeathMs +
    GLITCH_TIMELINE.afterDockDeadMs
  );
}

export const GLITCH_TOTAL_MS = computeGlitchSequenceEndMs();

interface GlitchStore {
  active: boolean;
  crashed: boolean;
  overlayStage: GlitchOverlayStage;
  deadIcons: Record<string, boolean>;
  corruptingIconId: string | null;
  dockPhase: "alive" | "failing" | "dead";

  resetSequenceState: () => void;
  start: () => void;
  setOverlayStage: (s: GlitchOverlayStage) => void;
  setCorruptingIcon: (id: string | null) => void;
  markIconDead: (id: string) => void;
  setDockPhase: (p: "alive" | "failing" | "dead") => void;
  setCrashed: (v: boolean) => void;
  reboot: () => void;
}

const emptyDead: Record<string, boolean> = {};

export const useGlitchStore = create<GlitchStore>((set, get) => ({
  active: false,
  crashed: false,
  overlayStage: 0,
  deadIcons: emptyDead,
  corruptingIconId: null,
  dockPhase: "alive",

  resetSequenceState: () =>
    set({
      crashed: false,
      overlayStage: 0,
      deadIcons: {},
      corruptingIconId: null,
      dockPhase: "alive",
    }),

  start: () => {
    if (get().active) return;
    get().resetSequenceState();
    set({ active: true });
  },

  setOverlayStage: (overlayStage) => set({ overlayStage }),

  setCorruptingIcon: (id) => set({ corruptingIconId: id }),

  markIconDead: (id) =>
    set((s) => ({
      deadIcons: { ...s.deadIcons, [id]: true },
      corruptingIconId: s.corruptingIconId === id ? null : s.corruptingIconId,
    })),

  setDockPhase: (dockPhase) => set({ dockPhase }),

  setCrashed: (crashed) => set({ crashed }),

  reboot: () => {
    document.documentElement.removeAttribute("data-glitch");
    set({
      active: false,
      crashed: false,
      overlayStage: 0,
      deadIcons: {},
      corruptingIconId: null,
      dockPhase: "alive",
    });
  },
}));
