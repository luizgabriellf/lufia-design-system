"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../motion";
import { Button } from "../Button";
import { CloseIcon } from "../Icon/icons";
import { IconButton } from "../IconButton";
import { clearPanelPlacement, placePanel } from "../internal/useAnchoredPosition";
import { inheritContext, portalHost } from "../internal/portalContext";
import type { Side } from "../internal/placement";
import { usePresence } from "../internal/usePresence";
import { isTopLayer, pushLayer, removeLayer } from "../useFocusTrap/layerStack";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Tour.module.css";

export type TourStep = {
  /**
   * What the step points at: a CSS selector (the first visible match is used) or a ref. Without one, or when nothing
   * visible matches, the step is a card in the middle of the screen. The target is looked up again on every frame, so a
   * step whose target appears later moves to it.
   */
  target?: string | RefObject<Element | null>;
  title: ReactNode;
  body: ReactNode;
  /** Which side of the target the card opens on. It flips to the opposite side when it does not fit. Default `bottom`. */
  placement?: Side;
  /**
   * `read` (default): the person reads the card and moves on with the next button. `do`: the person has to act on the target
   * first, so the next (or finish) button is hidden, the arrow keys do not move forward, and `labels.doHint` is shown. The
   * host moves on by changing `stepIndex` when the action is done, or the person skips from the card.
   */
  mode?: "read" | "do";
  /** Shown in place of `body` when the host reports this step's target as `missing`. Falls back to `body`. */
  missingBody?: ReactNode;
  /** Appended to `body` when the resolved target is a stand-in for the real one (see `isStandIn`). */
  standInNote?: ReactNode;
};

/**
 * What the host knows about the current step's target. `ready`: it is there (the default). `seeking`: the host is still
 * looking for it or opening the part of the screen that holds it. `missing`: it is not there. `blocked`: it is not there
 * because something else (an open modal, say) is in the way. The tour does not find out by itself: it only shows the state.
 */
export type TourTargetStatus = "ready" | "seeking" | "missing" | "blocked";

/** Opt-in layout for a target inside an open modal `dialog`. Every switch defaults to `false`. */
export type TourDialogLayout = {
  /**
   * On a narrow screen, resize the host modal (a `Modal` or a native dialog) to the viewport minus the card's height and
   * lift it clear of the card, so the card sits below it instead of covering it, and reserve room for its own header and
   * footer when scrolling the target into view. Only the modal is resized; a wrapper that fills a custom dialog opts in
   * with a `data-lufia-tour-shell` attribute.
   */
  dock?: boolean;
  /** On a wide screen, put the card beside the dialog (when there is room) instead of over the dialog's content. */
  beside?: boolean;
  /** Cut the spotlight off where the dialog's own scroll area ends. */
  clipSpotlight?: boolean;
};

export type TourLabels = {
  next: string;
  back: string;
  /**
   * Leaves the tour (`onClose("skip")`). Shown on every step but the last, and on the last one when `skipOnLastStep` is set
   * or when a `do` step would otherwise have no way out (see `skipOnLastStep`).
   */
  skip: string;
  /** Accessible name of the close button. */
  close: string;
  /** The action of the last step, in place of `next`. */
  finish: string;
  /** The step counter, such as "Step 2 of 5". Shown on the card and announced politely when the step changes. */
  stepOf: (current: number, total: number) => string;
  /** Shown on a `do` step while its target is ready, such as "Do this on the screen to continue". */
  doHint?: string;
  /** The button of a `do` step whose target is missing, in place of `next` (the last step still says `finish`). */
  skipStep?: string;
  /** Appended to the body while the target status is `seeking`, such as "Opening this part of the screen…". */
  seeking?: string;
  /** The body while the target status is `blocked`, such as "Close the open window to see this part". */
  blocked?: string;
};

/** Why `onClose` was called: the skip button, the close button, or the Escape key. */
export type TourCloseReason = "skip" | "close" | "escape";

