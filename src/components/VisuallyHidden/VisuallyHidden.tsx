import type { HTMLAttributes } from "react";
import styles from "./VisuallyHidden.module.css";

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

/** Content that screen readers read and sighted users never see. It takes no space in the layout. */
export function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span {...rest} className={[styles.root, className].filter(Boolean).join(" ")} />;
}
