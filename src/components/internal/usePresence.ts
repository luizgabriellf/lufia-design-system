"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "../../motion";

export type Phase = "open" | "closed" | "unmounted";

/** Extra time past the exit animation before it is declared finished, in case `animationend` never arrives. */
const EXIT_MARGIN_MS = 150;

/** The first value of a CSS time list (`"0.2s"`, `"200ms"`) in milliseconds; 0 when absent or unparsable. */
function toMs(value: string | undefined): number {
  const first = (value ?? "").split(",")[0]?.trim() ?? "";
  const number = parseFloat(first);
  if (!Number.isFinite(number)) return 0;
  return first.endsWith("ms") ? number : number * 1000;
}

/**
 * Keeps an overlay mounted while its exit animation plays. `phase` is `open`, `closed` (still mounted, animating out) or
 * `unmounted`; call `finish` from `onAnimationEnd` of the animated element. Under `prefers-reduced-motion`, or when the
 * stylesheet defines no animation, it unmounts at once. If `animationend` never arrives (the element is under a
 * `display: none` ancestor, or the animation is cancelled) a timeout finishes the exit. Same approach as `Reveal`, for
 * overlays that need their own structure.
 *
 * With `skipWhenNotRendered`, an exit that nobody can see (the element has no layout boxes, for example under a `hidden`
 * ancestor) unmounts on the next frame instead of waiting for the timeout. It is off by default because overlays may be measured
 * before layout; it also does nothing where `checkVisibility` is missing (jsdom has no layout, so every element looks
 * unrendered there).
 */
export function usePresence(
  open: boolean,
  animated: RefObject<HTMLElement | null>,
  { skipWhenNotRendered = false }: { skipWhenNotRendered?: boolean } = {},
) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(open ? "open" : "unmounted");
  // Derive the phase while rendering: React re-renders at once, with no extra effect pass.
  if (open && phase !== "open") setPhase("open");
  else if (!open && phase === "open") setPhase(reduced ? "unmounted" : "closed");

  useEffect(() => {
    if (phase !== "closed") return;
    const element = animated.current;
    if (
      skipWhenNotRendered &&
      element &&
      element.isConnected &&
      typeof element.checkVisibility === "function" &&
      element.getClientRects().length === 0
    ) {
      // Next frame, like the no-animation path: no exit can be seen, so there is nothing to wait for.
      const frame = requestAnimationFrame(() => setPhase("unmounted"));
      return () => cancelAnimationFrame(frame);
    }
    const style = animated.current ? getComputedStyle(animated.current) : null;
    if (style && style.animationName !== "none" && parseFloat(style.animationDuration) > 0) {
      const timeout = setTimeout(
        () => setPhase("unmounted"),
        toMs(style.animationDuration) + toMs(style.animationDelay) + EXIT_MARGIN_MS,
      );
      return () => clearTimeout(timeout);
    }
    const frame = requestAnimationFrame(() => setPhase("unmounted"));
    return () => cancelAnimationFrame(frame);
  }, [phase, animated, skipWhenNotRendered]);

  return { phase, finish: () => setPhase((current) => (current === "closed" ? "unmounted" : current)) };
}
