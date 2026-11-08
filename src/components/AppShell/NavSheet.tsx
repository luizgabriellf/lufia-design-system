"use client";

import { useRef, useSyncExternalStore, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { useFocusTrap } from "../useFocusTrap";
import { useLufia } from "../LufiaProvider";
import { useNativeDialog } from "../Modal/useNativeDialog";
import { CloseGlyph } from "./icons";
import { NavSurfaceContext } from "./navigation";
import { usePresence } from "../internal/usePresence";
import { useNavScrollHints } from "./useNavScrollHints";
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
  /**
   * Close the sheet when a link inside it is followed (a plain click on an `<a href>` in the body or footer; not an
   * open-in-new-tab click). `AppShell` turns it on so footer and slot links behave like the navigation's own. Default `false`.
   */
  closeOnNavigate?: boolean;
  /** Where the sheet is mounted. Defaults to `document.body`, so the rest of the page can be made inert. */
  container?: HTMLElement | null;
  /**
   * `portal` (default) renders a fixed-position layer in a portal, with an animated exit. `dialog` renders a native
   * `<dialog>` opened with `showModal()`, so the sheet sits in the browser's top layer; the page behind is made inert by the
   * browser, the backdrop is the native `::backdrop` and the exit is immediate. Focus trap, Escape, scroll lock, swipe to
   * dismiss and the layer stack work the same in both.
   */
  renderAs?: "portal" | "dialog";
  children: ReactNode;
};

const subscribeNothing = () => () => {};

/** The scrolling body: it mounts with the sheet, so the scroll hints start when the sheet opens. */
function SheetBody({
  onClick,
  children,
}: {
  onClick: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}) {
  const body = useRef<HTMLDivElement>(null);
  useNavScrollHints(body);
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegates clicks of the links inside
    <div ref={body} className={styles.body} onClick={onClick}>
      {children}
    </div>
  );
}

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
  closeOnNavigate = false,
  container,
  renderAs = "portal",
  className,
  children,
  ...rest
}: NavSheetProps) {
  const { labels } = useLufia();
  // The panel is a `div` in portal mode and a `dialog` in native mode; the intersection lets one ref serve both.
  const panel = useRef<HTMLDivElement & HTMLDialogElement>(null);
  const native = renderAs === "dialog";
  const client = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const { phase, finish } = usePresence(open, panel);

  const close = () => onOpenChange(false);
  // A native dialog is shown for exactly as long as `open`; a portal sheet also stays for its exit animation.
  const shown = native ? open : phase !== "unmounted";
  const trapped = native ? open : phase === "open";
  const nativeDialog = useNativeDialog(panel, native && open && client, {
    onCloseRequest: close,
    handlers: { onClick: rest.onClick, onPointerDown: rest.onPointerDown },
  });
  useFocusTrap(trapped, panel, { onEscape: close, inertBackground: !native, restoreFocus: !native });
  useBodyScrollLock(shown);
  const drag = useSheetDrag(close, swipeToDismiss);
  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    // A router's link prevents the default itself, so `defaultPrevented` says nothing about whether it navigates.
    if (!closeOnNavigate) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
    close();
  };

  const target = container ?? (client ? document.body : null);
  if (!shown || !target) return null;

  const sheet = (
    <>
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
      <SheetBody onClick={closeOnLink}>{children}</SheetBody>
      {footer ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegates clicks of the links inside
        <div className={styles.foot} onClick={closeOnLink}>
          {footer}
        </div>
      ) : null}
    </>
  );

  if (native) {
    return createPortal(
      <NavSurfaceContext.Provider value={{ collapsed: false, surface: "sheet" }}>
        <dialog
          {...(rest as HTMLAttributes<HTMLDialogElement>)}
          {...nativeDialog}
          ref={panel}
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          data-state="open"
          className={[styles.panel, styles.native, className].filter(Boolean).join(" ")}
        >
          {sheet}
        </dialog>
      </NavSurfaceContext.Provider>,
      target,
    );
  }

  return createPortal(
    <NavSurfaceContext.Provider value={{ collapsed: false, surface: "sheet" }}>
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
          {sheet}
        </div>
      </div>
    </NavSurfaceContext.Provider>,
    target,
  );
}
