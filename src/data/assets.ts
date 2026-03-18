// ─────────────────────────────────────────────────────────────────
// Asset Registry — all paths local WebP, served from /public
// ─────────────────────────────────────────────────────────────────

// Wallpaper — 1920 px WebP
export const WALLPAPER = {
  background: "/images/bg.png",
} as const;

// Desktop icon thumbnails (≤200 px WebP)
export const ICON_THUMBNAILS = {
  me:        "/images/thumbs/me.webp",
  freehold:  "/images/thumbs/freehold.webp",
  cardinal:  "/images/thumbs/cardinal.webp",
  thirdweb:  "/images/thumbs/thirdweb.webp",
  realitiez: "/images/thumbs/realitiez.webp",
  about:     "/images/thumbs/about.webp",
  play:      "/images/thumbs/play.webp",
  folder:    "/images/thumbs/folder.svg",
} as const;

// Full-resolution project images — WebP quality 93 (~200KB sweet spot)
export const PROJECT_IMAGES = {
  me:        "/images/projects/me.webp",
  freehold:  "/images/projects/freehold.webp",
  cardinal:  "/images/projects/cardinal.webp",
  thirdweb:  "/images/projects/thirdweb.webp",
  realitiez: "/images/projects/realitiez.webp",
} as const;

// Dock icons — 128 px WebP from /public/images/dock/
export const DOCK_ICONS = {
  photoshop: "/images/dock/PS.webp",
  afterEffects: "/images/dock/AE.webp",
  figma: "/images/dock/Figma.webp",
  cursor: "/images/dock/Cursor.webp",
  mail: "/images/dock/Mail.webp",
  whatsapp: "/images/dock/WA.webp",
  spotify: "/images/dock/Spotify.webp",
  trash: "/images/dock/Trash.webp",
} as const;

// Video — local files
export const VIDEO = {
  play: "/video/Play.mp4",
  poster: "/images/thumbs/play-poster.webp",
} as const;
