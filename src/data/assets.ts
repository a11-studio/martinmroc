// ─────────────────────────────────────────────────────────────────
// Asset Registry
// ─────────────────────────────────────────────────────────────────
// DEVELOPMENT: Figma MCP URLs (fetched 2026-03-12, expire in 7 days)
// PRODUCTION:  Replace values with local paths ("/images/...", etc.)
//              Only this file needs to change — no component edits.
// ─────────────────────────────────────────────────────────────────

// Wallpaper — local image, no filter
export const WALLPAPER = {
  background: "/images/wallpaper.png",
} as const;

// Desktop icon thumbnails (small previews on the desktop canvas)
export const ICON_THUMBNAILS = {
  me: "https://www.figma.com/api/mcp/asset/107d1ae4-0bfc-486a-99ce-2410f11faa61",
  freehold:
    "https://www.figma.com/api/mcp/asset/471ced83-4dc9-4347-a4d8-5468c77f3066",
  cardinal:
    "https://www.figma.com/api/mcp/asset/a057da3f-b894-456c-8791-da490ff4545d",
  thirdweb:
    "https://www.figma.com/api/mcp/asset/8e86f6e5-6349-4ac7-9052-560758c08d99",
  realitiez:
    "https://www.figma.com/api/mcp/asset/847c626f-3c0e-490d-a6ef-2872d941a3c5",
  about:
    "https://www.figma.com/api/mcp/asset/f91437bf-d4fd-4f3b-a3a1-b2b5299d27e8",
  play: "https://www.figma.com/api/mcp/asset/ac8061dd-e28b-43e4-8073-78815942fd6b",
  folder:
    "https://www.figma.com/api/mcp/asset/8e5cce47-44e1-42b5-917b-7a79a3f5870c",
} as const;

// Full-resolution project images (used inside open windows)
export const PROJECT_IMAGES = {
  me: "https://www.figma.com/api/mcp/asset/5ebac137-f877-45df-a3fc-b23417e11bf0",
  freehold:
    "https://www.figma.com/api/mcp/asset/471ced83-4dc9-4347-a4d8-5468c77f3066",
  cardinal:
    "https://www.figma.com/api/mcp/asset/a057da3f-b894-456c-8791-da490ff4545d",
  thirdweb:
    "https://www.figma.com/api/mcp/asset/8e86f6e5-6349-4ac7-9052-560758c08d99",
  realitiez:
    "https://www.figma.com/api/mcp/asset/847c626f-3c0e-490d-a6ef-2872d941a3c5",
} as const;

// Dock icons — uniform PNGs from /public/images/dock/
export const DOCK_ICONS = {
  photoshop: "/images/dock/PS.png",
  afterEffects: "/images/dock/AE.png",
  figma: "/images/dock/Figma.png",
  cursor: "/images/dock/Cursor.png",
  mail: "/images/dock/Mail.png",
  whatsapp: "/images/dock/WA.png",
  spotify: "/images/dock/Spotify.png",
  trash: "/images/dock/Trash.png",
} as const;

// Video — Figma doesn't host video; /public is used directly
export const VIDEO = {
  play: "/video/Play.mp4",
  poster:
    "https://www.figma.com/api/mcp/asset/ac8061dd-e28b-43e4-8073-78815942fd6b",
} as const;
