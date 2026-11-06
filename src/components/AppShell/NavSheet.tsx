"use client";

import { useRef, useSyncExternalStore, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { useFocusTrap } from "../useFocusTrap";
import { useLufia } from "../LufiaProvider";
import { CloseGlyph } from "./icons";
import { NavSurfaceContext } from "./navigation";
import { usePresence } from "./usePresence";
import { useSheetDrag } from "./useSheetDrag";
import styles from "./NavSheet.module.css";

export type NavSheetProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Next to the close button: a brand or a title. */
  header?: ReactNode;
  /** Below the scrolling body, pinned to the bottom: account and help links. */
  footer?: ReactNode;
  /** Accessible name of the close button. Defaults to the provider's `close` label. */
  closeLabel?: string;
  /** Let the grabber and header be dragged down to dismiss. Default `true`. */
  swipeToDismiss?: boolean;
  /** Where the sheet is mounted. Defaults to `document.body`, so the rest of the page can be made inert. */
  container?: HTMLElement | null;
  children: ReactNode;
};

const subscribeNothing = () => () => {};

/**
 * A modal bottom sheet that holds the app's navigation on a phone. It rises from the bottom edge, dims the page, traps
 * focus, closes on Escape, on a tap on the dimmed page, and on a swipe down from the grabber or header. The page behind
 * is inert and cannot scroll. Focus lands on the sheet itself when it opens and returns to the control that opened it.
 *
 * Under `prefers-reduced-motion` it appears and disappears at once; dragging still follows the finger.
 */
export function NavSheet({
  open,
  onOpenChange,
  label,
  header,
  footer,
  closeLabel,
  swipeToDismiss = true,
  container,
  className,
  children,
  ...rest
}: NavSheetProps) {
  const { labels } = useLufia();
  const panel = useRef<HTMLDivElement>(null);
  const client = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const { phase, finish } = usePresence(open, panel);

  const close = () => onOpenChange(false);
  useFocusTrap(phase === "open", panel, { onEscape: close, inertBackground: true });
  useBodyScrollLock(phase !== "unmounted");
  const drag = useSheetDrag(close, swipeToDismiss);

  const target = container ?? (client ? document.body : null);
  if (phase === "unmounted" || !target) return null;

  return createPortal(
    <NavSurfaceContext.Provider value={{ collapsed: false }}>
      <div className={styles.root} data-state={phase === "open" ? "open" : "closed"}>
        <div className={styles.backdrop} onClick={close} aria-hidden="true" />
        <div
          {...rest}
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className={[styles.panel, className].filter(Boolean).join(" ")}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) finish();
          }}
        >
          <div
            className={styles.dragZone}
            data-swipe={swipeToDismiss || undefined}
            {...(swipeToDismiss ? drag : {})}
          >
            <span className={styles.grabber} aria-hidden="true" />
            <div className={styles.head}>
              <div className={styles.headContent}>{header}</div>
              <button
                type="button"
                className={styles.close}
                aria-label={closeLabel ?? labels.close}
                onClick={close}
              >
                <CloseGlyph />
              </button>
            </div>
          </div>
          <div className={styles.body}>{children}</div>
          {footer ? <div className={styles.foot}>{footer}</div> : null}
        </div>
      </div>
    </NavSurfaceContext.Provider>,
    target,
  );
}
