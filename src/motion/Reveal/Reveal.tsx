"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";
import styles from "./Reveal.module.css";

export type RevealProps = HTMLAttributes<HTMLDivElement> & {
  /** Whether the content is shown. Toggling it plays the enter or exit animation. */
  show: boolean;
  /** `fade` changes opacity only, `rise` also moves the content up, `scale` grows it slightly. */
  variant?: "fade" | "rise" | "scale";
  /** Play the enter animation when the component mounts already shown. Off by default: only real changes animate. */
  appear?: boolean;
};

type Phase = "open" | "closed" | "unmounted";

/**
 * Mounts and unmounts its children with an enter and an exit animation.
 *
 * Exits are shorter than entrances. The children stay mounted until the exit animation ends, so keep side effects out of
 * them while `show` is false. Under `prefers-reduced-motion` (or when the stylesheet defines no animation) the content
 * appears and disappears at once.
 */
export function Reveal({
  show,
  variant = "fade",
  appear = false,
  className,
  onAnimationEnd,
  children,
  ...rest
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(show ? "open" : "unmounted");
  // Until the first real change, a component that mounted shown stays still unless `appear` is set.
  const [armed, setArmed] = useState(appear || !show);

  // Derive the phase from `show` while rendering (React re-renders at once, no extra effect pass).
  if (show && phase !== "open") {
    setPhase("open");
    setArmed(true);
  } else if (!show && phase === "open") {
    setPhase(reduced ? "unmounted" : "closed");
  }

  useEffect(() => {
    if (phase !== "closed") return;
    const element = ref.current;
    const style = element ? getComputedStyle(element) : null;
    const animated =
      style !== null && style.animationName !== "none" && parseFloat(style.animationDuration) > 0;
    if (animated) return;
    // No animation to wait for (stylesheet missing or disabled): unmount on the next frame.
    const frame = requestAnimationFrame(() => setPhase("unmounted"));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  if (phase === "unmounted") return null;

  return (
    <div
      {...rest}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-state={phase}
      data-variant={variant}
      data-animate={armed ? "" : undefined}
      onAnimationEnd={(event) => {
        onAnimationEnd?.(event);
        if (event.target === event.currentTarget && phase === "closed") setPhase("unmounted");
      }}
    >
      {children}
    </div>
  );
}
