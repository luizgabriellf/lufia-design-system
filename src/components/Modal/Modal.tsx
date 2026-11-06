"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Reveal } from "../../motion/Reveal";
import { useLufia } from "../LufiaProvider";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { useFocusTrap } from "../useFocusTrap";
import { useMediaQuery } from "../useMediaQuery";
import styles from "./Modal.module.css";

export type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_STEPS: readonly string[] = ["sm", "md", "lg", "xl"];

export type ModalProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "role"> & {
  /** Whether the modal is shown. Controlled: the modal never closes itself, it calls `onClose`. */
  open: boolean;
  /** Called when the person asks to close: the close button, Escape, or a click outside (see the policy props). */
  onClose: () => void;
  /** The dialog's accessible name and visible heading. */
  title: ReactNode;
  /** Optional supporting text, wired to `aria-describedby`. */
  description?: ReactNode;
  /**
   * Maximum width on screens wider than a phone: a step, or any CSS length for a custom maximum inline size
   * (`"62rem"`, `"min(100%, 70ch)"`). On a phone every size is a sheet. Default `md`.
   */
  size?: ModalSize | (string & {});
  /** Which edge the phone sheet is anchored to. `bottom` (default) rises from the bottom; `top` hangs from `--lufia-modal-sheet-offset`. */
  sheetPlacement?: "bottom" | "top";
  /** `wrap` (default) lets a long title wrap onto several lines; `ellipsis` keeps it on one line and truncates it. */
  titleWrap?: "wrap" | "ellipsis";
  /** Scroll the body between the fixed header and footer and show an edge shadow where more content is hidden. */
  scrollShadow?: boolean;
  /**
   * Keep the content mounted while the modal is closed, so typed input and component state survive. The closed modal is
   * hidden and inert; it has no exit animation.
   */
  keepMounted?: boolean;
  /**
   * `portal` (default) renders a fixed-position layer in a portal. `dialog` renders a native `<dialog>` opened with
   * `showModal()`, which sits in the browser's top layer above everything, including other fixed layers. Focus trap, Escape,
   * scroll lock and the shared layer stack behave the same in both. Differences in `dialog` mode: the page behind is made
   * inert by the browser, not by the package; the exit is not animated; the backdrop is the native `::backdrop`.
   */
  renderAs?: "portal" | "dialog";
  /** Extra controls placed beside the close button in the header. */
  headerAction?: ReactNode;
  /** Content of the footer bar, usually the actions. The bar is left out when this is empty. */
  footer?: ReactNode;
  /** Accessible name of the close button. Defaults to the provider's `labels.close`. */
  closeLabel?: string;
  /** Leave out the close button, e.g. when the footer already offers the way out. Escape and outside click still apply. */
  hideCloseButton?: boolean;
  /**
   * An action that dismissing would not abort is in flight. Sets `aria-busy`, disables the close button and refuses every
   * dismissal (Escape, outside click, the close button), so a refused dismissal is perceivable and not a silent no-op.
   */
  busy?: boolean;
  /** Escape calls `onClose`. Default `true`. */
  closeOnEscape?: boolean;
  /** A click on the backdrop calls `onClose`. Default `true`. Turn it off for forms with unsaved input. */
  closeOnOutsideClick?: boolean;
  /** Where focus lands on open. Default: the dialog itself (named by the title, no keyboard pops up). */
  initialFocus?: "container" | "first" | RefObject<HTMLElement | null>;
  /** `alertdialog` for an interruption that needs an answer (see `ConfirmDialog`). Default `dialog`. */
  role?: "dialog" | "alertdialog";
  /** Where the modal is portaled. Defaults to `document.body`. Pass an element of the same document, for example a preview frame; a container inside another document (an iframe) is not supported. */
  container?: Element | DocumentFragment | null;
  /** Inner scroll containers to lock instead of the document, for app shells that scroll an inner pane. */
  scrollContainerSelectors?: readonly string[];
};

const noSubscription = () => () => {};
const PHONE = "(max-width: 37.5rem)";

