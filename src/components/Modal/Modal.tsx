"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
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
import { useTopModalDialog } from "./topModalDialog";
import { useHeaderBlockSize } from "./useHeaderBlockSize";
import { useNativeDialog } from "./useNativeDialog";
import { useMediaQuery } from "../useMediaQuery";
import styles from "./Modal.module.css";

export type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_STEPS: readonly string[] = ["sm", "md", "lg", "xl"];

/** The parts of a `Modal` that accept an extra class name. */
export type ModalClassNames = {
  /** The wrapper around the backdrop and the frame (portal mode only). */
  layer?: string;
  /** The backdrop (portal mode only; native `dialog` mode uses `::backdrop`). */
  backdrop?: string;
  /** The positioning frame around the panel (portal mode only). */
  frame?: string;
  /** The dialog panel. Added after the root `className`. */
  panel?: string;
  header?: string;
  title?: string;
  /** The supporting text under the title, when `description` is set. */
  description?: string;
  body?: string;
  footer?: string;
  /** The close button. */
  close?: string;
};

const cx = (...names: (string | null | undefined | false)[]) => names.filter(Boolean).join(" ");

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
  /**
   * Extra class names for the parts, for an app that attaches its own styles or test selectors. Every part also carries a
   * stable `data-lufia-part` attribute: `layer`, `backdrop`, `frame`, `panel`, `header`, `title`, `description`, `body`, `footer`, `close`.
   */
  classNames?: ModalClassNames;
  /** Extra controls placed beside the close button in the header. */
  headerAction?: ReactNode;
  /** Content of the footer bar, usually the actions. The bar is left out when this is empty. */
  footer?: ReactNode;
  /**
   * How the footer actions are laid out on a narrow phone (30rem and below). `row` (default) keeps them side by side in
   * DOM order, so the primary action goes last, at the inline end; text actions grow to fill the bar and wrap if their
   * labels cannot fit, while icon-only triggers keep their size. `stack` puts them in a full-width column, primary on top.
   */
  footerLayout?: "row" | "stack";
  /**
   * Up to which width `footerLayout="stack"` stacks the actions. `narrow` (default) stacks at 30rem (480px) and below;
   * `sheet` stacks at 37.5rem (600px) and below, the width where the dialog becomes a bottom sheet, so a footer with long
   * labels never sits side by side in a sheet. Ignored with `footerLayout="row"`.
   */
  footerStackAt?: "narrow" | "sheet";
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
 *
 * The panel publishes the height its sticky header covers as `--lufia-modal-header-block-size`, kept current with a
 * `ResizeObserver`, so sticky content in the body can use `top: var(--lufia-modal-header-block-size, 0px)` instead of a
 * hand-tuned number. It is `0px` with `scrollShadow`, where the body scrolls below the header.
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
  footerLayout = "row",
  footerStackAt = "narrow",
  closeLabel,
  hideCloseButton = false,
  busy = false,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  initialFocus = "container",
  role = "dialog",
  scrollContainerSelectors,
  container,
  classNames,
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
  const headerRef = useRef<HTMLElement>(null);
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
  // A portal layer outside the top layer would sit behind an open native dialog and, with the page made inert, leave both
  // unusable. Opened over one, it renders inside that dialog instead (unless the caller chose a `container`).
  const liveHost = useTopModalDialog(!native && container === undefined && open);
  // Kept while closing, so the exit animation does not move the layer.
  const [hostDialog, setHostDialog] = useState<HTMLDialogElement | null>(null);
  if (open && liveHost !== hostDialog) setHostDialog(liveHost);

  // The portal layer exists only while the modal is open or its exit is still playing. A layer left in `body` while closed
  // would be made inert by any other modal that opens, and a modal opening inside it later would stay unusable.
  const [layerPresent, setLayerPresent] = useState(open);
  if (open && !layerPresent) setLayerPresent(true);
  const exited = useRef(new Set<string>());
  useEffect(() => {
    if (open) exited.current.clear();
  }, [open]);
  const onPartExited = (part: string) => {
    exited.current.add(part);
    if (exited.current.size >= 2) setLayerPresent(false);
  };

  const requestClose = () => {
    if (!busy) onClose();
  };
  // Declared before the focus trap so the native dialog is open (and focusable) when the trap moves focus into it.
  const nativeDialog = useNativeDialog(panelRef, native && visible, {
    onCloseRequest: requestClose,
    closeOnCancel: closeOnEscape,
    closeOnOutsideClick,
    handlers: { onClick: rest.onClick, onPointerDown: rest.onPointerDown },
  });

  useHeaderBlockSize(panelRef, headerRef, {
    watch: mounted && (open || keepMounted),
    overlaps: !scrollShadow,
    target: container ?? hostDialog,
  });
  useBodyScrollLock(visible, { scrollContainerSelectors });
  useFocusTrap(visible, panelRef, {
    onEscape: closeOnEscape && !busy ? onClose : undefined,
    initialFocus,
    inertBackground: !native,
    restoreFocus: !native,
  });

  if (!mounted) return null;

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
    "data-lufia-part": "panel",
    className: cx(styles.panel, native && styles.native, className, classNames?.panel),
  };

  // A scrolling region must be reachable by keyboard (WCAG 2.1.1), so the body gets a tab stop only when it scrolls.
  const bodyProps = scrollShadow ? { tabIndex: 0 } : {};

  const content = (
    <>
      <header ref={headerRef} className={cx(styles.header, classNames?.header)} data-lufia-part="header">
        <h2
          id={titleId}
          className={cx(styles.title, classNames?.title)}
          data-lufia-part="title"
          title={titleWrap === "ellipsis" && typeof title === "string" ? title : undefined}
        >
          {title}
        </h2>
        <div className={styles.headerActions}>
          {headerAction}
          {hideCloseButton ? null : (
            <button
              type="button"
              className={cx(styles.close, classNames?.close)}
              data-lufia-part="close"
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
      <div className={cx(styles.body, classNames?.body)} data-lufia-part="body" {...bodyProps}>
        {description ? (
          <p
            id={descriptionId}
            className={cx(styles.description, classNames?.description)}
            data-lufia-part="description"
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {footer ? (
        <footer
          className={cx(styles.footer, classNames?.footer)}
          data-lufia-part="footer"
          data-footer-layout={footerLayout}
          data-footer-stack-at={footerLayout === "stack" ? footerStackAt : undefined}
        >
          {footer}
        </footer>
      ) : null}
    </>
  );

  const target = container ?? hostDialog ?? document.body;

  if (native) {
    if (!open && !keepMounted) return null;
    return createPortal(
      <dialog {...(panelProps as HTMLAttributes<HTMLDialogElement>)} ref={panelRef} {...nativeDialog}>
        {content}
      </dialog>,
      target,
    );
  }

  if (keepMounted) {
    return createPortal(
      <div className={cx(styles.layer, classNames?.layer)} data-lufia-part="layer">
        <div
          className={cx(styles.backdrop, classNames?.backdrop)}
          data-lufia-part="backdrop"
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
        <div
          className={cx(styles.frame, classNames?.frame)}
          data-lufia-part="frame"
          data-sheet={sheetPlacement}
          hidden={!open}
        >
          <div {...(panelProps as HTMLAttributes<HTMLDivElement>)} ref={panelRef} data-kept="" hidden={!open}>
            {content}
          </div>
        </div>
      </div>,
      target,
    );
  }

  if (!open && !layerPresent) return null;

  return createPortal(
    <div className={cx(styles.layer, classNames?.layer)} data-lufia-part="layer">
      <Reveal
        show={open}
        appear
        variant="fade"
        onExited={() => onPartExited("backdrop")}
        className={cx(styles.backdrop, classNames?.backdrop)}
        data-lufia-part="backdrop"
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
        onExited={() => onPartExited("frame")}
        className={cx(styles.frame, classNames?.frame)}
        data-lufia-part="frame"
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
