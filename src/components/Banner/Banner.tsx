import type { HTMLAttributes, ReactNode } from "react";
import { CloseIcon } from "../Icon/icons";
import { StatusIcon, type StatusTone } from "../StatusIcon/StatusIcon";
import styles from "./Banner.module.css";

/** The meaning of a banner. Each one has its own icon shape and colour, so none relies on colour alone. */
export type BannerVariant = "info" | "success" | "warning" | "danger" | "neutral";

/** Every variant, in display order: for galleries and tests. */
export const BANNER_VARIANTS: readonly BannerVariant[] = ["info", "success", "warning", "danger", "neutral"];

/**
 * How a screen reader hears the banner. `polite` is `role="status"`, `assertive` is `role="alert"`, `off` sets no role: for
 * a message that is already on the page at load and must not interrupt.
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
  /** `md` (default) or `compact`: less padding and a smaller icon, for a banner inside a card or a dense form. */
  size?: "md" | "compact";
  /**
   * Overrides how the banner is announced. Default: `assertive` (`role="alert"`) for `warning` and `danger`, `polite`
   * (`role="status"`) for the others.
   */
  live?: BannerLive;
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

const ROLE: Record<BannerLive, "status" | "alert" | undefined> = {
  polite: "status",
  assertive: "alert",
  off: undefined,
};

/**
 * An inline message for a page or a section: a note above a form, a warning that access expires, a failed sync. It stays in
 * the flow, never takes focus and is not dismissed by a timer. For a message that confirms an action and leaves by itself use
 * `Toast`; for a short label use `Badge`; for an empty list use `EmptyState`.
 */
export function Banner({
  variant = "info",
  title,
  children,
  icon,
  action,
  size = "md",
  live,
  animateIn = false,
  onDismiss,
  dismissLabel,
  className,
  ...rest
}: BannerProps) {
  const announce = live ?? (variant === "warning" || variant === "danger" ? "assertive" : "polite");
  return (
    <div
      role={ROLE[announce]}
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-animate-in={animateIn || undefined}
    >
      {icon === null ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon === undefined ? (
            <StatusIcon tone={STATUS[variant]} size={size === "compact" ? "sm" : "md"} />
          ) : (
            icon
          )}
        </span>
      )}
      <div className={styles.body}>
        <div className={styles.text}>
          {title ? <div className={styles.title}>{title}</div> : null}
          {children ? <div className={styles.description}>{children}</div> : null}
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