/**
 * A modal dialog in a portal. Traps focus, locks page scroll, makes the page behind inert, restores focus to the trigger on
 * close, and enters and leaves with the package's motion (scale on larger screens, a sheet rising from the bottom on phones).
 *
 * Follows the WAI-ARIA APG Dialog (Modal) pattern; with `role="alertdialog"`, the Alert Dialog pattern.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  sheetPlacement = "bottom",
  titleWrap = "wrap",
  scrollShadow = false,
  keepMounted = false,
  renderAs = "portal",
  headerAction,
  footer,
  closeLabel,
  hideCloseButton = false,
  busy = false,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  initialFocus = "container",
  role = "dialog",
  scrollContainerSelectors,
  container,
  className,
  style,
  children,
  ...rest
}: ModalProps) {
  const { labels } = useLufia();
  const titleId = useId();
  const descriptionId = useId();
  // The panel is a `div` in portal mode and a `dialog` in native mode; the intersection lets one ref serve both.
  const panelRef = useRef<HTMLDivElement & HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const phone = useMediaQuery(PHONE);
  const native = renderAs === "dialog";
  // The portal target exists only on the client: false during SSR and hydration.
  const mounted = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const visible = mounted && open;

  // Declared before the focus trap so the native dialog is open (and focusable) when the trap moves focus into it.
  useLayoutEffect(() => {
    const dialog = panelRef.current;
    if (!native || !visible || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      // The browser restores focus on close too; this covers an opener that was re-rendered in the meantime.
      const active = document.activeElement;
      if (previous?.isConnected && (!active || active === document.body || dialog.contains(active)))
        previous.focus({ preventScroll: true });
    };
  }, [native, visible]);

  useBodyScrollLock(visible, { scrollContainerSelectors });
  useFocusTrap(visible, panelRef, {
    onEscape: closeOnEscape && !busy ? onClose : undefined,
    initialFocus,
    inertBackground: !native,
    restoreFocus: !native,
  });

  if (!mounted) return null;

  const requestClose = () => {
    if (!busy) onClose();
  };

  const customSize = SIZE_STEPS.includes(size) ? undefined : size;
  const panelProps = {
    ...rest,
    role,
    "aria-modal": true,
    "aria-labelledby": titleId,
    "aria-describedby": description ? descriptionId : rest["aria-describedby"],
    "aria-busy": busy || undefined,
    inert: !open,
    tabIndex: -1,
    "data-size": customSize ? "custom" : size,
    "data-state": open ? "open" : "closed",
    "data-sheet": sheetPlacement,
    "data-title-wrap": titleWrap,
    "data-scroll-shadow": scrollShadow ? "" : undefined,
    style: customSize ? ({ ...style, "--lufia-modal-size": customSize } as CSSProperties) : style,
    className: [styles.panel, native ? styles.native : null, className].filter(Boolean).join(" "),
  };

  // A scrolling region must be reachable by keyboard (WCAG 2.1.1), so the body gets a tab stop only when it scrolls.
  const bodyProps = scrollShadow ? { tabIndex: 0 } : {};

  const content = (
    <>
      <header className={styles.header}>
        <h2
          id={titleId}
          className={styles.title}
          title={titleWrap === "ellipsis" && typeof title === "string" ? title : undefined}
        >
          {title}
        </h2>
        <div className={styles.headerActions}>
          {headerAction}
          {hideCloseButton ? null : (
            <button
              type="button"
              className={styles.close}
              aria-label={closeLabel ?? labels.close}
              disabled={busy}
              onClick={requestClose}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path
                  d="m3.5 3.5 9 9m0-9-9 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </header>
      <div className={styles.body} {...bodyProps}>
        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </>
  );

  const target = container ?? document.body;

  if (native) {
    if (!open && !keepMounted) return null;
    const outside = (event: { clientX: number; clientY: number }) => {
      const rect = panelRef.current?.getBoundingClientRect();
      return (
        !!rect &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom)
      );
    };
    return createPortal(
      // The click is the native backdrop's (it targets the dialog itself); Escape is handled by the layer stack.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <dialog
        {...(panelProps as HTMLAttributes<HTMLDialogElement>)}
        ref={panelRef}
        onCancel={(event) => {
          // Escape is handled by the layer stack; a close request that arrives without a key (a platform back gesture) lands here.
          event.preventDefault();
          if (closeOnEscape) requestClose();
        }}
        onPointerDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget && outside(event);
        }}
        onClick={(event) => {
          // The native backdrop reports clicks on the dialog itself; only a press that began outside the panel counts.
          if (pressedBackdrop.current && closeOnOutsideClick && outside(event)) requestClose();
          pressedBackdrop.current = false;
        }}
      >
        {content}
      </dialog>,
      target,
    );
  }

  if (keepMounted) {
    return createPortal(
      <div className={styles.layer}>
        <div
          className={styles.backdrop}
          data-state={open ? "open" : "closed"}
          hidden={!open}
          aria-hidden="true"
          onPointerDown={() => {
            pressedBackdrop.current = true;
          }}
          onClick={() => {
            if (pressedBackdrop.current && closeOnOutsideClick) requestClose();
            pressedBackdrop.current = false;
          }}
        />
        <div className={styles.frame} data-sheet={sheetPlacement} hidden={!open}>
          <div {...(panelProps as HTMLAttributes<HTMLDivElement>)} ref={panelRef} data-kept="" hidden={!open}>
            {content}
          </div>
        </div>
      </div>,
      target,
    );
  }

  return createPortal(
    <div className={styles.layer}>
      <Reveal
        show={open}
        appear
        variant="fade"
        className={styles.backdrop}
        aria-hidden="true"
        onPointerDown={() => {
          pressedBackdrop.current = true;
        }}
        onClick={() => {
          // Only a press that began on the backdrop counts: a text selection that ends there must not close the dialog.
          if (pressedBackdrop.current && closeOnOutsideClick) requestClose();
          pressedBackdrop.current = false;
        }}
      />
      <Reveal
        show={open}
        appear
        variant={phone ? "rise" : "scale"}
        className={styles.frame}
        data-sheet={sheetPlacement}
      >
        <div {...(panelProps as HTMLAttributes<HTMLDivElement>)} ref={panelRef}>
          {content}
        </div>
      </Reveal>
    </div>,
    target,
  );
}
