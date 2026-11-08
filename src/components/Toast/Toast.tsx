"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useModalDialogs } from "../Modal/topModalDialog";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion";
import { useLufia } from "../LufiaProvider";
import { CloseIcon } from "../Icon/icons";
import { StatusIcon, type StatusTone } from "../StatusIcon/StatusIcon";
import styles from "./Toast.module.css";

export type ToastTone = "info" | "success" | "warning" | "error";
/** A built-in tone, or a name the app maps onto one with the provider's `toneAliases`. */
export type ToastToneName = ToastTone | (string & {});
export type ToastPlacement = "bottom-end" | "bottom-start" | "top-end" | "top-start";

export type ToastAction = {
  /** Visible text of the action button, e.g. "Undo". */
  label: string;
  /** Called when the action is pressed. The toast is dismissed afterwards. */
  onAction: () => void;
};

export type ToastOptions = {
  message: ReactNode;
  /**
   * Default `info`. `error` is announced assertively and never closes by itself unless `duration` says so. An alias from the
   * provider's `toneAliases` resolves to its built-in tone; an unknown name falls back to `info`.
   */
  tone?: ToastToneName;
  action?: ToastAction;
  /**
   * Milliseconds before it closes on its own. `null` keeps it until dismissed. Defaults to the provider's `duration`;
   * errors and toasts with an action default to `null`, so nobody loses a message or a chance to act (WCAG 2.2.1).
   */
  duration?: number | null;
  /** Identity for de-duplication: showing a toast whose `id` is already visible keeps the one on screen. */
  id?: string;
};

export type ToastApi = {
  /** Shows a toast and returns its id. A string message with the same tone as a visible toast is not shown twice. */
  show: (options: ToastOptions) => string;
  info: (message: ReactNode, options?: Omit<ToastOptions, "message" | "tone">) => string;
  success: (message: ReactNode, options?: Omit<ToastOptions, "message" | "tone">) => string;
  warning: (message: ReactNode, options?: Omit<ToastOptions, "message" | "tone">) => string;
  error: (message: ReactNode, options?: Omit<ToastOptions, "message" | "tone">) => string;
  dismiss: (id: string) => void;
  /** Dismisses every toast. */
  clear: () => void;
};

type Item = {
  /** Unique per instance: a reused `id` can be on screen twice while the first copy leaves. */
  uid: number;
  id: string;
  key: string | undefined;
  message: ReactNode;
  tone: ToastTone;
  action: ToastAction | undefined;
  /** Dismissed and playing its exit; removed when that ends. */
  leaving: boolean;
  /** The list changed host while it was on screen: no enter animation. */
  moved: boolean;
  /** The container whose announcer reads this message out. */
  announceHost: Element | null;
  createdAt: number;
};

type Timer = {
  timeout: ReturnType<typeof setTimeout> | undefined;
  remaining: number;
  startedAt: number;
  holds: Set<string>;
};

const ToastContext = createContext<ToastApi | null>(null);

/** After a pause the toast stays at least this long, so it cannot vanish the instant the pointer leaves. */
const MIN_RESUME_MS = 1500;
const DEFAULT_DURATION_MS = 5000;
const noSubscription = () => () => {};
let counter = 0;

const announcerKeys = new WeakMap<Element, string>();
/** A stable key per host, so an announcer is not recreated when another host comes or goes. */
const announcerKey = (host: Element) => {
  let key = announcerKeys.get(host);
  if (!key) announcerKeys.set(host, (key = `announcer-${++counter}`));
  return key;
};

const TONES: readonly string[] = ["info", "success", "warning", "error"];

export type ToastProviderProps = {
  children: ReactNode;
  /** Corner of the viewport the stack sits in. Default `bottom-end`. */
  placement?: ToastPlacement;
  /** The most toasts shown at once; older ones leave first. Default 5. */
  limit?: number;
  /** Default time before a toast closes, in ms. Default 5000. Errors and toasts with an action stay until dismissed. */
  duration?: number;
  /**
   * Where the notification region is rendered. `"auto"` (default) hosts it inside the topmost open modal `<dialog>` while
   * there is one, so toasts stay visible above a native top-layer dialog (a `Modal` with `renderAs="dialog"`), and in
   * `document.body` otherwise. Pass an element to always render there, or `null` for `document.body` only.
   */
  container?: "auto" | Element | null;
  /** Names an app uses for tones, mapped to built-in ones: `{ ok: "success", warn: "warning" }`. */
  toneAliases?: Readonly<Record<string, ToastTone>>;
  /** A class for the notification region (the fixed viewport that holds the stacks), for an app's own placement or width rules. */
  viewportClassName?: string;
};

/**
 * Notifications that do not block: a stack in a corner, announced to screen readers, that closes by itself and waits while it
 * is hovered or focused. Mount it once near the root; call `useToast()` anywhere below.
 *
 * Offset the stack from other fixed UI (a floating bar, a cookie banner) by setting `--lufia-toast-offset-block` on `:root`.
 */
