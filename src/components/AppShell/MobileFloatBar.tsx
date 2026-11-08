"use client";

import { useRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { useLufia } from "../LufiaProvider";
import { useVisualViewportOffset } from "./useVisualViewportOffset";
import styles from "./MobileFloatBar.module.css";

export type MobileFloatBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Accessible name of the bar. */
  label: string;
  /** `MobileFloatBarButton` and `MobileFloatBarSeparator`, in reading order. */
  children: ReactNode;
  /**
   * Follow the visual viewport: when the on-screen keyboard or a browser toolbar covers the bottom of the page (iOS
   * Safari keeps `position: fixed` on the layout viewport, behind them), the bar moves up above it, once per frame. Does
   * nothing where `window.visualViewport` does not exist, and while the page is pinch-zoomed. Default `true`.
   */
  followViewport?: boolean;
  /**
   * Fade the page into the canvas behind the bar: a full-width gradient from a little above the bar to the bottom edge of
   * the screen, so content scrolling under it does not end in a hard edge. It is part of the bar (shown while the bar is,
   * lifted with it, never catches a tap). Tune it with `--lufia-float-bar-scrim-block-size` (default `6rem`, plus the safe
   * area), `--lufia-float-bar-scrim-color` (default `--lufia-color-bg-canvas`) and `--lufia-float-bar-scrim-stop` (where
   * the gradient reaches the colour, default `65%`). Default `true`.
   */
  scrim?: boolean;
};

/**
 * A pill of the few actions a phone needs within thumb reach, floating above the page: search, the page's main action,
 * and the menu. Fixed to the bottom of the screen, clear of the safe area, translucent where the browser can blur, over a
 * scrim that fades the page into the canvas behind it. It only exists below the shell's breakpoint.
 *
 * It is a labelled group, not an ARIA toolbar: a toolbar promises arrow-key movement, and here every control is a
 * plain tab stop.
 */
export function MobileFloatBar({
  label,
  followViewport = true,
  scrim = true,
  className,
  children,
  ...rest
}: MobileFloatBarProps) {
  const bar = useRef<HTMLDivElement>(null);
  useVisualViewportOffset(bar, followViewport);
  return (
    <div
      {...rest}
      ref={bar}
      role="group"
      aria-label={label}
      className={[styles.bar, className].filter(Boolean).join(" ")}
      data-scrim={scrim || undefined}
    >
      {scrim ? <span className={styles.scrim} aria-hidden="true" data-lufia-part="float-bar-scrim" /> : null}
      {children}
    </div>
  );
}

/** `data-*` attributes, passed through to the control: analytics hooks, guided-tour anchors. */
export type FloatBarDataAttributes = { [name: `data-${string}`]: string | number | boolean | undefined };

type FloatButtonBase = FloatBarDataAttributes & {
  /** The accessible name. Shown as text on `search` and `primary`, hidden on `icon`. */
  label: string;
  /** `search` is a wide, quiet button; `primary` is the filled pill for the page's main action; `icon` is round. */
  variant?: "search" | "primary" | "icon";
  icon?: ReactNode;
};

export type MobileFloatBarButtonProps = FloatButtonBase &
  (
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">)
    | ({ href: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type" | "onClick"> & {
          onClick?: () => void;
        })
  );

/** A control of `MobileFloatBar`. A link through the configured `linkComponent` when it has an `href`, else a button. */
export function MobileFloatBarButton({
  label,
  variant = "search",
  icon,
  href,
  className,
  ...rest
}: MobileFloatBarButtonProps) {
  const { linkComponent: Link } = useLufia();
  const classes = [styles.button, className].filter(Boolean).join(" ");
  const content = (
    <>
      {icon ? (
        <span className={styles.glyph} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={styles.text}>{label}</span>
    </>
  );
  if (href !== undefined) {
    const { onClick, onPointerEnter, onFocus, ...others } = rest as {
      onClick?: () => void;
      onPointerEnter?: () => void;
      onFocus?: () => void;
    } & Record<string, unknown>;
    const data = Object.fromEntries(Object.entries(others).filter(([name]) => name.startsWith("data-")));
    return (
      <Link
        {...data}
        href={href}
        className={classes}
        data-variant={variant}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onFocus={onFocus}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      className={classes}
      data-variant={variant}
    >
      {content}
    </button>
  );
}

/** A hairline between two groups of controls. Decorative. */
export function MobileFloatBarSeparator() {
  return <span className={styles.separator} aria-hidden="true" />;
}
