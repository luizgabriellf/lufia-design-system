import type { DetailsHTMLAttributes, ReactNode } from "react";
import styles from "./Disclosure.module.css";

export type DisclosureProps = Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "summary" | "title"> & {
  /** The always visible label, rendered inside the native `<summary>`. Text or inline content; it is the control's name. */
  summary: ReactNode;
  /** The content that opens and closes. */
  children: ReactNode;
  /** Start open. The browser owns the state afterwards, so this works without JavaScript. */
  defaultOpen?: boolean;
  /**
   * Group name: details sharing a `name` open one at a time, natively. Browsers without support let several stay open,
   * which is harmless.
   */
  name?: string;
  /** `boxed` (default) draws a bordered surface; `plain` keeps only the summary row and the content. */
  variant?: "boxed" | "plain";
  /** `default` keeps the regular row height and padding; `compact` tightens the padding and the row, for dense lists and sidebars. */
  size?: "default" | "compact";
  /**
   * A secondary line under the summary, in the small muted style. It is inside the `<summary>`, so it is part of the
   * control's accessible name: keep it short.
   */
  description?: ReactNode;
  /**
   * Trailing content in the summary row before the indicator, such as a count or a status `Badge`. It is inside the
   * `<summary>`, so it is read as part of the control's name: give a purely decorative one `aria-hidden` yourself.
   */
  meta?: ReactNode;
  /** Class for the content wrapper. */
  panelClassName?: string;
  /** Class for the `<summary>` row, for an app that styles its own header (type size, colour, spacing). */
  summaryClassName?: string;
  /**
   * What sits at the end of the summary row. Omit it for the built-in chevron, which turns with the state; `null` shows
   * nothing; any other node (an icon, a count, text) replaces the chevron. A custom node does not turn: style it from the
   * state the browser exposes, such as `details[open] .your-class`. It is decorative and hidden from assistive technology,
   * so the summary text has to carry the meaning.
   */
  indicator?: ReactNode;
};

/**
 * A disclosure built on the native `<details>` and `<summary>`: it works without JavaScript and in a Server Component,
 * keeps the browser's keyboard behaviour (Enter or Space on the summary) and find-in-page, which opens a closed section
 * that holds the match. The chevron turns with the state, and where the browser supports it the content also slides open.
 * Pass `open` with `onToggle` to control it from a Client Component. `size="compact"` tightens the padding, `summaryClassName`
 * styles the row, and `indicator` replaces the chevron (or removes it with `null`).
 */
export function Disclosure({
  summary,
  children,
  defaultOpen,
  open,
  variant = "boxed",
  size = "default",
  className,
  panelClassName,
  summaryClassName,
  indicator,
  description,
  meta,
  ...rest
}: DisclosureProps) {
  return (
    <details
      {...rest}
      open={open ?? defaultOpen}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-indicator={indicator === undefined ? undefined : indicator === null ? "none" : "custom"}
    >
      <summary className={[styles.summary, summaryClassName].filter(Boolean).join(" ")}>
        {description ? (
          <span className={styles.heading}>
            <span>{summary}</span>
            <span className={styles.description}>{description}</span>
          </span>
        ) : (
          summary
        )}
        {meta ? <span className={styles.meta}>{meta}</span> : null}
        {indicator !== undefined && indicator !== null ? (
          <span className={styles.indicator} aria-hidden="true">
            {indicator}
          </span>
        ) : null}
      </summary>
      <div className={[styles.panel, panelClassName].filter(Boolean).join(" ")}>{children}</div>
    </details>
  );
}

/**
 * The look of `Disclosure` as class names, for an existing native `<details>` that an app does not want to rewrite:
 * `root` goes on the `<details>`, `summary` on its `<summary>` and, optionally, `panel` on a wrapper around the content.
 * The chevron is drawn by the `summary` class, so no extra element is needed.
 */
export const disclosureClasses = Object.freeze({
  root: styles.root!,
  summary: styles.summary!,
  panel: styles.panel!,
});