export function ToastProvider({
  children,
  placement = "bottom-end",
  limit = 5,
  duration = DEFAULT_DURATION_MS,
  container = "auto",
  toneAliases,
  viewportClassName,
}: ToastProviderProps) {
  const { labels } = useLufia();
  const auto = container === "auto";
  const dialogs = useModalDialogs(true);
  const topDialog = dialogs[dialogs.length - 1] ?? null;
  const dialogHost = auto ? topDialog : null;
  // Messages are read out by the announcer of the topmost open modal dialog, else the body's: the browser makes everything
  // outside an open modal dialog inert, and an inert live region says nothing.
  const announceHostRef = useRef<Element | null>(null);
  const host = auto ? (dialogHost ?? undefined) : (container ?? undefined);
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const timers = useRef(new Map<string, Timer>());

  const commit = useCallback((next: Item[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  // A toast already on screen when the host changes moves with the list; it must not play its enter again.
  const lastHost = useRef(host);
  useLayoutEffect(() => {
    if (host === lastHost.current) return;
    lastHost.current = host;
    commit(itemsRef.current.map((item) => ({ ...item, moved: true })));
  }, [host, commit]);

  useLayoutEffect(() => {
    announceHostRef.current = topDialog ?? document.body;
    // A toast raised in the same tick as its dialog closed was queued for an announcer that is gone: hand it to the one
    // that is topmost now (a kept-mounted dialog is still in the document but no longer open). Older toasts were already heard; they stay where they were.
    const now = Date.now();
    let changed = false;
    const next = itemsRef.current.map((item) => {
      if (
        item.leaving ||
        !item.announceHost ||
        item.announceHost === document.body ||
        (dialogs as readonly Element[]).includes(item.announceHost) ||
        now - item.createdAt > 1000
      )
        return item;
      changed = true;
      return { ...item, announceHost: announceHostRef.current };
    });
    if (changed) commit(next);
  }, [topDialog, dialogs, commit]);

  const dropTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer?.timeout) clearTimeout(timer.timeout);
    timers.current.delete(id);
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      dropTimer(id);
      if (!itemsRef.current.some((item) => item.id === id && !item.leaving)) return;
      commit(itemsRef.current.map((item) => (item.id === id ? { ...item, leaving: true } : item)));
    },
    [commit, dropTimer],
  );

  const remove = useCallback(
    (uid: number) => commit(itemsRef.current.filter((item) => item.uid !== uid)),
    [commit],
  );

  const arm = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);
      if (!timer || timer.timeout || timer.holds.size > 0) return;
      timer.startedAt = Date.now();
      timer.timeout = setTimeout(() => dismiss(id), timer.remaining);
    },
    [dismiss],
  );

  const hold = useCallback((id: string, source: string) => {
    const timer = timers.current.get(id);
    if (!timer) return;
    timer.holds.add(source);
    if (timer.timeout) {
      clearTimeout(timer.timeout);
      timer.timeout = undefined;
      timer.remaining = Math.max(MIN_RESUME_MS, timer.remaining - (Date.now() - timer.startedAt));
    }
  }, []);

  const release = useCallback(
    (id: string, source: string) => {
      timers.current.get(id)?.holds.delete(source);
      arm(id);
    },
    [arm],
  );

  const show = useCallback(
    (options: ToastOptions) => {
      const requested = options.tone ?? "info";
      const named = toneAliases?.[requested] ?? requested;
      const tone: ToastTone = TONES.includes(named) ? (named as ToastTone) : "info";
      const key =
        options.id ?? (typeof options.message === "string" ? `${tone}:${options.message}` : undefined);
      const existing = key ? itemsRef.current.find((item) => item.key === key && !item.leaving) : undefined;
      if (existing) return existing.id;

      const uid = ++counter;
      const id = options.id ?? `lufia-toast-${uid}`;
      const persistent = tone === "error" || options.action !== undefined;
      const ms = options.duration === undefined ? (persistent ? null : duration) : options.duration;
      const item: Item = {
        uid,
        id,
        key,
        message: options.message,
        tone,
        action: options.action,
        leaving: false,
        moved: false,
        announceHost: announceHostRef.current ?? document.body,
        createdAt: Date.now(),
      };
      const next = [...itemsRef.current, item];
      // Past the limit the oldest visible toasts leave.
      let overflow = next.filter((entry) => !entry.leaving).length - limit;
      commit(
        next.map((entry) => {
          if (overflow > 0 && !entry.leaving && entry.uid !== uid) {
            overflow -= 1;
            dropTimer(entry.id);
            return { ...entry, leaving: true };
          }
          return entry;
        }),
      );
      if (ms !== null) {
        timers.current.set(id, { timeout: undefined, remaining: ms, startedAt: 0, holds: new Set() });
        arm(id);
      }
      return id;
    },
    [arm, commit, dropTimer, duration, limit, toneAliases],
  );

  const clear = useCallback(() => {
    for (const item of itemsRef.current) dropTimer(item.id);
    commit(itemsRef.current.map((item) => ({ ...item, leaving: true })));
  }, [commit, dropTimer]);

  useEffect(() => {
    const live = timers.current;
    return () => {
      for (const timer of live.values()) if (timer.timeout) clearTimeout(timer.timeout);
      live.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      info: (message, options) => show({ ...options, message, tone: "info" }),
      success: (message, options) => show({ ...options, message, tone: "success" }),
      warning: (message, options) => show({ ...options, message, tone: "warning" }),
      error: (message, options) => show({ ...options, message, tone: "error" }),
      dismiss,
      clear,
    }),
    [show, dismiss, clear],
  );

  const announce = (host: Element, assertive: boolean) =>
    items
      .filter((item) => !item.leaving && item.announceHost === host && (item.tone === "error") === assertive)
      .map((item) => <div key={item.uid}>{item.message}</div>);

  // One persistent pair per host: the body, and each open modal dialog from the moment it opens until it closes. Each one
  // exists before any message is added to it, which is what makes a live region announce.
  const announcerHosts: Element[] = mounted ? [document.body, ...dialogs] : [];

  const render = (assertive: boolean) =>
    items
      .filter((item) => (item.tone === "error") === assertive)
      .map((item) => (
        <ToastItem
          key={item.uid}
          item={item}
          dismissLabel={labels.dismiss}
          onDismiss={dismiss}
          onExited={remove}
          onHold={hold}
          onRelease={release}
        />
      ));

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted ? (
        <>
          {announcerHosts.map((announcerHost) =>
            createPortal(
              <div className={styles.announcer} data-lufia-inert-exempt="" data-lufia-announcer="">
                <div role="alert" aria-live="assertive" aria-atomic="false" aria-relevant="additions">
                  {announce(announcerHost, true)}
                </div>
                <div role="status" aria-live="polite" aria-atomic="false" aria-relevant="additions">
                  {announce(announcerHost, false)}
                </div>
              </div>,
              announcerHost,
              announcerKey(announcerHost),
            ),
          )}
          {createPortal(
            // The visible stack. `data-lufia-inert-exempt` keeps it reachable while a modal is open.
            <div
              role="region"
              aria-label={labels.notifications}
              className={[styles.viewport, viewportClassName].filter(Boolean).join(" ")}
              data-lufia-part="viewport"
              data-placement={placement}
              data-lufia-inert-exempt=""
            >
              <ol className={styles.list}>{render(true)}</ol>
              <ol className={styles.list}>{render(false)}</ol>
            </div>,
            host ?? document.body,
          )}
        </>
      ) : null}
    </ToastContext.Provider>
  );
}

