import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backdropBlur: {
        xs: "2px",
        "4xl": "72px",
        "5xl": "90px",
      },
      boxShadow: {
        window: "0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)",
        dock: "0 0 8.71px rgba(0,0,0,0.15)",
        "dock-item": "0 2px 8px rgba(0,0,0,0.18)",
        tooltip: "0 4px 12px rgba(0,0,0,0.15)",
      },
      colors: {
        glass: {
          white: "rgba(255,255,255,0.72)",
          light: "rgba(246,246,246,0.36)",
          border: "rgba(26,26,26,0.46)",
          "border-light": "rgba(255,255,255,0.18)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "cursor-blink": "cursorBlink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