export type TourProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "role" | "title"> & {
  steps: readonly TourStep[];
  /** Whether the tour is showing. The app decides when it starts and remembers that it was seen. */
  open: boolean;
  /** The current step, zero-based. Controlled; pair it with `onStepChange`. */
  stepIndex?: number;
  /** The step a tour that manages its own state starts on each time it opens. Default `0`. */
  defaultStepIndex?: number;
  /** Called with the next step when the buttons or the arrow keys move. */
  onStepChange?: (index: number) => void;
  /** Called when the person leaves early. The tour does not close itself: set `open` to `false`. */
  onClose?: (reason: TourCloseReason) => void;
  /** Called when the person finishes the last step. Set `open` to `false` here. */
  onFinish?: () => void;
  labels: TourLabels;
  /** Space between the target and the edge of the spotlight, in pixels. Default `6`. */
  spotlightPadding?: number;
  /** The status of the current step's target, supplied by the host. Default `ready`. */
  targetStatus?: TourTargetStatus;
  /**
   * Finds a step's target in place of (and before) `target`. Return `null` to fall back to `target`. Called on every frame
   * while the tour shows, so keep it cheap. It receives the current step.
   */
  resolveTarget?: (step: TourStep) => Element | null;
  /** Tells the tour that the resolved element only stands in for the real target, so `standInNote` is appended. */
  isStandIn?: (element: Element, step: TourStep) => boolean;
  /** Layout switches for a target inside an open modal `dialog`. */
  dialogLayout?: TourDialogLayout;
  /**
   * Below 40rem, while a text field outside the card has focus, set `data-compact` on the card (CSS then hides the body) so
   * the card does not cover the field being filled. It settles 300 ms after focus leaves and never changes mid-press.
   * Default `false`.
   */
  compactOnTyping?: boolean;
  /** Whether the card has its close button. Default `true`. */
  showCloseButton?: boolean;
  /**
   * Keep the skip button (`labels.skip`, calling `onClose("skip")`) on the last step, next to the finish button, so a host that
   * always offers an explicit leave action keeps it there. Default `false`. Independently of this prop, a last step in `do`
   * mode shows the skip button when `showCloseButton` is `false`, because that step has no finish button and would
   * otherwise have no action at all.
   */
  skipOnLastStep?: boolean;
  /** Whether Escape calls `onClose("escape")`. Default `true`. */
  closeOnEscape?: boolean;
  /** Whether the arrow keys step while focus is on the card. Default `true`. */
  arrowKeyNavigation?: boolean;
};

/** Below this width (in rem) the card is a sheet docked to the bottom or top edge instead of floating by the target. */
const NARROW_REM = 40;
const SHEET_GAP = 12;

const isShown = (element: Element) => {
  if (element.getClientRects().length === 0) return false;
  const style = getComputedStyle(element);
  return style.visibility !== "hidden" && style.display !== "none";
};

/** The element a step points at, or `null` when there is none or it is not visible. */
function resolveTarget(target: TourStep["target"]): Element | null {
  if (!target) return null;
  if (typeof target !== "string") {
    const element = target.current;
    return element && element.isConnected && isShown(element) ? element : null;
  }
  try {
    return Array.from(document.querySelectorAll(target)).find(isShown) ?? null;
  } catch {
    // An invalid selector is a missing target, not a crash in the middle of a render.
    return null;
  }
}

/** The element a step points at: the host's resolver first, then the step's own `target`. */
function findTarget(
  step: TourStep | undefined,
  resolver?: (step: TourStep) => Element | null,
): Element | null {
  if (!step) return null;
  const custom = resolver?.(step);
  if (custom && custom.isConnected && isShown(custom)) return custom;
  return resolveTarget(step.target);
}

/** A text field that holds what the person is typing: a text-like input, a textarea or an editable region. */
function isTextEntry(element: Element | null): boolean {
  if (!element) return false;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  return element.matches(
    "input:not([type=checkbox],[type=radio],[type=button],[type=submit],[type=reset],[type=file],[type=range],[type=color],[type=image]),textarea",
  );
}

const hasValue = (element: Element) =>
  element instanceof HTMLElement && element.isContentEditable
    ? (element.textContent ?? "") !== ""
    : ((element as HTMLInputElement | HTMLTextAreaElement).value ?? "") !== "";

/** Marks a modal the tour has resized to make room for a phone sheet. */
const DOCKED = "data-lufia-tour-docked";

