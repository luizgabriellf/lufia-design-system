"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { CloseIcon } from "../Icon/icons";
import { StatusIcon, type StatusTone } from "../StatusIcon/StatusIcon";
import styles from "./Banner.module.css";

/** The meaning of a banner. Each one has its own icon shape and colour, so none relies on colour alone. */
export type BannerVariant = "info" | "success" | "warning" | "danger" | "neutral";

/** Every variant, in display order: for galleries and tests. */
export const BANNER_VARIANTS: readonly BannerVariant[] = ["info", "success", "warning", "danger", "neutral"];

/**
 * How a screen reader hears the banner. `polite` is `role="status"`, `assertive` is `role="alert"`, `off` is `role="note"`:
 * static guidance that is already on the page at load and must not be announced as a live region.
 */
export type BannerLive = "polite" | "assertive" | "off";

export type BannerProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "role" | "children"> & {
  /** `info` (default), `success`, `warning`, `danger` or `neutral`. Sets the colour, the default icon and the default `live`. */
  variant?: BannerVariant;
  /** A short heading for the message. Optional: a one-line banner can be only `children`. */
  title?: ReactNode;
  /** The message. Keep it to a sentence or two; link or act through `action`. */
  children?: ReactNode;
  /**
   * The leading icon. Left out, it is the status icon of the variant. Pass your own node to replace it, or `null` for none
   * (then the title or text must say what kind of message it is). Always hidden from assistive technology.
   */
  icon?: ReactNode;
  /** Buttons or links for the next step. They sit beside the text, and below it when the banner is narrow. */
  action?: ReactNode;
  /** Adds a dismiss button. The banner does not remove itself: unmount it, or collapse it, in this handler. */
  onDismiss?: () => void;
  /** The accessible name of the dismiss button, in your language. Required with `onDismiss`: the package has no copy, and an unnamed button fails axe. */
  dismissLabel?: string;
  /**
   * `md` (default), `compact` (less padding and a smaller icon, for a banner inside a card or a dense form) or `inline`
   * (no card chrome: a tone-coloured start border on a subtle tone background, no minimum height, for guidance between
   * form fields).
   */
  size?: "md" | "compact" | "inline";
  /**
   * A bold lead-in rendered inline before `children`, in the same paragraph ("Note: ..."). It does not add a title row.
   * Say the kind of message in words; do not rely on the icon or the colour.
   */
  lead?: ReactNode;
  /**
   * Overrides how the banner is announced. Default: `assertive` (`role="alert"`) for `warning` and `danger`, `polite`
   * (`role="status"`) for the others.
   */
  live?: BannerLive;
  /**
   * Moves focus to the banner once, when it mounts (it gets `tabIndex={-1}`, so it is focusable by script but not a tab
   * stop). For a message that replaces what the person was just doing, such as a failed submit above a form, so a keyboard
   * or screen reader user lands on it. It does not take focus again when the banner re-renders or when this prop changes.
   * Default `false`: a banner never takes focus. See `live` for the announcement; use this one or the other for the same
   * message, not both.
   */
  focusOnMount?: boolean;
  /** The root element, for measuring, scrolling to it or moving focus yourself. */
  ref?: Ref<HTMLDivElement>;
  /** Plays the enter motion (a short fade and slide) when the banner mounts. Default `false`: a banner already on the page at load stays still. */
  animateIn?: boolean;
};

const STATUS: Record<BannerVariant, StatusTone> = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
  neutral: "neutral",
};

const ROLE: Record<BannerLive, "status" | "alert" | "note"> = {
  polite: "status",
  assertive: "alert",
  off: "note",
};

/**
 * An inline message for a page or a section: a note above a form, a warning that access expires, a failed sync. It stays in
 * the flow, does not take focus unless `focusOnMount` asks for it, and is not dismissed by a timer. For a message that confirms an action and leaves by itself use
 * `Toast`; for a short label use `Badge`; for an empty list use `EmptyState`.
 */
export function Banner({
  variant = "info",
  title,
  children,
  icon,
  action,
  size = "md",
  lead,
  live,
  animateIn = false,
  focusOnMount = false,
  onDismiss,
  dismissLabel,
  className,
  ref,
  ...rest
}: BannerProps) {
  const root = useRef<HTMLDivElement | null>(null);
  // Mount only, on purpose: a later render or a change of the prop must not pull focus back from where the person is.
  const shouldFocus = useRef(focusOnMount);
  useEffect(() => {
    if (shouldFocus.current) root.current?.focus();
  }, []);
  const announce = live ?? (variant === "warning" || variant === "danger" ? "assertive" : "polite");
  return (
    <div
      role={ROLE[announce]}
      tabIndex={focusOnMount ? -1 : undefined}
      {...rest}
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-animate-in={animateIn || undefined}
    >
      {icon === null ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon === undefined ? (
            <StatusIcon tone={STATUS[variant]} size={size === "md" ? "md" : "sm"} />
          ) : (
            icon
          )}
        </span>
      )}
      <div className={styles.body}>
        <div className={styles.text}>
          {title ? <div className={styles.title}>{title}</div> : null}
          {lead || children ? (
            <div className={styles.description}>
              {lead ? <strong className={styles.lead}>{lead}</strong> : null}
              {lead && children ? " " : null}
              {children}
            </div>
          ) : null}
        </div>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label={dismissLabel} onClick={onDismiss}>
          <CloseIcon size="sm" />
        </button>
      ) : null}
    </div>
  );
}
