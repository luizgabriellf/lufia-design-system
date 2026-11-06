import type { SVGAttributes } from "react";
import styles from "./SuccessCheck.module.css";

export type SuccessCheckProps = Omit<
  SVGAttributes<SVGSVGElement>,
  "width" | "height" | "viewBox" | "children"
> & {
  /** Rendered width and height, in px. */
  size?: number;
};

/**
 * A check mark whose stroke draws in once when it appears. Decorative (`aria-hidden`): the text next to it says what
 * happened, so never use it as the only signal. Under `prefers-reduced-motion` it is simply drawn.
 */
export function SuccessCheck({ size = 16, className, ...rest }: SuccessCheckProps) {
  return (
    <svg
      focusable="false"
      aria-hidden="true"
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path className={styles.path} pathLength={1} d="M3.5 8.5 6.8 11.5 12.5 4.8" />
    </svg>
  );
}
