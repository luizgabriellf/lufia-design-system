"use client";

import {
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { useFocusTrap } from "../useFocusTrap";
import { useLufia } from "../LufiaProvider";
import { useNativeDialog } from "../Modal/useNativeDialog";
import { CloseIcon } from "../Icon/icons";
import { NavSurfaceContext } from "./navSurface";
import { usePresence } from "../internal/usePresence";
import { useNavScrollHints } from "./useNavScrollHints";
import { useSheetBodyDrag } from "./useSheetBodyDrag";
import { useSheetDrag, type SheetDragThreshold } from "./useSheetDrag";
import type { ShellDataAttributes } from "./navigation";
import styles from "./NavSheet.module.css";

/** A class and `data-*` attributes for the sheet's outermost layer. */
export type NavSheetLayerProps = { className?: string } & ShellDataAttributes;

export type NavSheetProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Next to the close button: a brand or a title. */
  header?: ReactNode;
  /** Below the scrolling body, pinned to the bottom: account and help links. */
  footer?: ReactNode;
  /**
   * Under the brand and close row, outside the scrolling body: the workspace, company or account the person is in, and its
   * switcher. It stays in view while the navigation scrolls, and a divider keeps it apart from the first item. A tall one
   * is capped (30% of the viewport) and scrolls on its own, so the navigation always keeps a usable height.
   */
  context?: ReactNode;
  /** Accessible name of the close button. Defaults to the provider's `close` label. */
  closeLabel?: string;
  /** Let the grabber and header be dragged down to dismiss, and the body too while it is scrolled to the top. Default `true`. */
  swipeToDismiss?: boolean;
  /**
   * When a released drag dismisses the sheet: a share of its height kept between a shortest and a longest distance, or a
   * quick flick. Each field you leave out keeps its default (`SHEET_DRAG_THRESHOLD`: 18% of the height, kept between
   * 64 and 112 pixels; a flick of 0.6 px/ms over 24 pixels). Applies to the grabber, the header and the body alike.
   */
  dragThreshold?: SheetDragThreshold;
  /**
   * Close the sheet when a link inside it is followed (a plain click on an `<a href>` in the body or footer; not an
   * open-in-new-tab click). `AppShell` turns it on so footer and slot links behave like the navigation's own. Default `false`.
   */
  closeOnNavigate?: boolean;
  /** Where the sheet is mounted. Defaults to `document.body`, so the rest of the page can be made inert. */
  container?: HTMLElement | null;
  /**
   * A class and `data-*` attributes for the outermost layer: the fixed root that holds the backdrop and the panel, or the
   * `<dialog>` with `renderAs="dialog"`. The sheet is portalled out of the app's tree, so a palette an app scopes to a class
   * or a `data-*` attribute on its own wrapper does not reach it: put the same class or attribute here. The theme
   * attributes `data-lufia-theme` and `data-lufia-mode` work too.
   */
  layerProps?: NavSheetLayerProps;
  /**
   * An element inside the app's tree (`AppShell` passes its `<main>`). While the sheet is shown, its layer copies
   * `data-lufia-theme` and `data-lufia-mode` from the closest ancestor of that element that sets them (not from `<html>`,
   * which already applies everywhere), so a theme or mode scoped to part of the page reaches the portalled sheet.
   * Attributes given in `layerProps` win.
   */
  inheritThemeFrom?: RefObject<HTMLElement | null>;
  /**
   * `portal` (default) renders a fixed-position layer in a portal, with an animated exit. `dialog` renders a native
   * `<dialog>` opened with `showModal()`, so the sheet sits in the browser's top layer; the page behind is made inert by the
   * browser, the backdrop is the native `::backdrop` and the exit is immediate. Focus trap, Escape, scroll lock, swipe to
   * dismiss and the layer stack work the same in both.
   */
  renderAs?: "portal" | "dialog";
  /**
   * A control bar kept in place at the bottom of the screen, above the sheet, while it is shown: `AppShell` passes its
   * floating bar, with the menu button turned into the close button. It is part of the dialog (inside the focus trap,
   * after the sheet's own content), it does not move with a drag, and the end of the sheet keeps clear of it
   * (`--lufia-nav-sheet-dock-clearance`). With a dock the header has no close button of its own: put one in the dock.
   */
  dock?: ReactNode;
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
    <div ref={body} className={styles.body} data-sheet-body="" onClick={onClick}>
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
 *
 * With a `dock` (the shell's floating bar, its menu button turned into a close button) the bar stays in place on top of
 * the sheet, inside the dialog, and the sheet has no close button of its own.
 */
export function NavSheet({
  open,
  onOpenChange,
  label,
  header,
  footer,
  context,
  closeLabel,
  swipeToDismiss = true,
  dragThreshold,
  closeOnNavigate = false,
  container,
  layerProps,
  inheritThemeFrom,
  renderAs = "portal",
  dock,
  className,
  children,
  ...rest
}: NavSheetProps) {
  const { labels } = useLufia();
  // The panel is a `div` in portal mode and a `dialog` in native mode; the intersection lets one ref serve both.
  const panel = useRef<HTMLDivElement & HTMLDialogElement>(null);
  const native = renderAs === "dialog";
  const layer = useRef<HTMLDivElement>(null);
  const docked = dock !== undefined && dock !== null && dock !== false;
  // With a dock, the native dialog is a full-screen layer that holds the sheet and the dock, so the dock stays out of the
  // sheet's transform. Without one, the dialog is the sheet itself, as before.
  const nativeLayer = useRef<HTMLDialogElement>(null);
  const dialog = native && docked ? nativeLayer : panel;
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
  const nativeDialog = useNativeDialog(dialog, native && open && client, {
    onCloseRequest: close,
    // Docked, the sheet's own props go to the inner panel, which handles them itself.
    handlers: docked ? undefined : { onClick: rest.onClick, onPointerDown: rest.onPointerDown },
  });
  // Docked, the whole layer is the dialog: Tab reaches the dock, and focus starts on the layer.
  useFocusTrap(trapped, docked ? (native ? nativeLayer : layer) : panel, {
    onEscape: close,
    inertBackground: !native,
    restoreFocus: !native,
  });
  useBodyScrollLock(shown);
  const drag = useSheetDrag(close, swipeToDismiss, dragThreshold);
  // The panel exists once the sheet is shown and has somewhere to mount (not before the first client render).
  useSheetBodyDrag(panel, swipeToDismiss && shown && Boolean(container ?? client), close, dragThreshold);
  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    // A router's link prevents the default itself, so `defaultPrevented` says nothing about whether it navigates.
    if (!closeOnNavigate) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
    close();
  };

  // Copy a scoped theme or mode onto the portalled layer before paint, each time the sheet is shown.
  const layerTheme = layerProps?.["data-lufia-theme"];
  const layerMode = layerProps?.["data-lufia-mode"];
  useLayoutEffect(() => {
    const element = native ? dialog.current : layer.current;
    const source = inheritThemeFrom?.current;
    if (!shown || !element || !source) return;
    const copy = (attribute: "data-lufia-theme" | "data-lufia-mode", own: unknown) => {
      if (own !== undefined) return;
      const scope = source.parentElement?.closest(`[${attribute}]`);
      const value = scope && scope !== document.documentElement ? scope.getAttribute(attribute) : null;
      if (value) element.setAttribute(attribute, value);
      else element.removeAttribute(attribute);
    };
    copy("data-lufia-theme", layerTheme);
    copy("data-lufia-mode", layerMode);
  }, [shown, native, dialog, inheritThemeFrom, layerTheme, layerMode]);

  const target = container ?? (client ? document.body : null);
  const { className: layerClassName, ...layerData } = layerProps ?? {};
  if (!shown || !target) return null;

  const sheet = (
    <>
      <div
        className={styles.dragZone}
        data-swipe={swipeToDismiss || undefined}
        {...(swipeToDismiss ? drag : {})}
      >
        <span className={styles.grabber} aria-hidden="true" />
        {docked && !header ? null : (
          <div className={styles.head}>
            <div className={styles.headContent}>{header}</div>
            {docked ? null : (
              <button
                type="button"
                className={styles.close}
                aria-label={closeLabel ?? labels.close}
                onClick={close}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
      </div>
      {context !== undefined && context !== null && context !== false ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegates clicks of the links inside
        <div className={styles.context} data-lufia-part="nav-sheet-context" onClick={closeOnLink}>
          {context}
        </div>
      ) : null}
      <SheetBody onClick={closeOnLink}>{children}</SheetBody>
      {footer ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegates clicks of the links inside
        <div className={styles.foot} onClick={closeOnLink}>
          {footer}
        </div>
      ) : null}
    </>
  );

  const dockLayer = docked ? (
    <div className={styles.dock} data-lufia-part="nav-sheet-dock">
      {dock}
    </div>
  ) : null;

  if (native && docked) {
    return createPortal(
      <NavSurfaceContext.Provider value={{ collapsed: false, surface: "sheet" }}>
        <dialog
          {...layerData}
          {...nativeDialog}
          ref={nativeLayer}
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          data-state="open"
          data-docked=""
          data-lufia-part="nav-sheet-layer"
          className={[styles.nativeLayer, layerClassName].filter(Boolean).join(" ")}
        >
          <div
            className={styles.backdrop}
            onClick={close}
            aria-hidden="true"
            data-lufia-part="nav-sheet-backdrop"
          />
          <div
            {...rest}
            ref={panel}
            data-lufia-part="nav-sheet"
            data-docked=""
            className={[styles.panel, className].filter(Boolean).join(" ")}
          >
            {sheet}
          </div>
          {dockLayer}
        </dialog>
      </NavSurfaceContext.Provider>,
      target,
    );
  }

  if (native) {
    return createPortal(
      <NavSurfaceContext.Provider value={{ collapsed: false, surface: "sheet" }}>
        <dialog
          {...(rest as HTMLAttributes<HTMLDialogElement>)}
          {...layerData}
          {...nativeDialog}
          ref={panel}
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          data-state="open"
          data-lufia-part="nav-sheet"
          className={[styles.panel, styles.native, layerClassName, className].filter(Boolean).join(" ")}
        >
          {sheet}
        </dialog>
      </NavSurfaceContext.Provider>,
      target,
    );
  }

  return createPortal(
    <NavSurfaceContext.Provider value={{ collapsed: false, surface: "sheet" }}>
      <div
        {...layerData}
        ref={layer}
        className={[styles.root, layerClassName].filter(Boolean).join(" ")}
        data-state={phase === "open" ? "open" : "closed"}
        data-docked={docked || undefined}
        data-lufia-part="nav-sheet-layer"
        // Docked, the layer is the dialog, so the dock (outside the sheet's transform) is inside it.
        {...(docked ? { role: "dialog", "aria-modal": true, "aria-label": label, tabIndex: -1 } : {})}
      >
        <div
          className={styles.backdrop}
          onClick={close}
          aria-hidden="true"
          data-lufia-part="nav-sheet-backdrop"
        />
        <div
          {...rest}
          ref={panel}
          role={docked ? undefined : "dialog"}
          aria-modal={docked ? undefined : "true"}
          aria-label={docked ? undefined : label}
          tabIndex={-1}
          data-lufia-part="nav-sheet"
          data-docked={docked || undefined}
          className={[styles.panel, className].filter(Boolean).join(" ")}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) finish();
          }}
        >
          {sheet}
        </div>
        {dockLayer}
      </div>
    </NavSurfaceContext.Provider>,
    target,
  );
}
