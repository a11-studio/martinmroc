import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format a Date as HH:MM with optional seconds */
export function formatTime(date: Date, showSeconds = false): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  if (showSeconds) {
    const s = date.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  return `${h}:${m}`;
}

/** Format a Date as "Thu Mar 12" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * SSR-safe mobile detection.
 * Returns false during SSR; real value after hydration.
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/** Generate a stable window id from icon id */
export function windowId(iconId: string): string {
  return `window-${iconId}`;
}
