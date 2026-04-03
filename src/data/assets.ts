// ─────────────────────────────────────────────────────────────────
// Asset Registry — all paths local WebP, served from /public
// ─────────────────────────────────────────────────────────────────

// Wallpaper
export const WALLPAPER = {
  background: "/images/bg.png",
  mobile: "/images/bg-mobile.png",
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

// Gallery projects — multiple images per project folder
export const GALLERY_PROJECTS: Record<string, string[]> = {
  freehold: [
    "/images/projects/Freehold/Digital-Screen-Advertising-Mockup-01.jpg",
    "/images/projects/Freehold/Digital-Screen-Advertising-Mockup-14.jpg",
    "/images/projects/Freehold/Frame 1321325961.png",
    "/images/projects/Freehold/iPhone-16-Pro-Mockup-Dusk-Series-04.jpg",
  ],
  districts: [
    "/images/projects/Districts/Districts-martinmroc.png",
    "/images/projects/Districts/Shot 18.jpg",
    "/images/projects/Districts/Shot 19.png",
    "/images/projects/Districts/Shot 20.png",
    "/images/projects/Districts/Slide 16_9 - 02.png",
    "/images/projects/Districts/Slide 16_9 - 04.png",
    "/images/projects/Districts/Slide 16_9 - 06.png",
    "/images/projects/Districts/intro.gif",
  ],
  piggybank: [
    "/images/projects/PiggyBank/Screen1.png",
    "/images/projects/PiggyBank/Screen2.png",
    "/images/projects/PiggyBank/Screen3.png",
    "/images/projects/PiggyBank/Screen1-1.png",
    "/images/projects/PiggyBank/Screen1-2.png",
    "/images/projects/PiggyBank/Screen2-1.png",
    "/images/projects/PiggyBank/Screen3-1.png",
    "/images/projects/PiggyBank/world.png",
    "/images/projects/PiggyBank/world2.png",
  ],
  silencio: [
    "/images/projects/Silencio/4-iPhone-Mockup2.jpg",
    "/images/projects/Silencio/Iphone.407.jpg",
    "/images/projects/Silencio/MockupE06_Device_DARK_TEXTURED_Lumatte2.jpg",
    "/images/projects/Silencio/MockupE08_Conference_Screen_Lumatte.jpg",
    "/images/projects/Silencio/iPhone-16-Pro-Mockup-Dusk-Series-03.jpg",
    "/images/projects/Silencio/iPhone-16-Pro-mockup-in-hand-with-backlight-v2-front-view2.png",
    "/images/projects/Silencio/iPhone-16-Pro-mockup-sandwiched-between-rubber-balls-front-view2.png",
  ],
  trackee: [
    "/images/projects/Trackee/Frame.jpg",
    "/images/projects/Trackee/Screen01.jpg",
    "/images/projects/Trackee/Frame 91867.png",
    "/images/projects/Trackee/Frame 91868.png",
    "/images/projects/Trackee/Frame 91871.png",
    "/images/projects/Trackee/Frame 91876.jpg",
    "/images/projects/Trackee/Frame 91877.jpg",
    "/images/projects/Trackee/Frame 91882.png",
    "/images/projects/Trackee/Frame 91886.png",
  ],
  wingriders: [
    "/images/projects/WingRiders/screen05.jpg",
    "/images/projects/WingRiders/screen08.jpg",
    "/images/projects/WingRiders/screen11.jpg",
    "/images/projects/WingRiders/screen14.jpg",
    "/images/projects/WingRiders/screen15.jpg",
    "/images/projects/WingRiders/screen16.jpg",
    "/images/projects/WingRiders/screen19.jpg",
  ],
  world: [
    "/images/projects/World/s02_V2 2.png",
  ],
};

// Video — local files
export const VIDEO = {
  play: "/video/Play.mp4",
  poster: "/images/thumbs/play-poster.webp",
} as const;