/**
 * Opt-in marker for a wrapper that fills a modal and has to be resized with it (a dialog whose only child is a shell that
 * sets its own height). Only a direct child carrying it is resized; a header, body or footer never is.
 */
const SHELL = "data-lufia-tour-shell";

/** The modal the tour is portalled into, or `null` when it sits on the page (the body). */
const modalOf = (element: Element): HTMLElement | null => {
  const host = portalHost(element);
  return host === document.body ? null : host;
};

/**
 * The modal's own header and footer bars: direct children of the modal, or of a marked shell. A `header` or `footer` deeper
 * in the content (a card, an article) is content, not a bar.
 */
function modalBars(modal: Element): { header: Element | null; footer: Element | null } {
  const shell = modal.querySelector(`:scope > [${SHELL}]`);
  const find = (tag: "header" | "footer") =>
    modal.querySelector(`:scope > ${tag}`) ?? shell?.querySelector(`:scope > ${tag}`) ?? null;
  return { header: find("header"), footer: find("footer") };
}

function setDock(modal: HTMLElement, size: number) {
  const sized = [modal, ...Array.from(modal.querySelectorAll<HTMLElement>(`:scope > [${SHELL}]`))];
  for (const element of sized) {
    if (size > 0) {
      // Inline and important: a component stylesheet cannot reach another component's modal.
      const height = `calc(100dvh - ${size}px)`;
      element.style.setProperty("height", height, "important");
      element.style.setProperty("max-height", height, "important");
    } else {
      element.style.removeProperty("height");
      element.style.removeProperty("max-height");
    }
  }
  // A sheet is anchored to the bottom edge (auto margin above it): the bottom margin lifts it clear of the card.
  if (size > 0) modal.style.setProperty("margin-block-end", `${size}px`, "important");
  else modal.style.removeProperty("margin-block-end");
  if (size > 0) modal.setAttribute(DOCKED, "");
  else modal.removeAttribute(DOCKED);
}

/** The element that scrolls `element`: a scrollable ancestor, else the page. */
function scrollParent(element: Element): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight)
      return node;
  }
  return document.scrollingElement ?? document.documentElement;
}

/** Brings the target into view, and clear of the card when the card is a sheet. Does nothing when it is already placed. */
function revealTarget(target: Element | null, card: HTMLElement | null, smooth: boolean, dock = false) {
  if (!target || !target.isConnected) return;
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const rect = target.getBoundingClientRect();
  if (width <= NARROW_REM * rem) {
    let reserve = card?.offsetHeight ?? 0;
    let top = SHEET_GAP;
    const dialog = dock ? modalOf(target) : null;
    if (dialog) {
      // The target must also clear the dialog's own header and footer: the footer sits above the card once the dialog has
      // shrunk to make room for it.
      const bars = modalBars(dialog);
      const header = bars.header?.getBoundingClientRect().bottom;
      const footer = bars.footer?.getBoundingClientRect();
      const fullScreen = dialog.getBoundingClientRect().height >= height - 2;
      if (header) top = header + SHEET_GAP;
      reserve =
        footer && dialog.hasAttribute(DOCKED)
          ? height - footer.top
          : reserve + (fullScreen ? (footer?.height ?? 0) : 0);
    }
    const limit = height - reserve - SHEET_GAP;
    const delta =
      rect.top < top
        ? rect.top - top
        : rect.bottom > limit
          ? Math.min(rect.bottom - limit, rect.top - top)
          : 0;
    if (delta) scrollParent(target).scrollBy({ top: delta, behavior });
  } else if (rect.top < 0 || rect.bottom > height || rect.left < 0 || rect.right > width) {
    if (typeof target.scrollIntoView === "function")
      target.scrollIntoView({ block: "center", inline: "nearest", behavior });
  }
}

type LayoutParts = { layer: HTMLElement; card: HTMLElement; spot: HTMLElement };
type LayoutOptions = { dialog: HTMLElement | null; layout: TourDialogLayout };

