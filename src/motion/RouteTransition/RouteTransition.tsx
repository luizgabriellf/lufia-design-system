"use client";

import { useLayoutEffect, useRef, type HTMLAttributes } from "react";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";
import styles from "./RouteTransition.module.css";

export type RouteTransitionProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Identifies the page being shown, usually the pathname. When it changes after the first render, the region's content
   * enters. Anything that keeps the same key (a search-param change, a refresh, the first load) plays nothing.
   */
  transitionKey: string | number;
  /** `rise` fades in and lifts a few pixels, `fade` only changes opacity (for a page that replaces a skeleton). */
  variant?: "rise" | "fade";
};

const MARKER = "data-route-enter";
const STATIC = "data-route-static";

/**
 * The content region of an app: when `transitionKey` changes, the new page enters with a short fade and rise.
 *
 * It is independent of any router. Pass the pathname (or any id of the current page) as `transitionKey`. Nothing is
 * remounted: the region and the providers and layouts inside it keep their state, and only a marker attribute is set on
 * the region's direct children, after React has committed the new page and before the browser paints it, so the old
 * page never animates and the first painted frame of the new one is already the first frame of the animation.
 *
 * Children with `data-route-static` (a persistent banner, the toast region) and `position: fixed` children are left
 * alone: a transform on them would restart them or change what they are fixed to. The marker stays until the next
 * change. Under `prefers-reduced-motion` nothing is marked, so the page is simply there.
 */
export function RouteTransition({
  transitionKey,
  variant = "rise",
  className,
  children,
  ...rest
}: RouteTransitionProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRef(transitionKey);

  useLayoutEffect(() => {
    const region = ref.current;
    if (!region || shown.current === transitionKey) return;
    shown.current = transitionKey;
    if (reduced) return;
    for (const child of region.children) {
      if (!(child instanceof HTMLElement) || child.hasAttribute(STATIC)) continue;
      if (getComputedStyle(child).position === "fixed") continue;
      // A second change mid-animation restarts it on the new content.
      if (child.hasAttribute(MARKER)) {
        child.removeAttribute(MARKER);
        void child.offsetWidth;
      }
      child.setAttribute(MARKER, variant);
    }
  }, [transitionKey, variant, reduced]);

  return (
    <div {...rest} ref={ref} className={[styles.root, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