const TONE_STATUS: Record<ToastTone, StatusTone> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
};

type ToastItemProps = {
  item: Item;
  dismissLabel: string;
  onDismiss: (id: string) => void;
  onExited: (uid: number) => void;
  onHold: (id: string, source: string) => void;
  onRelease: (id: string, source: string) => void;
};

function ToastItem({ item, dismissLabel, onDismiss, onExited, onHold, onRelease }: ToastItemProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLLIElement>(null);

  // Remove after the exit animation. Without one (reduced motion, or a stylesheet that defines none) remove at once.
  useEffect(() => {
    if (!item.leaving) return;
    const element = ref.current;
    const style = element ? getComputedStyle(element) : null;
    const animated =
      !reduced && style !== null && style.animationName !== "none" && parseFloat(style.animationDuration) > 0;
    if (animated) return;
    const frame = requestAnimationFrame(() => onExited(item.uid));
    return () => cancelAnimationFrame(frame);
  }, [item.leaving, item.uid, reduced, onExited]);

  return (
    // The handlers only observe events that bubble up from the real controls inside (hover and focus pause the timer, Escape
    // dismisses); the item itself is not a control.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      ref={ref}
      className={styles.item}
      data-tone={item.tone}
      data-state={item.leaving ? "leaving" : "open"}
      data-moved={item.moved || undefined}
      onAnimationEnd={(event) => {
        if (item.leaving && event.target === event.currentTarget) onExited(item.uid);
      }}
      onPointerEnter={() => onHold(item.id, "pointer")}
      onPointerLeave={() => onRelease(item.id, "pointer")}
      onFocus={() => onHold(item.id, "focus")}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onRelease(item.id, "focus");
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onDismiss(item.id);
        }
      }}
    >
      <StatusIcon tone={TONE_STATUS[item.tone]} variant="ring" className={styles.icon} />
      <div className={styles.message}>{item.message}</div>
      {item.action ? (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            item.action?.onAction();
            onDismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className={styles.dismiss}
        aria-label={dismissLabel}
        onClick={() => onDismiss(item.id)}
      >
        <CloseIcon size="sm" />
      </button>
    </li>
  );
}

/** The toast API when rendered inside a `ToastProvider`, otherwise `null`: for code that may run outside one. */
export function useOptionalToast(): ToastApi | null {
  return useContext(ToastContext);
}

/** Show and dismiss notifications. Must be used inside a `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside a ToastProvider");
  return api;
}
