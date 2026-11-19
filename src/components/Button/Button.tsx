"use client";

import { cloneElement, isValidElement } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { LufiaLink } from "../LufiaProvider";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonOwnProps = {
  /**
   * Visual weight. One `primary` per view; `danger` only for destructive actions. `link` is text with no fill, border or
   * padding, for an action inside a sentence or a quiet "show more"; it stays text-sized on touch screens, where a pseudo-element takes the touch.
   */
  variant?: ButtonVariant;
  /** Default `md`. With `variant="link"` the default is no size: the text inherits the font size around it. */
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
  /**
   * The element to render instead of the default `<button>` or link, for a link the `LufiaProvider` link component
   * cannot express: a router link with a route object or a locale, or a plain `<a>` that must skip the router. It
   * receives the button's class, state attributes, content and remaining props, and keeps its own props and `ref`; put
   * `href` on the element itself. It must render one anchor or button and pass what it receives through to it. It is
   * not natively disabled: `disabled` and `loading` mark it `aria-disabled` and ignore activation. Server Components: create
   * the element in a Client Component (an element passed from a Server Component can arrive as a lazy reference and
   * throws); build the button inside a small client component, or pass a plain `<a>`.
   */
  render?: ReactElement<RenderedElementProps>;
};

/** What the element given to `render` may already carry; the button merges its own values into these. */
type RenderedElementProps = {
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
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
 * stays a button. The look is the same for both. `render` swaps in an element of your own when neither fits.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "secondary",
    size = variant === "link" ? undefined : "md",
    loading = false,
    fullWidth = false,
    iconStart,
    iconEnd,
    render,
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
    "aria-busy": loading || props["aria-busy"] || undefined,
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

  if (render !== undefined) {
    // An element a Server Component passes can arrive as a lazy reference, which has no `props`.
    if (!isValidElement(render)) {
      throw new Error(
        "Button: `render` must be a React element created in a Client Component. An element passed from a Server " +
          "Component can arrive as a lazy reference. Build the button inside a small client component, or pass a plain `<a>`.",
      );
    }
    // `href` belongs on the element and `type` is a button-only default. A `ref` given here replaces the element's own.
    const { disabled, onClick, ...passed } = rest as Record<string, unknown> & {
      disabled?: boolean;
      onClick?: MouseEventHandler<HTMLElement>;
    };
    delete passed.href;
    delete passed.type;
    if (passed.ref === undefined) delete passed.ref;
    const inert = Boolean(disabled) || loading;
    const own = render.props;
    return cloneElement(
      render,
      {
        ...passed,
        className: [classes, own.className].filter(Boolean).join(" "),
        ...state,
        "aria-disabled": inert || undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          if (inert) {
            event.preventDefault();
            return;
          }
          own.onClick?.(event);
          onClick?.(event);
        },
      } as RenderedElementProps,
      content,
    );
  }

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
