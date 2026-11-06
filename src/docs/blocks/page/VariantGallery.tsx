import { Unstyled } from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import styles from "./VariantGallery.module.css";

/** One tile of a gallery: a live render and the name of the prop value it shows. */
export function Variant({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className={styles.tile}>
      <div className={styles.stage}>{children}</div>
      <code className={styles.label}>{label}</code>
    </li>
  );
}

/** Every value of one prop side by side, so differences read at a glance. */
export function VariantGallery({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Unstyled>
      <ul className={styles.gallery} aria-label={label}>
        {children}
      </ul>
    </Unstyled>
  );
}
