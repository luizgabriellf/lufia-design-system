"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { useLufia } from "../LufiaProvider";
import styles from "./MobileFloatBar.module.css";

export type MobileFloatBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Accessible name of the bar. */
  label: string;
  /** `MobileFloatBarButton` and `MobileFloatBarSeparator`, in reading order. */
  children: ReactNode;
};

/**
 * A pill of the few actions a phone needs within thumb reach, floating above the page: search, the page's main action,
 * and the menu. Fixed to the bottom of the screen, clear of the safe area, translucent where the browser can blur.
 * It only exists below the shell's breakpoint.
 *
 * It is a labelled group, not an ARIA toolbar: a toolbar promises arrow-key movement, and here every control is a
 * plain tab stop.
 */
export function MobileFloatBar({ label, className, children, ...rest }: MobileFloatBarProps) {
  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      className={[styles.bar, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

type FloatButtonBase = {
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
    const { onClick } = rest as { onClick?: () => void };
    return (
      <Link href={href} className={classes} data-variant={variant} onClick={onClick}>
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
