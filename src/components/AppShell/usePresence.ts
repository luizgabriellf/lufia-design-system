"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "../../motion";

export type Phase = "open" | "closed" | "unmounted";

/**
 * Keeps an overlay mounted while its exit animation plays. `phase` is `open`, `closed` (still mounted, animating out) or
 * `unmounted`; call `finish` from `onAnimationEnd` of the animated element. Under `prefers-reduced-motion`, or when the
 * stylesheet defines no animation, it unmounts at once. Same approach as `Reveal`, for overlays that need their own
 * structure.
 */
export function usePresence(open: boolean, animated: RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(open ? "open" : "unmounted");
  // Derive the phase while rendering: React re-renders at once, with no extra effect pass.
  if (open && phase !== "open") setPhase("open");
  else if (!open && phase === "open") setPhase(reduced ? "unmounted" : "closed");

  useEffect(() => {
    if (phase !== "closed") return;
    const style = animated.current ? getComputedStyle(animated.current) : null;
    if (style && style.animationName !== "none" && parseFloat(style.animationDuration) > 0) return;
    const frame = requestAnimationFrame(() => setPhase("unmounted"));
    return () => cancelAnimationFrame(frame);
  }, [phase, animated]);

  return { phase, finish: () => setPhase((current) => (current === "closed" ? "unmounted" : current)) };
}
