"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./RouteProgress.module.css";

/** A navigation that finishes within this time never shows the bar, so fast navigations do not flash. */
export const ROUTE_PROGRESS_REVEAL_DELAY_MS = 150;
const TICK_MS = 300;
const FINISH_MS = 160;
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
   */
  pending?: boolean;
  /**
   * Also start on a plain click on a same-origin link that leads to another page (`<a href>`, which includes a router's
   * links). Not for modified clicks, `target` other than `_self`, downloads and the current page. Default `true`.
   */
  trackLinks?: boolean;
  /** Milliseconds to wait before showing the bar. Default 150. */
  revealDelay?: number;
  className?: string;
};

/**
 * A thin progress bar fixed to the top of the window while a navigation is loading. It is a signal, not an overlay: it
 * shows only when the wait outlasts `revealDelay`, creeps toward 85%, jumps to the end when `routeKey` changes and fades
 * out. It is decorative (`aria-hidden`); announce a long wait with your own live region. Only `transform` and `opacity`
 * move, with the motion tokens, so under reduced motion it steps without easing.
 */
export function RouteProgress({
  routeKey,
  pending = false,
  trackLinks = true,
  revealDelay = ROUTE_PROGRESS_REVEAL_DELAY_MS,
  className,
}: RouteProgressProps) {
  const previousRoute = useRef(routeKey);
  const reveal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finish = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const clearTimers = useCallback(() => {
    if (reveal.current) clearTimeout(reveal.current);
    if (finish.current) clearTimeout(finish.current);
    if (ticker.current) clearInterval(ticker.current);
    reveal.current = finish.current = ticker.current = null;
  }, []);

  const complete = useCallback(() => {
    // Still waiting to be shown: the navigation was fast enough that the bar never needs to appear.
    if (reveal.current) {
      clearTimers();
      return;
    }
    if (!ticker.current) return;
    clearTimers();
    setProgress(100);
    finish.current = setTimeout(() => {
      finish.current = null;
      setVisible(false);
      setProgress(0);
    }, FINISH_MS);
  }, [clearTimers]);

  const start = useCallback(() => {
    if (reveal.current || ticker.current) return;
    if (finish.current) clearTimers();
    reveal.current = setTimeout(() => {
      reveal.current = null;
      setProgress(20);
      setVisible(true);
      ticker.current = setInterval(() => {
        setProgress((now) => Math.min(now + (now < 40 ? 12 : now < 65 ? 6 : now < 80 ? 2 : 0.5), CEILING));
      }, TICK_MS);
    }, revealDelay);
  }, [clearTimers, revealDelay]);

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

  useEffect(() => {
    if (!trackLinks) return;
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      const next = new URL(anchor.getAttribute("href")!, window.location.href);
      const here = window.location;
      if (
        next.origin !== here.origin ||
        `${next.pathname}${next.search}` === `${here.pathname}${here.search}`
      ) {
        return;
      }
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [trackLinks, start]);

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