/** Which side of `dialog` the card fits on (`end` first), or `null` when neither has room. */
function besideDialog(dialog: Element, card: HTMLElement): Side | null {
  const rect = dialog.getBoundingClientRect();
  const width = document.documentElement.clientWidth;
  const need = card.offsetWidth + 24;
  const rtl = getComputedStyle(card).direction === "rtl";
  const after = rtl ? rect.left : width - rect.right;
  const before = rtl ? width - rect.right : rect.left;
  if (after >= need) return "end";
  if (before >= need) return "start";
  return null;
}

/**
 * Puts the spotlight on the target and the card next to it (or in the middle, or docked as a sheet on narrow screens),
 * writing straight to the DOM so a frame loop can run it without rendering. Returns a signature of what it measured: when
 * the next frame measures the same, nothing has moved and there is nothing to write.
 */
function layoutTour(
  { layer, card, spot }: LayoutParts,
  target: Element | null,
  placement: Side,
  padding: number,
  previous: string,
  { dialog, layout }: LayoutOptions,
): string {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const narrow = width <= NARROW_REM * rem;
  const rect = target ? target.getBoundingClientRect() : null;
  // On a phone, a dialog that fills the screen (or that the tour already shrank) gives way to the sheet.
  const docked =
    narrow &&
    layout.dock === true &&
    dialog !== null &&
    (dialog.hasAttribute(DOCKED) || dialog.getBoundingClientRect().height >= height - 2);
  if (dialog && layout.dock) setDock(dialog, docked ? card.offsetHeight : 0);
  // The spotlight stops where the dialog's scroll area does.
  let visible = rect;
  if (rect && target && dialog && layout.clipSpotlight) {
    const parent = scrollParent(target);
    if (parent !== document.scrollingElement && parent !== document.documentElement) {
      const clip = parent.getBoundingClientRect();
      let from = clip.top;
      let to = clip.bottom;
      // Sticky bars inside the scroller cover its ends: the scroll area is what is left between them.
      const bars = modalBars(dialog);
      if (bars.header && parent.contains(bars.header))
        from = Math.max(from, bars.header.getBoundingClientRect().bottom);
      if (bars.footer && parent.contains(bars.footer))
        to = Math.min(to, bars.footer.getBoundingClientRect().top);
      const top = Math.max(rect.top, from);
      const bottom = Math.min(rect.bottom, to);
      if (bottom > top) visible = new DOMRect(rect.left, top, rect.width, bottom - top);
    }
  }
  const signature = [
    visible ? [visible.left, visible.top, visible.width, visible.height].join(" ") : "none",
    docked,
    width,
    height,
    card.offsetWidth,
    card.offsetHeight,
    placement,
    padding,
  ].join(",");
  if (signature === previous) return previous;
  if (visible) {
    spot.style.transform = `translate(${visible.left - padding}px, ${visible.top - padding}px)`;
    spot.style.inlineSize = `${visible.width + 2 * padding}px`;
    spot.style.blockSize = `${visible.height + 2 * padding}px`;
  }
  layer.setAttribute("data-target", rect ? "true" : "false");
  if (narrow) {
    clearPanelPlacement(card);
    const covered = !docked && rect !== null && rect.bottom > height - card.offsetHeight - SHEET_GAP;
    card.setAttribute("data-kind", "sheet");
    card.setAttribute("data-edge", covered ? "top" : "bottom");
  } else if (target) {
    card.setAttribute("data-kind", "float");
    card.removeAttribute("data-edge");
    const beside = dialog && layout.beside ? besideDialog(dialog, card) : null;
    // The gap clears the spotlight's padding as well.
    if (dialog && beside) placePanel(card, dialog, { side: beside, align: "center", gap: 0.75 });
    else placePanel(card, target, { side: placement, align: "center", gap: 0.5 + padding / rem });
  } else {
    clearPanelPlacement(card);
    card.setAttribute("data-kind", "center");
    card.removeAttribute("data-edge");
  }
  return signature;
}

/**
 * A guided tour: a card that walks through `steps`, with a spotlight on each step's target. It is non-modal: the spotlight
 * only dims the page, it does not block it, so the person can use the highlighted control (or any other) while the card
 * stays. Nothing is made inert and scroll is not locked.
 *
 * The card follows its target on scroll, resize and layout changes, scrolls it into view when it is off screen, and becomes a
 * centred card when the target is missing or hidden. Below 40rem it is a sheet docked to the bottom edge (the top edge when
 * the target would be under it) and the target is scrolled clear of it. When the target is inside an open modal, the tour is
 * portalled into that modal, so the modal's inert page does not lock it out.
 *
 * The component keeps no record of what was seen: the app decides when to open it and stores the outcome from `onFinish` and
 * `onClose`.
 */
