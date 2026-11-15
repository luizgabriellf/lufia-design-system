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
  /** Class for the content wrapper. */
  panelClassName?: string;
};

/**
 * A disclosure built on the native `<details>` and `<summary>`: it works without JavaScript and in a Server Component,
 * keeps the browser's keyboard behaviour (Enter or Space on the summary) and find-in-page, which opens a closed section
 * that holds the match. The chevron turns with the state, and where the browser supports it the content also slides open.
 * Pass `open` with `onToggle` to control it from a Client Component.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen,
  open,
  variant = "boxed",
  className,
  panelClassName,
  ...rest
}: DisclosureProps) {
  return (
    <details
      {...rest}
      open={open ?? defaultOpen}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
    >
      <summary className={styles.summary}>{summary}</summary>
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
