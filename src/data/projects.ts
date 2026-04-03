import type { DesktopIconData, ProjectData, DockItemData } from "@/types";
import { MAILTO_COLLABORATION_HREF } from "@/lib/mailto";
import { getWhatsAppChatHref } from "@/lib/whatsapp";
import { DOCK_ICONS, ICON_THUMBNAILS } from "./assets";

// ─────────────────────────────────────────────────────────────────
// Project metadata
// ─────────────────────────────────────────────────────────────────

export const PROJECTS: Record<string, ProjectData> = {
  cardinal: {
    id: "cardinal",
    title: "Cardinal",
    description:
      "Brand identity and visual system for a modern financial platform. Focused on trust, clarity, and bold typographic hierarchy.",
    tags: ["Branding", "Identity", "Typography"],
    imageSrc: ICON_THUMBNAILS.cardinal,
    ctaLabel: "View case study",
    ctaHref: "#",
  },
  freehold: {
    id: "freehold",
    title: "Freehold",
    description:
      "End-to-end product design for a real estate discovery platform. Interface architecture, design system, and interaction patterns.",
    tags: ["Product", "Interface", "Design System"],
    imageSrc: ICON_THUMBNAILS.freehold,
    ctaLabel: "View case study",
    ctaHref: "#",
  },
  thirdweb: {
    id: "thirdweb",
    title: "Thirdweb",
    description:
      "Dashboard and developer tooling design for a web3 infrastructure platform. Simplified complex blockchain workflows into clear UI.",
    tags: ["Web3", "Product", "Developer Tools"],
    imageSrc: ICON_THUMBNAILS.thirdweb,
    ctaLabel: "View case study",
    ctaHref: "#",
  },
  realitiez: {
    id: "realitiez",
    title: "Realitiez",
    description:
      "Motion branding and visual identity for an immersive media studio. Art direction, logo animation, and campaign assets.",
    tags: ["Motion", "Branding", "Art Direction"],
    imageSrc: ICON_THUMBNAILS.realitiez,
    ctaLabel: "View case study",
    ctaHref: "#",
  },
};

// ─────────────────────────────────────────────────────────────────
// Desktop icon registry
// Positions are percentage of viewport width/height (0–100)
// Derived from Figma 1920×1249 canvas
// ─────────────────────────────────────────────────────────────────

export const DESKTOP_ICONS: DesktopIconData[] = [
  {
    id: "cardinal",
    label: "Cardinal.jpg",
    type: "project",
    thumbnailSrc: ICON_THUMBNAILS.cardinal,
    defaultPosition: { x: 10.7, y: 40.4 },
    props: { projectId: "cardinal" },
  },
  {
    id: "me",
    label: "Me.jpg",
    type: "me",
    thumbnailSrc: ICON_THUMBNAILS.me,
    defaultPosition: { x: 40.3, y: 35.7 },
  },
  {
    id: "freehold",
    label: "Freehold.jpg",
    type: "project",
    thumbnailSrc: ICON_THUMBNAILS.freehold,
    defaultPosition: { x: 70.4, y: 28.4 },
    props: { projectId: "freehold" },
  },
  {
    id: "clickDmg",
    label: "Click.dmg",
    type: "project",
    thumbnailSrc: ICON_THUMBNAILS.clickDmg,
    defaultPosition: { x: 63.6, y: 42.3 },
    props: { projectId: "clickDmg" },
  },
  {
    id: "thirdweb",
    label: "Thirdweb.jpg",
    type: "project",
    thumbnailSrc: ICON_THUMBNAILS.thirdweb,
    defaultPosition: { x: 82.4, y: 56.3 },
    props: { projectId: "thirdweb" },
  },
  {
    id: "realitiez",
    label: "Realitiez.jpg",
    type: "project",
    thumbnailSrc: ICON_THUMBNAILS.realitiez,
    defaultPosition: { x: 21.6, y: 69.9 },
    props: { projectId: "realitiez" },
  },
  {
    id: "projects",
    label: "Projects",
    type: "finder",
    thumbnailSrc: ICON_THUMBNAILS.folder,
    defaultPosition: { x: 48.5, y: 47.2 },
    props: { finderInitialFolder: "all" },
  },
  {
    id: "about",
    label: "About",
    type: "about",
    thumbnailSrc: ICON_THUMBNAILS.about,
    defaultPosition: { x: 36.2, y: 59.1 },
  },
  {
    id: "play",
    label: "Play.mp4",
    type: "video",
    thumbnailSrc: ICON_THUMBNAILS.play,
    defaultPosition: { x: 54.3, y: 59.4 },
  },
];

// Default window sizes per type
export const DEFAULT_WINDOW_SIZES: Record<
  string,
  { width: number; height: number }
> = {
  project: { width: 760, height: 540 },
  me: { width: 480, height: 560 },
  image: { width: 480, height: 360 },
  about: { width: 560, height: 480 },
  finder: { width: 760, height: 500 },
  video: { width: 340, height: 640 },
  spotify: { width: 440, height: 460 },
  gallery: { width: 760, height: 580 },
};

// ─────────────────────────────────────────────────────────────────
// Dock items
// ─────────────────────────────────────────────────────────────────

export const DOCK_ITEMS: DockItemData[] = [
  {
    id: "photoshop",
    label: "Photoshop",
    render: "single",
    iconSrc: DOCK_ICONS.photoshop,
  },
  {
    id: "after-effects",
    label: "After Effects",
    render: "single",
    iconSrc: DOCK_ICONS.afterEffects,
  },
  {
    id: "figma",
    label: "Figma",
    render: "single",
    iconSrc: DOCK_ICONS.figma,
  },
  {
    id: "cursor",
    label: "Cursor",
    render: "single",
    iconSrc: DOCK_ICONS.cursor,
  },
  {
    id: "mail",
    label: "Mail",
    render: "single",
    iconSrc: DOCK_ICONS.mail,
    onClick: () => {
      window.location.href = MAILTO_COLLABORATION_HREF;
    },
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    render: "single",
    iconSrc: DOCK_ICONS.whatsapp,
    onClick: () => {
      window.open(getWhatsAppChatHref(), "_blank", "noopener,noreferrer");
    },
  },
  {
    id: "spotify",
    label: "Spotify",
    render: "single",
    iconSrc: DOCK_ICONS.spotify,
  },
];

export const DOCK_TRASH: DockItemData = {
  id: "trash",
  label: "Trash",
  render: "single",
  iconSrc: DOCK_ICONS.trash,
};
