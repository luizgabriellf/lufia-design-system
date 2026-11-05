import type { HTMLAttributes } from "react";
import styles from "./Collapse.module.css";

export type CollapseProps = HTMLAttributes<HTMLDivElement> & {
  /** Whether the content is expanded. */
  open: boolean;
};

/**
 * Expands and collapses content to its natural height without measuring it in JavaScript.
 *
 * The content stays in the DOM (so it is server-rendered), but while closed it is `inert`: not focusable, not in the accessibility tree. The trigger belongs to you: give it
 * `aria-expanded={open}` and `aria-controls` pointing at this element's `id`.
 */
export function Collapse({ open, className, children, ...rest }: CollapseProps) {
  return (
    <div
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-state={open ? "open" : "closed"}
      inert={!open}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
