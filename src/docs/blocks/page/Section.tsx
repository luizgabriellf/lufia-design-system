import { Unstyled } from "@storybook/addon-docs/blocks";
import type { ReactNode } from "react";
import { SECTIONS, sectionDomId, type SectionId } from "./sections";
import styles from "./DocPage.module.css";

const ORDER = Object.keys(SECTIONS) as SectionId[];

/** One anchored section of a component page. The heading is a styled h2; the body keeps Storybook's prose styles. */
export function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  return (
    <section id={sectionDomId(id)} className={styles.section} aria-labelledby={`${id}-heading`}>
      <Unstyled>
        <h2 id={`${id}-heading`} className={styles.sectionTitle}>
          <span className={styles.sectionIndex} aria-hidden="true">
            {String(ORDER.indexOf(id) + 1).padStart(2, "0")}
          </span>
          {SECTIONS[id]}
        </h2>
      </Unstyled>
      {children}
    </section>
  );
}
