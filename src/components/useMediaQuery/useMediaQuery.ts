"use client";

import { useCallback, useSyncExternalStore } from "react";

export type UseMediaQueryOptions = {
  /** What the server (and the first hydration pass) reports, since it cannot know. Default `false`. */
  defaultValue?: boolean;
};

/**
 * Whether a CSS media query currently matches, following changes. SSR-safe: the server renders `defaultValue`, and React
 * re-reads the real value on hydration without a mismatch warning. Without `matchMedia` it returns `defaultValue`.
 *
 * Prefer CSS media queries for styling; use this when behaviour, not appearance, depends on the viewport.
 */
export function useMediaQuery(query: string, { defaultValue = false }: UseMediaQueryOptions = {}): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : defaultValue;
  return useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}
