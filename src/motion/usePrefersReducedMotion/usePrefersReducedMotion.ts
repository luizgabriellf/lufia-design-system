"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY).matches
    : false;
}

// The server cannot know the preference, so it renders the motion-capable output. CSS still collapses
// durations through the tokens, and React re-reads the real value on hydration.
const getServerSnapshot = () => false;

/**
 * Whether the user asked the system for reduced motion (`prefers-reduced-motion: reduce`).
 *
 * Follows runtime changes. Use it for motion that CSS cannot switch off by itself: `requestAnimationFrame` loops, the
 * Web Animations API, or deciding whether to wait for an exit animation before unmounting.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
