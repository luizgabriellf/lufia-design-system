"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";
import styles from "./AnimatedNumber.module.css";

export type AnimatedNumberProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  value: number;
  /** Turns the running number into text. Pass a locale-aware formatter; the default is `String`. */
  format?: (value: number) => string;
  /** Milliseconds. Defaults to the `--lufia-motion-duration-medium` token, which is ~0 under reduced motion. */
  duration?: number;
};

const FALLBACK_MS = 380;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function tokenDuration(element: HTMLElement | null): number {
  if (!element) return FALLBACK_MS;
  const raw = getComputedStyle(element).getPropertyValue("--lufia-motion-duration-medium").trim();
  const parsed = parseFloat(raw);
  if (Number.isNaN(parsed)) return FALLBACK_MS;
  return raw.endsWith("ms") ? parsed : parsed * 1000;
}

/**
 * A number that counts to its new value when `value` changes.
 *
 * The first render shows the real value, so server HTML, tests and screen readers read the true number. Only later
 * changes animate (the display travels from what is shown now to the new value, so interrupting is smooth).
 * It is not a live region: if the change matters to someone listening, announce it yourself.
 * With `prefers-reduced-motion` the new value appears at once.
 */
export function AnimatedNumber({
  value,
  format = String,
  duration,
  className,
  ...rest
}: AnimatedNumberProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const from = shown.current;
    if (from === value) return;
    const ms = duration ?? tokenDuration(ref.current);
    const instant = reduced || ms <= 1;
    let frame = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const progress = instant ? 1 : Math.min((now - start) / ms, 1);
      shown.current = progress === 1 ? value : from + (value - from) * easeOut(progress);
      setDisplay(shown.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    if (reduced) shown.current = value;
    else frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced, duration]);

  // Reduced motion never shows an intermediate number. Otherwise round to the precision of the target.
  const current = reduced ? value : Number(display.toFixed(decimalPlaces(value)));
  return (
    <span
      {...rest}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-animating={current !== value ? "" : undefined}
    >
      {format(current)}
    </span>
  );
}

function decimalPlaces(n: number): number {
  const [, fraction = ""] = String(n).split(".");
  return Math.min(fraction.length, 20);
}
