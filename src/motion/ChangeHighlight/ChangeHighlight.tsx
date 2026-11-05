"use client";

import { useState, type HTMLAttributes } from "react";
import styles from "./ChangeHighlight.module.css";

export type ChangeHighlightProps = HTMLAttributes<HTMLSpanElement> & {
  /** Anything comparable. The highlight plays when this changes between renders, never on mount. */
  value: string | number | boolean | null | undefined;
};

/**
 * Flashes a soft background behind its children when `value` changes while they are on screen.
 *
 * Decoration only: it never carries meaning on its own, and it does not play under `prefers-reduced-motion`. If the
 * change matters, make it readable in text or announce it through a live region.
 */
export function ChangeHighlight({ value, className, children, ...rest }: ChangeHighlightProps) {
  const [previous, setPrevious] = useState(value);
  const [flashes, setFlashes] = useState(0);

  // Compare while rendering so the first paint after the change already carries the highlight.
  if (!Object.is(previous, value)) {
    setPrevious(value);
    setFlashes(flashes + 1);
  }

  return (
    <span
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      // Two alternating animation names restart the animation on consecutive changes without remounting children.
      data-flash={flashes === 0 ? undefined : flashes % 2 === 0 ? "b" : "a"}
    >
      {children}
    </span>
  );
}
