"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonOwnProps = {
  /** Visual weight. One `primary` per view; `danger` only for destructive actions. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Shows a spinner in place of the content and ignores activation. The button keeps its width, stays focusable and
   * reports `aria-busy`. It is not natively disabled, so keyboard focus is not lost when the work starts.
   */
  loading?: boolean;
  /** Stretches to the full width of its container. */
  fullWidth?: boolean;
  /** Decorative icon before the label; hidden from assistive technology. */
  iconStart?: ReactNode;
  /** Decorative icon after the label; hidden from assistive technology. */
  iconEnd?: ReactNode;
};

type AsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & {
    href?: undefined;
    ref?: Ref<HTMLButtonElement>;
  };

type AsLink = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & {
    /** When present the button renders as a link (through the `LufiaProvider` link component). */
    href: string;
    /** A link cannot be natively disabled; this marks it `aria-disabled` and ignores activation. */
    disabled?: boolean;
    /** Forwarded to the anchor (the link component must forward its `ref`, as plain `<a>` and router links do). */
    ref?: Ref<HTMLAnchorElement>;
  };

export type ButtonProps = AsButton | AsLink;

/**
 * The action control. It renders a `<button>`, or a link when `href` is given, so navigation stays a link and an action
 * stays a button. The look is the same for both.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "secondary",
    size = "md",
    loading = false,
    fullWidth = false,
    iconStart,
    iconEnd,
    className,
    children,
    ...rest
  } = props;
  const classes = [styles.root, className].filter(Boolean).join(" ");
  const state = {
    "data-variant": variant,
    "data-size": size,
    "data-loading": loading || undefined,
    "data-full-width": fullWidth || undefined,
    "aria-busy": loading || undefined,
  };
  const content = (
    <>
      {iconStart ? (
        <span className={styles.icon} aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      {children !== undefined && children !== null ? <span className={styles.label}>{children}</span> : null}
      {iconEnd ? (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </>
  );

  if (props.href !== undefined) {
    const { href, disabled, onClick, ...anchor } = rest as Omit<AsLink, keyof ButtonOwnProps | "children">;
    const inert = Boolean(disabled) || loading;
    return (
      <LufiaLink
        {...anchor}
        href={href}
        className={classes}
        {...state}
        aria-disabled={inert || undefined}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (inert) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {content}
      </LufiaLink>
    );
  }

  const {
    type = "button",
    disabled,
    onClick,
    ref,
    ...button
  } = rest as Omit<AsButton, keyof ButtonOwnProps | "children">;
  return (
    <button
      {...button}
      ref={ref}
      type={type}
      className={classes}
      {...state}
      disabled={disabled}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {content}
    </button>
  );
}
