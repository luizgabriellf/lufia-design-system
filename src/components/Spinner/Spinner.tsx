import type { HTMLAttributes } from "react";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Ring size, from the icon scale: 16, 20 or 24px. Default `md`. */
  size?: SpinnerSize;
  /**
   * The accessible name ("Loading results"). With it the spinner is a polite status region that assistive technology
   * reads. Without it the spinner is decorative (`aria-hidden`): use that when the surrounding control already says it is
   * busy, for example a button with `aria-busy` and its own label.
   */
  label?: string;
};

/**
 * A small inline loading ring. It takes the colour of the surrounding text (`currentcolor`), turns until the work is done
 * and stands still, ring and arc kept, under `prefers-reduced-motion`. It does not know about progress; for a known
 * amount use `ProgressBar`.
 */
export function Spinner({ size = "md", label, className, ...rest }: SpinnerProps) {
  return (
    <span
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-size={size}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {label ? <VisuallyHidden>{label}</VisuallyHidden> : null}
    </span>
  );
}
