import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./Skeleton.module.css";

export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** `text` is one line of text, `rect` a block, `circle` an avatar. */
  variant?: "text" | "rect" | "circle";
  /** CSS length. Give the size of the content that will replace the placeholder so nothing jumps. */
  width?: string;
  /** CSS length. Text defaults to one line height. */
  height?: string;
  /** Turn the shimmer off. It also stops under `prefers-reduced-motion`. */
  still?: boolean;
  /**
   * Accessible name for the loading state, for example "Loading invoices". Set it on one skeleton per loading region:
   * it renders a polite status message. Without it the skeleton is hidden from assistive technology.
   */
  label?: string;
};

/** A placeholder that holds the shape of content while it loads, with a calm shimmer. */
export function Skeleton({
  variant = "text",
  width,
  height,
  still = false,
  label,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const sized = { ...style, "--skeleton-width": width, "--skeleton-height": height } as CSSProperties;
  return (
    <span
      {...rest}
      role={label ? "status" : undefined}
      aria-hidden={label ? undefined : true}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={sized}
      data-variant={variant}
      data-still={still ? "" : undefined}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
    </span>
  );
}
