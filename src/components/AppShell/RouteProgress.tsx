"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./RouteProgress.module.css";

/** A navigation that finishes within this time never shows the bar, so fast navigations do not flash. */
export const ROUTE_PROGRESS_REVEAL_DELAY_MS = 150;
const TICK_MS = 300;
const FINISH_MS = 160;
/** A run that nothing ever finishes (a cancelled or guarded navigation, a redirect back) ends by itself after this. */
export const ROUTE_PROGRESS_TIMEOUT_MS = 10_000;
/** It creeps toward this and waits there: the bar never claims the page is nearly ready when it does not know. */
const CEILING = 85;

export type RouteProgressProps = {
  /**
   * Identifies the page being shown (the pathname). When it changes, the navigation has arrived and the bar finishes.
   * `AppShell` passes its own `routeKey`.
   */
  routeKey: string;
  /**
   * A navigation has started and not arrived. Set it from the router's pending state, or from your own click handler for
   * a programmatic navigation. Going back to `false` without a new `routeKey` (a cancelled navigation) finishes the bar.
   * When you pass it (even as `false`) the app is in charge, and link clicks no longer start the bar by themselves.
   */
  pending?: boolean;
  /**
   * Without `pending`, also start on a plain click on a same-origin link that leads to another path (`<a href>`, which
   * includes a router's links). Not for modified clicks, `target` other than `_self`, downloads, the current path or a link
   * that only changes the query string or hash. A run started this way ends when `location.href` changes, when `routeKey`
   * changes, or after 10 seconds, whichever comes first. Default `true`.
   */
  trackLinks?: boolean;
  /** Milliseconds to wait before showing the bar. Default 150. */
  revealDelay?: number;
  className?: string;
};

/**
 * A thin progress bar fixed to the top of the window while a navigation is loading. It is a signal, not an overlay: it
 * shows only when the wait outlasts `revealDelay`, creeps toward 85%, jumps to the end when `routeKey` changes and fades
 * out (opacity, with the exit token). A run that is never finished ends by itself after 10 seconds. It is decorative (`aria-hidden`); announce a long wait with your own live region. Only `transform` and `opacity`
 * move, with the motion tokens, so under reduced motion it steps without easing.
 */
export function RouteProgress({
  routeKey,
  pending,
  trackLinks = true,
  revealDelay = ROUTE_PROGRESS_REVEAL_DELAY_MS,
  className,
}: RouteProgressProps) {
  const previousRoute = useRef(routeKey);
  const reveal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finish = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Set when a link click started the run: the address it left, to notice when it changed. */
  const startedAt = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const clearTimers = useCallback(() => {
    if (reveal.current) clearTimeout(reveal.current);
    if (finish.current) clearTimeout(finish.current);
    if (ticker.current) clearInterval(ticker.current);
    if (safety.current) clearTimeout(safety.current);
    reveal.current = finish.current = ticker.current = safety.current = null;
  }, []);

  const complete = useCallback(() => {
    startedAt.current = null;
    // Still waiting to be shown: the navigation was fast enough that the bar never needs to appear.
    if (reveal.current) {
      clearTimers();
      return;
    }
    if (!ticker.current) {
      if (safety.current) clearTimeout(safety.current);
      safety.current = null;
      return;
    }
    clearTimers();
    setProgress(100);
    finish.current = setTimeout(() => {
      finish.current = null;
      setVisible(false);
      setProgress(0);
    }, FINISH_MS);
  }, [clearTimers]);

  const start = useCallback(
    (fromLink = false) => {
      if (reveal.current || ticker.current) return;
      if (finish.current) clearTimers();
      startedAt.current = fromLink ? window.location.href : null;
      // Nothing may keep the bar on screen for ever: a cancelled or guarded navigation never announces itself.
      safety.current = setTimeout(() => {
        safety.current = null;
        complete();
      }, ROUTE_PROGRESS_TIMEOUT_MS);
      const arrived = () => startedAt.current !== null && window.location.href !== startedAt.current;
      reveal.current = setTimeout(() => {
        reveal.current = null;
        if (arrived()) {
          complete();
          return;
        }
        setProgress(20);
        setVisible(true);
        ticker.current = setInterval(() => {
          if (arrived()) {
            complete();
            return;
          }
          setProgress((now) => Math.min(now + (now < 40 ? 12 : now < 65 ? 6 : now < 80 ? 2 : 0.5), CEILING));
        }, TICK_MS);
      }, revealDelay);
    },
    [clearTimers, complete, revealDelay],
  );

  const wasPending = useRef(false);
  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      start();
    } else if (wasPending.current) {
      wasPending.current = false;
      complete();
    }
  }, [pending, start, complete]);

  const controlled = pending !== undefined;
  useEffect(() => {
    if (!trackLinks || controlled) return;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      const next = new URL(anchor.getAttribute("href")!, window.location.href);
      const here = window.location;
      // Another path only: a query or hash change is not a page change and would leave the bar waiting for ever.
      if (next.origin !== here.origin || next.pathname === here.pathname) return;
      start(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [trackLinks, controlled, start]);

  useEffect(() => {
    if (routeKey === previousRoute.current) return;
    previousRoute.current = routeKey;
    complete();
  }, [routeKey, complete]);

  useEffect(() => clearTimers, [clearTimers]);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      data-route-progress=""
      data-finishing={progress === 100 || undefined}
      className={[styles.bar, className].filter(Boolean).join(" ")}
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  );
}
