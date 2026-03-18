// ─────────────────────────────────────────────────────────────────
// Window system
// ─────────────────────────────────────────────────────────────────

export type WindowType = "project" | "about" | "finder" | "video" | "me" | "image";

export interface WindowInstance {
  id: string;
  type: WindowType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized?: boolean;
  /** Size before maximizing — restored when un-maximizing */
  sizeBeforeMaximize?: { width: number; height: number };
  props?: {
    projectId?: string;
    src?: string;
  };
}

// ─────────────────────────────────────────────────────────────────
// Desktop icons
// ─────────────────────────────────────────────────────────────────

export interface DesktopIconData {
  id: string;
  label: string;
  type: WindowType;
  /** Small thumbnail shown on the desktop */
  thumbnailSrc: string;
  /** Default position as percentage of viewport (0–100) */
  defaultPosition: { x: number; y: number };
  props?: WindowInstance["props"];
}

// ─────────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────────

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageSrc: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// ─────────────────────────────────────────────────────────────────
// Context menu
// ─────────────────────────────────────────────────────────────────

export interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
}

// ─────────────────────────────────────────────────────────────────
// Dock
// ─────────────────────────────────────────────────────────────────

export interface DockItemData {
  id: string;
  label: string;
  /** Renders composite layers (e.g. Photoshop bg + Ps text) */
  render: "single" | "composite" | "cursor";
  iconSrc?: string;
  compositeSrc?: { bg: string; text: string };
  onClick?: () => void;
}