export function Tour({
  steps,
  open,
  stepIndex,
  defaultStepIndex = 0,
  onStepChange,
  onClose,
  onFinish,
  labels,
  spotlightPadding = 6,
  targetStatus = "ready",
  resolveTarget: resolver,
  isStandIn,
  dialogLayout,
  compactOnTyping = false,
  showCloseButton = true,
  closeOnEscape = true,
  skipOnLastStep = false,
  arrowKeyNavigation = true,
  className,
  onKeyDown,
  onFocus,
  onBlur,
  onAnimationEnd,
  ...rest
}: TourProps) {
  const [inner, setInner] = useState(defaultStepIndex);
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const layerRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const focusInside = useRef(false);
  const closeRef = useRef(onClose);
  const resolverRef = useRef(resolver);
  const escapeRef = useRef(closeOnEscape);
  const standInRef = useRef(isStandIn);
  const [compact, setCompact] = useState(false);
  const [standIn, setStandIn] = useState(false);
  const ids = useId();
  const reduced = usePrefersReducedMotion();

  // False on the server and during hydration: a portal cannot be rendered there.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const showing = open && steps.length > 0;
  const { phase, finish } = usePresence(showing, cardRef);
  const present = phase !== "unmounted";
  // A tour that manages its own step starts over the next time it opens, once the last one has left the screen.
  if (!present && stepIndex === undefined && inner !== defaultStepIndex) setInner(defaultStepIndex);

  const last = steps.length - 1;
  const current = Math.min(Math.max(stepIndex ?? inner, 0), Math.max(last, 0));
  const step = steps[current];
  const target = step?.target;
  const dock = dialogLayout?.dock === true;
  const beside = dialogLayout?.beside === true;
  const clipSpotlight = dialogLayout?.clipSpotlight === true;
  const placement = step?.placement ?? "bottom";
  const atLast = current >= last;

  // Where the tour is portalled: the open modal that holds the target, else the body. Looked up again when it changes.
  const host = present && mounted ? portalHost(findTarget(step, resolver) ?? document.body) : null;

  // What the frame loop and the effects read, kept current before they run so they need not restart for a new function.
  const stepRef = useRef(step);
  useLayoutEffect(() => {
    stepRef.current = step;
    resolverRef.current = resolver;
    standInRef.current = isStandIn;
  });
  const lookup = useCallback(() => findTarget(stepRef.current, resolverRef.current), []);

  useEffect(() => {
    closeRef.current = onClose;
    escapeRef.current = closeOnEscape;
  });

  // Registers on the shared overlay stack, so Escape reaches the topmost layer only: a menu opened from the page closes
  // first and the tour on the next press. Escape is the tour's only when focus is on the card or nowhere in particular; in a
  // field of the page it belongs to the field.
  useEffect(() => {
    if (!showing) return;
    const layer = pushLayer();
    const onEscape = (event: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || !escapeRef.current || !isTopLayer(layer))
        return;
      const active = document.activeElement;
      if (active && active !== document.body && !cardRef.current?.contains(active)) return;
      event.preventDefault();
      closeRef.current?.("escape");
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      removeLayer(layer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [showing]);

  useLayoutEffect(() => {
    hostRef.current = host;
  });

  // The element that had focus when the tour opened, so closing can hand it back.
  useEffect(() => {
    if (showing)
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, [showing]);

  // Closed while focus was on the card (or nowhere, the card having just left the DOM): back to where it was.
  useLayoutEffect(() => {
    if (showing) return;
    const inside = focusInside.current || cardRef.current?.contains(document.activeElement);
    focusInside.current = false;
    const back = opener.current;
    opener.current = null;
    if (inside && back?.isConnected) back.focus({ preventScroll: true });
  }, [showing]);

  // Each step starts on its heading, so a screen reader reads the new card. The page is not scrolled for it. Not while the
  // person is typing in a field of the page: moving focus away from a field that holds a value loses their place.
  useEffect(() => {
    if (!showing || !host) return;
    const active = document.activeElement;
    const typing =
      active !== null && !cardRef.current?.contains(active) && isTextEntry(active) && hasValue(active);
    if (!typing) headingRef.current?.focus({ preventScroll: true });
  }, [showing, host, current]);

  // A phone shows a compact card while a text field of the page has focus (the keyboard is up). Growing back is delayed and
  // never happens mid-press, so the layout does not move under a finger between pressing a button and its click.
  useEffect(() => {
    if (!showing || !compactOnTyping) return;
    let timer = 0;
    let pressed = false;
    const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const narrow = () => document.documentElement.clientWidth <= NARROW_REM * rem();
    const field = (element: Element | null) =>
      element !== null && isTextEntry(element) && !cardRef.current?.contains(element);
    const settle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!pressed) setCompact(field(document.activeElement) && narrow());
      }, 300);
    };
    const onIn = (event: FocusEvent) => {
      if (field(event.target as Element | null) && narrow()) {
        window.clearTimeout(timer);
        setCompact(true);
      } else settle();
    };
    const onDown = () => {
      pressed = true;
    };
    const onUp = () => {
      pressed = false;
      settle();
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", settle);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointercancel", onUp, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", settle);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointercancel", onUp, true);
      setCompact(false);
    };
  }, [showing, compactOnTyping]);

  // The theme scope, direction and inline custom properties of the target's subtree, copied onto a card that left it.
  useLayoutEffect(() => {
    const element = host ? lookup() : null;
    if (host && element instanceof HTMLElement && layerRef.current)
      inheritContext(element, layerRef.current, host);
  }, [host, target, current, lookup]);

  // Once per step, and again after the page has settled (a scroll that was still running, a dialog that was animating in).
  useEffect(() => {
    if (!showing || !host) return;
    const reveal = () => revealTarget(lookup(), cardRef.current, !reduced, dock);
    reveal();
    const again = window.setTimeout(reveal, 400);
    return () => window.clearTimeout(again);
  }, [showing, host, target, current, reduced, dock, lookup]);

  // Follows the target: before paint, then every frame while the tour is on screen, so scroll, resize and animation all keep
  // the spotlight and the card on it. A frame that measures what the last one did writes nothing.
  useLayoutEffect(() => {
    if (!present || !host) return;
    let signature = "";
    const run = () => {
      const { current: layer } = layerRef;
      const { current: card } = cardRef;
      const { current: spot } = spotRef;
      if (!layer || !card || !spot) return;
      const found = lookup();
      // Read every frame, so a stand-in that turns into the real target (a menu that opens) drops its note.
      const stand =
        found !== null &&
        stepRef.current !== undefined &&
        standInRef.current?.(found, stepRef.current) === true;
      setStandIn((previous) => (previous === stand ? previous : stand));
      if (found && portalHost(found) !== hostRef.current) return rerender();
      signature = layoutTour({ layer, card, spot }, found, placement, spotlightPadding, signature, {
        dialog: hostRef.current && hostRef.current !== document.body ? hostRef.current : null,
        layout: { dock, beside, clipSpotlight },
      });
    };
    run();
    let frame = 0;
    const loop = () => {
      run();
      // lufia-motion-allow reduced-motion: the frame only reads layout and moves the spotlight; nothing animates here.
      frame = window.requestAnimationFrame(loop);
    };
    // lufia-motion-allow reduced-motion: same loop.
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(frame);
      // Hands a resized dialog back.
      if (host?.hasAttribute(DOCKED)) setDock(host, 0);
    };
  }, [present, host, target, current, placement, spotlightPadding, dock, beside, clipSpotlight, lookup]);

  const go = (next: number) => {
    if (next === current || next < 0 || next > last) return;
    if (stepIndex === undefined) setInner(next);
    onStepChange?.(next);
  };
  const forward = () => (atLast ? onFinish?.() : go(current + 1));
  const missing = targetStatus === "missing" || targetStatus === "blocked";
  // A `do` step waits for the person to act on the target: nothing moves it forward until the host says so, unless the
  // target is missing and the step can only be skipped.
  const doing = step?.mode === "do" && !missing;
  // The skip button leaves on every step but the last, on the last when asked for, and always when nothing else on the card
  // could end the tour (a last `do` step has no finish button; without the close button it would be a dead end).
  const showSkip = !atLast || skipOnLastStep || (doing && !showCloseButton);

  const onCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (
      !arrowKeyNavigation ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    // Arrow keys follow the reading direction.
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    if (event.key === (rtl ? "ArrowLeft" : "ArrowRight") && !atLast && !doing) {
      // The last step is finished with its button: an arrow key never ends the tour.
      event.preventDefault();
      go(current + 1);
    } else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft") && current > 0) {
      event.preventDefault();
      go(current - 1);
    }
  };

  if (!present || !host || !step) return null;
  const titleId = `${ids}-title`;
  const bodyId = `${ids}-body`;
  // Inside a modal the page is already dimmed by the modal's own backdrop.
  const dim = host === document.body;
  const showStandIn = targetStatus === "ready" && step.standInNote != null && standIn;
  const note = targetStatus === "seeking" ? labels.seeking : showStandIn ? step.standInNote : null;
  const body =
    targetStatus === "blocked"
      ? (labels.blocked ?? step.missingBody ?? step.body)
      : targetStatus === "missing"
        ? (step.missingBody ?? step.body)
        : step.body;
  return createPortal(
    <div
      ref={layerRef}
      className={styles.layer}
      data-lufia-part="layer"
      data-lufia-inert-exempt=""
      data-state={phase === "open" ? "open" : "closed"}
      data-dim={dim}
    >
      <div className={styles.scrim} aria-hidden="true" />
      <div ref={spotRef} className={styles.spot} aria-hidden="true" data-lufia-part="spotlight" />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the card owns arrow-key stepping and focus bookkeeping for what is inside it */}
      <div
        {...rest}
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={[styles.card, className].filter(Boolean).join(" ")}
        data-lufia-part="card"
        data-mode={step.mode ?? "read"}
        data-status={targetStatus}
        data-compact={compact ? "" : undefined}
        data-state={phase === "open" ? "open" : "closed"}
        inert={phase !== "open" || undefined}
        onKeyDown={onCardKeyDown}
        onFocus={(event) => {
          focusInside.current = true;
          onFocus?.(event);
        }}
        onBlur={(event) => {
          // Only focus that lands on another element counts as leaving: a null target is the card going inert or leaving
          // the DOM, which is exactly when focus has to be handed back.
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
            focusInside.current = false;
          onBlur?.(event);
        }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) finish();
          onAnimationEnd?.(event);
        }}
      >
        <div className={styles.header}>
          <p className={styles.count}>{labels.stepOf(current + 1, steps.length)}</p>
          {showCloseButton ? (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={labels.close}
              icon={<CloseIcon />}
              onClick={() => onClose?.("close")}
            />
          ) : null}
        </div>
        <div key={current} className={styles.content}>
          <h2 ref={headingRef} id={titleId} tabIndex={-1} className={styles.title}>
            {step.title}
          </h2>
          <div id={bodyId} className={styles.body} aria-live="polite">
            {body}
            {note ? <p className={styles.note}>{note}</p> : null}
          </div>
          {doing && targetStatus === "ready" && labels.doHint ? (
            <p className={styles.hint}>{labels.doHint}</p>
          ) : null}
        </div>
        <div className={styles.actions}>
          {showSkip ? (
            <Button variant="ghost" size="sm" onClick={() => onClose?.("skip")}>
              {labels.skip}
            </Button>
          ) : null}
          <span className={styles.spacer} />
          {current > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => go(current - 1)}>
              {labels.back}
            </Button>
          ) : null}
          {doing ? null : (
            <Button variant="primary" size="sm" onClick={forward}>
              {atLast ? labels.finish : step.mode === "do" && labels.skipStep ? labels.skipStep : labels.next}
            </Button>
          )}
        </div>
      </div>
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {labels.stepOf(current + 1, steps.length)}
      </VisuallyHidden>
    </div>,
    host,
  );
}
