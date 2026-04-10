"use client";

/**
 * Click.dmg “signal death” overlay.
 * Visual language inspired by Yoichi Kobayashi’s GLSL glitch study (RGB split, blocky breakup);
 * we stay DOM/canvas-based here — full shader pass would need a scene capture + WebGL stack.
 * @see https://ykob.github.io/sketch-threejs/sketch/glitch.html
 * @see https://codepen.io/ykob/pen/GmEzoQ
 *
 * Crash end screen layout: Figma Testing — End Screen
 * https://www.figma.com/design/M00pv4FlMaoNByvuKdpADU/Testing?node-id=510-182
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  useGlitchStore,
  GLITCH_TIMELINE,
  GLITCH_ICON_FAILURE_ORDER,
  getIconCorruptStartMs,
  getIconCorruptDurationMs,
} from "@/store/glitchStore";

/** Match boot wordmark asset */
const CRASH_TITLE_SRC = "/images/Martin%20OS.svg";

/**
 * Reveal end screen when CRT beam finishes expanding (matches `tvBeam` transition duration 0.2s).
 */
const CRASH_REVEAL_UI_MS = 200;

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
    const t = window.setTimeout(onDone, 520);
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
  /** CRT-style collapse: bright horizontal beam expands, then cuts */
  const [tvBeam, setTvBeam] = useState(false);
  /** One sharp full-frame flash (single hit, not strobing) */
  const [tvFlash, setTvFlash] = useState(false);
  /** After crash: same collapse stack as stage 3, then Figma end screen */
  const [crashRevealUi, setCrashRevealUi] = useState(false);
  const inEndCrashWhite =
    crashed && !crashRevealUi && !prefersReduced;
  /** Mid-sequence collapse OR final hand-off — identical visuals */
  const collapseGlitchActive =
    (!crashed && overlayStage >= 3) || inEndCrashWhite;
  const presentationFrozen =
    prefersReduced || (crashed && crashRevealUi);
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

  useEffect(() => {
    if (!active || !crashed) {
      setCrashRevealUi(false);
      return;
    }
    if (prefersReduced) {
      setCrashRevealUi(true);
      return;
    }
    setCrashRevealUi(false);
    const id = window.setTimeout(
      () => setCrashRevealUi(true),
      CRASH_REVEAL_UI_MS
    );
    return () => window.clearTimeout(id);
  }, [active, crashed, prefersReduced]);

  /** CRT beam expand only — end UI opens when beam hits full height (CRASH_REVEAL_UI_MS) */
  useEffect(() => {
    if (!inEndCrashWhite) {
      setTvBeam(false);
      setTvFlash(false);
      return;
    }
    setTvBeam(true);
    return () => {
      setTvBeam(false);
      setTvFlash(false);
    };
  }, [inEndCrashWhite]);

  // Master timeline
  useEffect(() => {
    if (!active) {
      clearTimers();
      document.documentElement.removeAttribute("data-glitch");
      setTvBeam(false);
      setTvFlash(false);
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
      setTvBeam(true);
      schedule(200, () => setTvBeam(false));
      schedule(210, () => {
        setTvFlash(true);
        schedule(48, () => setTvFlash(false));
      });
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

  // Noise canvas — stage 3 density during end crash hand-off too
  useEffect(() => {
    if (!active || prefersReduced) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (crashed && crashRevealUi) {
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

    const noiseStage =
      crashed && !crashRevealUi ? 3 : overlayStage;

    let last = 0;
    const tick = (time: number) => {
      if (time - last < (noiseStage >= 3 ? 55 : 130)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      last = time;
      const d = ctx.createImageData(w, h);
      const alphaBase =
        noiseStage >= 3 ? 44 : noiseStage >= 2 ? 28 : noiseStage >= 1 ? 18 : 12;
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = v;
        d.data[i + 1] = v;
        d.data[i + 2] = v;
        d.data[i + 3] = alphaBase + Math.random() * (noiseStage >= 3 ? 40 : 28);
      }
      ctx.putImageData(d, 0, 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, crashed, crashRevealUi, overlayStage, prefersReduced]);

  useEffect(() => {
    if (crashed) setFlashes([]);
  }, [crashed]);

  // Terminal flashes during spread / escalate (not during collapse — would read over black)
  useEffect(() => {
    if (!active || overlayStage < 1 || overlayStage >= 3 || crashed || prefersReduced) return;

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

  /** Collapse pulls toward black quickly; final frame is near-opaque (no long fade-out). */
  const blackoutOpacity =
    overlayStage >= 4 ? 0.9
    : overlayStage >= 3 ? 0.62
    : overlayStage >= 2 ? 0.3
    : overlayStage >= 1 ? 0.12
    : 0.05;

  const handleReboot = () => {
    reboot();
    setFlashes([]);
    setTvBeam(false);
    setTvFlash(false);
  };

  const jitterStrong = collapseGlitchActive;
  const rgbStrong = overlayStage >= 2 && !inEndCrashWhite;
  const rgbExtreme = collapseGlitchActive;

  const blackoutTransition =
    overlayStage >= 3
      ? { duration: 0.14, ease: [0.5, 0, 1, 1] as const }
      : { duration: 0.38, ease: "easeOut" as const };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="glitch-root"
          className="fixed inset-0 overflow-hidden"
          style={{ zIndex: 2147483000, pointerEvents: "auto" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeOut" } }}
          role="presentation"
          aria-hidden={!crashed}
        >
          {/* Oversized layer so sub-pixel jitter never exposes viewport edges */}
          <motion.div
            className="absolute -inset-[18px]"
            animate={
              presentationFrozen
                ? { x: 0, y: 0, skewX: 0 }
                : {
                    x: jitterStrong
                      ? [0, -4, 5, -3, 4, 0]
                      : [0, -1.5, 1.5, -1, 1, 0],
                    y: jitterStrong
                      ? [0, 2.5, -3, 2, -2.5, 0]
                      : [0, 1, -1.5, 0.8, -1, 0],
                    skewX: jitterStrong ? [0, -0.45, 0.35, 0] : [0, -0.15, 0.12, 0],
                  }
            }
            transition={
              presentationFrozen
                ? { duration: 0.2 }
                : {
                    duration: jitterStrong ? 0.2 : overlayStage >= 2 ? 0.5 : 0.65,
                    repeat: presentationFrozen ? 0 : Infinity,
                    ease: "linear",
                  }
            }
          >
            {!prefersReduced && (!crashed || inEndCrashWhite) && (
              <>
                <motion.div
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    background: rgbExtreme ? "rgba(255,0,0,0.12)" : "rgba(255,0,0,0.06)",
                    transform: rgbExtreme ? "translateX(-10px)" : "translateX(-4px)",
                  }}
                  animate={{
                    opacity: rgbExtreme
                      ? [0.22, 0.45, 0.18, 0.38, 0.2]
                      : rgbStrong
                        ? [0.14, 0.24, 0.17]
                        : [0.08, 0.14, 0.1],
                  }}
                  transition={{
                    duration: rgbExtreme ? 0.24 : rgbStrong ? 0.55 : 0.85,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    background: rgbExtreme ? "rgba(0,255,255,0.1)" : "rgba(0,255,255,0.05)",
                    transform: rgbExtreme ? "translateX(10px)" : "translateX(4px)",
                  }}
                  animate={{
                    opacity: rgbExtreme
                      ? [0.2, 0.42, 0.16, 0.35, 0.18]
                      : rgbStrong
                        ? [0.12, 0.22, 0.15]
                        : [0.07, 0.12, 0.09],
                  }}
                  transition={{
                    duration: rgbExtreme ? 0.26 : rgbStrong ? 0.58 : 0.9,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                />
              </>
            )}

            {(!crashed || !crashRevealUi) && (
              <div
                className="pointer-events-none absolute inset-0 mix-blend-multiply"
                style={{
                  opacity:
                    overlayStage >= 3
                      ? 0.34
                      : overlayStage >= 1
                        ? 0.24
                        : 0.12,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
                  animation: prefersReduced ? "none" : "glitch-scan-drift 3.4s linear infinite",
                }}
              />
            )}

            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute left-0 top-0 mix-blend-overlay"
              style={{
                width: 112,
                height: 112,
                opacity:
                  crashed && crashRevealUi
                    ? 0
                    : inEndCrashWhite || overlayStage >= 3
                      ? 0.42
                      : overlayStage >= 2
                        ? 0.32
                        : 0.18,
                imageRendering: "pixelated",
                transformOrigin: "top left",
              }}
            />

            {!prefersReduced &&
              overlayStage >= 2 &&
              (!crashed || inEndCrashWhite) && (
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

            {/* Under blackout z-index so heavy black / final frame covers badges */}
            <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden">
              <AnimatePresence>
                {flashes.map((f) => (
                  <FlashLine key={f.id} text={f.text} onDone={() => removeFlash(f.id)} />
                ))}
              </AnimatePresence>
            </div>

            {crashRevealUi || prefersReduced ? (
              <div className="absolute inset-0 z-[5] bg-white" aria-hidden />
            ) : (
              <motion.div
                className="absolute inset-0 z-[5] bg-black"
                initial={false}
                animate={{ opacity: blackoutOpacity }}
                transition={blackoutTransition}
              />
            )}

            {/* CRT-style horizontal beam — “tube” energy collapse */}
            {!prefersReduced && (!crashed || inEndCrashWhite) && (
              <div
                className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center overflow-hidden"
                aria-hidden
              >
                <motion.div
                  className="w-full max-w-none shrink-0 bg-white mix-blend-screen"
                  style={{
                    height: 3,
                    boxShadow:
                      "0 0 20px rgba(255,255,255,0.95), 0 0 80px rgba(120,200,255,0.55)",
                    transformOrigin: "50% 50%",
                  }}
                  initial={false}
                  animate={{
                    scaleY: tvBeam ? 420 : 0.02,
                    opacity: tvBeam ? 1 : 0,
                  }}
                  transition={{
                    duration: tvBeam ? 0.2 : 0.08,
                    ease: tvBeam ? [0.9, 0, 1, 1] : "easeOut",
                  }}
                />
              </div>
            )}

            {tvFlash && !prefersReduced && (
              <div
                className="pointer-events-none absolute inset-0 z-[7] bg-white mix-blend-overlay opacity-[0.92]"
                aria-hidden
              />
            )}

            {!prefersReduced &&
              overlayStage >= 2 &&
              (!crashed || inEndCrashWhite) && (
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
            {crashed && crashRevealUi && (
              <motion.div
                key="crash-end"
                className="absolute inset-0 z-[8] flex flex-col items-center justify-center bg-white px-6"
                role="dialog"
                aria-modal="true"
                aria-label="Martin OS. Easter egg — nothing was harmed. Press Reboot to continue."
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <motion.div
                  className="flex w-full max-w-[280px] flex-col items-center gap-5 sm:max-w-[300px] sm:gap-6"
                  initial={
                    prefersReduced ? false : { opacity: 0, y: 14, filter: "blur(8px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: prefersReduced ? 0 : 0.44,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="relative w-[min(112px,30vw)] shrink-0">
                    <img
                      src="/images/crash-face.svg"
                      alt=""
                      className="block h-auto w-full"
                      width={248}
                      height={271}
                      decoding="async"
                    />
                  </div>
                  <img
                    src={CRASH_TITLE_SRC}
                    alt="Martin OS"
                    className="h-auto w-[min(200px,54vw)] max-w-full"
                    width={283}
                    height={54}
                    decoding="async"
                  />
                  <p className="px-1 text-center text-xs leading-snug text-black/50 sm:text-sm">
                    (Easter egg — nothing was harmed.)
                  </p>
                  <motion.button
                    type="button"
                    className="flex h-12 min-w-[140px] cursor-pointer items-center justify-center rounded-xl bg-[#141414] px-8 text-center text-lg font-medium leading-8 text-white shadow-sm transition-shadow duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-black/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    initial={prefersReduced ? false : { scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                      delay: prefersReduced ? 0 : 0.08,
                    }}
                    whileHover={
                      prefersReduced
                        ? {}
                        : {
                            scale: 1.04,
                            backgroundColor: "#2a2a2a",
                            boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
                          }
                    }
                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                    onClick={handleReboot}
                  >
                    Reboot
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
