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

/** The window event `startRouteProgress()` dispatches. Any `RouteProgress` on the page listens for it. */
export const ROUTE_PROGRESS_START_EVENT = "lufia:route-progress-start";
/** The window event `doneRouteProgress()` dispatches. */
export const ROUTE_PROGRESS_DONE_EVENT = "lufia:route-progress-done";

/** Names of the window events a `RouteProgress` listens for. */
export type RouteProgressEvents = { start: string; done: string };

const DEFAULT_EVENTS: RouteProgressEvents = {
  start: ROUTE_PROGRESS_START_EVENT,
  done: ROUTE_PROGRESS_DONE_EVENT,
};

/**
 * Starts the route progress bar from code, for a navigation no link click or `pending` state describes (a
 * `router.push` after a save, a search-param change). It dispatches `ROUTE_PROGRESS_START_EVENT` on `window`, so it
 * works from anywhere, outside React too. The run ends on `doneRouteProgress()`, a `routeKey` change or the 10-second
 * timeout. Does nothing on the server.
 */
export function startRouteProgress(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ROUTE_PROGRESS_START_EVENT));
}

/**
 * Ends a run started by `startRouteProgress()` (a cancelled or failed navigation). The bar finishes unless `pending` or a
 * tracked link click still keeps it going. Dispatches `ROUTE_PROGRESS_DONE_EVENT` on `window`; does nothing on the server.
 */
export function doneRouteProgress(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ROUTE_PROGRESS_DONE_EVENT));
}

export type RouteProgressProps = {
  /**
   * Identifies the page being shown (the pathname). When it changes, the navigation has arrived and the bar finishes.
   * `AppShell` passes its own `routeKey`.
   */
  routeKey: string;
  /**
   * A navigation has started and not arrived. Set it from the router's pending state, or from your own click handler for
   * a programmatic navigation (a query-string change the link tracking does not see). Going back to `false` without a
   * new `routeKey` (a cancelled navigation) finishes the bar, unless a tracked link click is still on its way. When you
   * pass it (even as `false`), link clicks stop starting the bar unless `trackLinks` is set explicitly.
   */
  pending?: boolean;
  /**
   * Start on a plain click on a same-origin link that leads to another path (`<a href>`, which includes a router's
   * links). Not for modified clicks, `target` other than `_self`, downloads, the current path or a link that only changes
   * the query string or hash. A run started this way ends when `location.href` changes, when `routeKey` changes, or after
   * 10 seconds, whichever comes first. Default `true` without `pending` and `false` with it; set it `true` together with
   * `pending` and the bar shows while either is in progress.
   */
  trackLinks?: boolean;
  /** Milliseconds to wait before showing the bar. Default 150. */
  revealDelay?: number;
  /**
   * The window events that start and end a run from code. Default `ROUTE_PROGRESS_START_EVENT` and
   * `ROUTE_PROGRESS_DONE_EVENT`, which `startRouteProgress()` and `doneRouteProgress()` dispatch. Pass your own names when
   * existing code (or an end-to-end test) already raises events of its own. A started run combines with `pending` and
   * `trackLinks`: the bar shows while any of them is in progress.
   */
  events?: RouteProgressEvents;
  className?: string;
};

/**
 * A thin progress bar fixed to the top of the window while a navigation is loading. It is a signal, not an overlay: it
 * shows only when the wait outlasts `revealDelay`, creeps toward 85%, jumps to the end when `routeKey` changes and fades
 * out (opacity, with the exit token). Code starts and ends a run with `startRouteProgress()` and `doneRouteProgress()`
 * (window events, see `events`). A run that is never finished ends by itself after 10 seconds. It is decorative (`aria-hidden`); announce a long wait with your own live region. Only `transform` and `opacity`
 * move, with the motion tokens, so under reduced motion it steps without easing.
 */
export function RouteProgress({
  routeKey,
  pending,
  trackLinks,
  revealDelay = ROUTE_PROGRESS_REVEAL_DELAY_MS,
  events = DEFAULT_EVENTS,
  className,
}: RouteProgressProps) {
  const previousRoute = useRef(routeKey);
  const reveal = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finish = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Set when a link click started the run: the address it left, to notice when it changed. */
  const startedAt = useRef<string | null>(null);
  /** A run started from code (`startRouteProgress()` or `events.start`) that has not been told it is done. */
  const manual = useRef(false);
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
    manual.current = false;
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

  /** The latest `pending`, read by the timers. */
  const pendingNow = useRef(Boolean(pending));
  useEffect(() => {
    pendingNow.current = Boolean(pending);
  }, [pending]);

  const start = useCallback(
    (fromLink = false) => {
      if (fromLink) startedAt.current = window.location.href;
      const running = reveal.current !== null || ticker.current !== null;
      // A bar that is finishing starts over.
      if (!running && finish.current) clearTimers();
      // Nothing may keep the bar on screen for ever: a cancelled or guarded navigation never announces itself. Each new
      // start (a click, `pending`) gives the run its full time again.
      if (safety.current) clearTimeout(safety.current);
      safety.current = setTimeout(() => {
        safety.current = null;
        complete();
      }, ROUTE_PROGRESS_TIMEOUT_MS);
      if (running) return;
      /** A tracked link click has arrived; true when nothing else (`pending`) keeps the run going. */
      const done = () => {
        if (startedAt.current === null || window.location.href === startedAt.current) return false;
        startedAt.current = null;
        return !pendingNow.current && !manual.current;
      };
      reveal.current = setTimeout(() => {
        reveal.current = null;
        if (done()) {
          complete();
          return;
        }
        setProgress(20);
        setVisible(true);
        ticker.current = setInterval(() => {
          if (done()) {
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
      // A tracked link click that has not arrived, or a run started from code, keeps the bar; each ends on its own terms.
      if (startedAt.current === null && !manual.current) complete();
    }
  }, [pending, start, complete]);

  const tracking = trackLinks ?? pending === undefined;
  useEffect(() => {
    if (!tracking) return;
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
  }, [tracking, start]);

  const startEvent = events.start;
  const doneEvent = events.done;
  useEffect(() => {
    const onStart = () => {
      manual.current = true;
      start();
    };
    const onDone = () => {
      if (!manual.current) return;
      manual.current = false;
      if (!pendingNow.current && startedAt.current === null) complete();
    };
    window.addEventListener(startEvent, onStart);
    window.addEventListener(doneEvent, onDone);
    return () => {
      window.removeEventListener(startEvent, onStart);
      window.removeEventListener(doneEvent, onDone);
    };
  }, [startEvent, doneEvent, start, complete]);

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
