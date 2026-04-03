"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  useGlitchStore,
  GLITCH_TIMELINE,
  GLITCH_ICON_FAILURE_ORDER,
  getIconCorruptStartMs,
  getIconCorruptDurationMs,
} from "@/store/glitchStore";

const FLASH_LINES = [
  "buffer: parity fault // non-fatal",
  "render pipeline: desync detected",
  "⚠ stack walk truncated @ 0x00",
  "compositor: dropped frame burst",
  "mem guard: soft fail (simulated)",
  "window_server: backing store invalidated",
  "dockd: signal lost (mock)",
];

function FlashLine({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 720);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="pointer-events-none absolute left-[8%] max-w-[min(92vw,420px)] rounded border border-emerald-500/40 bg-black/85 px-3 py-2 font-mono text-[11px] leading-snug text-emerald-400/95 shadow-lg shadow-emerald-900/30"
      initial={{ opacity: 0, x: -8, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 6, transition: { duration: 0.2 } }}
      style={{ top: `${12 + Math.random() * 55}%` }}
    >
      <span className="text-emerald-600/80">$ </span>
      {text}
    </motion.div>
  );
}

export default function GlitchOverlay() {
  const active = useGlitchStore((s) => s.active);
  const crashed = useGlitchStore((s) => s.crashed);
  const overlayStage = useGlitchStore((s) => s.overlayStage);
  const setOverlayStage = useGlitchStore((s) => s.setOverlayStage);
  const setCorruptingIcon = useGlitchStore((s) => s.setCorruptingIcon);
  const markIconDead = useGlitchStore((s) => s.markIconDead);
  const setDockPhase = useGlitchStore((s) => s.setDockPhase);
  const setCrashed = useGlitchStore((s) => s.setCrashed);
  const reboot = useGlitchStore((s) => s.reboot);
  const prefersReduced = useReducedMotion();

  const [flashes, setFlashes] = useState<{ id: number; text: string }[]>([]);
  const flashId = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((delayMs: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, delayMs));
  }, []);

  // Master timeline
  useEffect(() => {
    if (!active) {
      clearTimers();
      document.documentElement.removeAttribute("data-glitch");
      return;
    }

    document.documentElement.setAttribute("data-glitch", "infect");

    if (prefersReduced) {
      schedule(0, () => setOverlayStage(2));
      schedule(400, () => {
        GLITCH_ICON_FAILURE_ORDER.forEach((id) => markIconDead(id));
        setCorruptingIcon(null);
      });
      schedule(420, () => setDockPhase("failing"));
      schedule(900, () => {
        setDockPhase("dead");
        setOverlayStage(4);
        setCrashed(true);
        document.documentElement.setAttribute("data-glitch", "crashed");
      });
      return () => {
        clearTimers();
        document.documentElement.removeAttribute("data-glitch");
      };
    }

    const T = GLITCH_TIMELINE;
    const order = GLITCH_ICON_FAILURE_ORDER;
    const n = order.length;

    // Stage 1: infection ends → progressive failure
    schedule(T.infectMs, () => {
      setOverlayStage(1);
      document.documentElement.setAttribute("data-glitch", "spread");
    });

    // Escalation milestones (overlay + windows)
    schedule(T.escalateStage2Ms, () => {
      setOverlayStage(2);
      document.documentElement.setAttribute("data-glitch", "escalate");
    });
    schedule(T.escalateStage3Ms, () => {
      setOverlayStage(3);
      document.documentElement.setAttribute("data-glitch", "collapse");
    });

    // Per-icon: first ~2s solo, then tight burst
    order.forEach((id, i) => {
      const corruptAt = getIconCorruptStartMs(i);
      const deadAt = corruptAt + getIconCorruptDurationMs(i);
      schedule(corruptAt, () => setCorruptingIcon(id));
      schedule(deadAt, () => {
        markIconDead(id);
        setCorruptingIcon(null);
      });
    });

    const lastDead = getIconCorruptStartMs(n - 1) + getIconCorruptDurationMs(n - 1);
    const dockStart = lastDead + T.beforeDockMs;

    schedule(dockStart, () => setDockPhase("failing"));

    schedule(dockStart + T.dockDeathMs, () => {
      setDockPhase("dead");
      setOverlayStage(4);
      setCrashed(true);
      document.documentElement.setAttribute("data-glitch", "crashed");
    });

    return () => {
      clearTimers();
      document.documentElement.removeAttribute("data-glitch");
    };
  }, [
    active,
    prefersReduced,
    clearTimers,
    schedule,
    setOverlayStage,
    setCorruptingIcon,
    markIconDead,
    setDockPhase,
    setCrashed,
  ]);

  // Noise canvas
  useEffect(() => {
    if (!active || crashed || prefersReduced) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const w = 112;
    const h = 112;
    canvas.width = w;
    canvas.height = h;
    const scale = Math.max(
      (typeof window !== "undefined" ? window.innerWidth : 1200) / w,
      (typeof window !== "undefined" ? window.innerHeight : 800) / h
    );
    canvas.style.transform = `scale(${scale * 1.02}) translateZ(0)`;

    let last = 0;
    const tick = (t: number) => {
      if (t - last < (overlayStage >= 3 ? 110 : 140)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      last = t;
      const d = ctx.createImageData(w, h);
      const alphaBase = overlayStage >= 3 ? 32 : overlayStage >= 2 ? 26 : overlayStage >= 1 ? 18 : 12;
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = v;
        d.data[i + 1] = v;
        d.data[i + 2] = v;
        d.data[i + 3] = alphaBase + Math.random() * 28;
      }
      ctx.putImageData(d, 0, 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, crashed, overlayStage, prefersReduced]);

  // Terminal flashes during spread / escalate
  useEffect(() => {
    if (!active || overlayStage < 1 || crashed || prefersReduced) return;

    const spawn = () => {
      const text = FLASH_LINES[Math.floor(Math.random() * FLASH_LINES.length)]!;
      const id = ++flashId.current;
      setFlashes((f) => [...f, { id, text }]);
    };

    const t1 = window.setTimeout(spawn, 280);
    const t2 = window.setTimeout(spawn, 1100);
    const t3 = window.setTimeout(spawn, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, overlayStage, crashed, prefersReduced]);

  const removeFlash = (id: number) => {
    setFlashes((f) => f.filter((x) => x.id !== id));
  };

  /** No sudden full-screen flashes — smooth ramp only (photosensitive safety). */
  const blackoutOpacity =
    crashed ? 0.94
    : overlayStage >= 4 ? 0.84
    : overlayStage >= 3 ? 0.52
    : overlayStage >= 2 ? 0.28
    : overlayStage >= 1 ? 0.14
    : 0.06;

  const handleReboot = () => {
    reboot();
    setFlashes([]);
  };

  const jitterStrong = overlayStage >= 3 && !crashed;
  const rgbStrong = overlayStage >= 2;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="glitch-root"
          className="fixed inset-0 overflow-hidden"
          style={{ zIndex: 2147483000, pointerEvents: "auto" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
          role="presentation"
          aria-hidden={!crashed}
        >
          {/* Oversized layer so sub-pixel jitter never exposes viewport edges */}
          <motion.div
            className="absolute -inset-[18px]"
            animate={
              prefersReduced || crashed
                ? { x: 0, y: 0, skewX: 0 }
                : {
                    x: jitterStrong
                      ? [0, -2, 2, -1.5, 1.5, 0]
                      : [0, -1.5, 1.5, -1, 1, 0],
                    y: jitterStrong
                      ? [0, 1.5, -2, 1, -1.5, 0]
                      : [0, 1, -1.5, 0.8, -1, 0],
                    skewX: jitterStrong ? [0, -0.25, 0.2, 0] : [0, -0.15, 0.12, 0],
                  }
            }
            transition={
              prefersReduced || crashed
                ? { duration: 0.2 }
                : {
                    duration: jitterStrong ? 0.42 : overlayStage >= 2 ? 0.55 : 0.7,
                    repeat: crashed ? 0 : Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            {!prefersReduced && !crashed && (
              <>
                <motion.div
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    background: "rgba(255,0,0,0.06)",
                    transform: "translateX(-3px)",
                  }}
                  animate={{
                    opacity: rgbStrong ? [0.14, 0.22, 0.17] : [0.08, 0.14, 0.1],
                  }}
                  transition={{
                    duration: rgbStrong ? 0.65 : 0.85,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    background: "rgba(0,255,255,0.05)",
                    transform: "translateX(3px)",
                  }}
                  animate={{
                    opacity: rgbStrong ? [0.12, 0.2, 0.15] : [0.07, 0.12, 0.09],
                  }}
                  transition={{
                    duration: rgbStrong ? 0.72 : 0.9,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                />
              </>
            )}

            <div
              className="pointer-events-none absolute inset-0 mix-blend-multiply"
              style={{
                opacity: overlayStage >= 3 ? 0.34 : overlayStage >= 1 ? 0.24 : 0.12,
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
                animation: prefersReduced ? "none" : "glitch-scan-drift 3.4s linear infinite",
              }}
            />

            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute left-0 top-0 mix-blend-overlay"
              style={{
                width: 112,
                height: 112,
                opacity: overlayStage >= 2 ? 0.3 : 0.18,
                imageRendering: "pixelated",
                transformOrigin: "top left",
              }}
            />

            {!prefersReduced && overlayStage >= 2 && !crashed && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-[6%] right-[6%] bg-black/18"
                    style={{ top: `${14 + i * 15}%`, height: "2.2%" }}
                    animate={{ x: ["-1.2%", "1.2%", "-0.8%", "0%"] }}
                    transition={{
                      duration: 0.85 + i * 0.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}

            <motion.div
              className="absolute inset-0 bg-black"
              initial={false}
              animate={{ opacity: blackoutOpacity }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />

            {!prefersReduced && overlayStage >= 2 && !crashed && (
              <motion.div
                className="pointer-events-none absolute inset-[2%]"
                style={{
                  boxShadow: "inset 0 0 80px rgba(0,0,0,0.28)",
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 38%, 97% 44%, 100% 52%, 100% 100%, 0 100%, 0 30%, 4% 24%, 0 18%)",
                }}
                animate={{ opacity: [0.22, 0.38, 0.26] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>

          <AnimatePresence>
            {flashes.map((f) => (
              <FlashLine key={f.id} text={f.text} onDone={() => removeFlash(f.id)} />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {crashed && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.55 }}
              >
                <p className="text-center font-mono text-sm text-neutral-500">
                  System restored from safe state.
                  <br />
                  <span className="text-neutral-400">(Easter egg — nothing was harmed.)</span>
                </p>
                <motion.button
                  type="button"
                  className="rounded-xl border border-white/20 bg-white/10 px-8 py-3 font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/18 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/50"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 360, damping: 26, delay: 0.12 }}
                  onClick={handleReboot}
                >
                  Reboot
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
